import './styles.css';
import { Sounds } from './audio';
import {
  CARS_PER_LEVEL,
  Car,
  DefectId,
  Grade,
  LEVELS,
  NEEDED_TO_ADVANCE,
  defectPool,
  emissionLimit,
  findDefects,
  generateLevel,
  grade,
  imbalance,
  mulberry32,
  showComputed,
} from './game/inspection';
import { DICTS, LANGS, Lang, StationId, detectLang, num, saveLang } from './i18n';
import { H, Puff, W, drawCar, drawFront, drawHall, drawProbe, liftPosts, drawSmoke, exhaustPoint } from './render/draw';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const show = (id: string) => $(id).classList.remove('hidden');
const hide = (id: string) => $(id).classList.add('hidden');
const canvas = $<HTMLCanvasElement>('game');
const ctx = canvas.getContext('2d')!;
const frontCanvas = $<HTMLCanvasElement>('front');
const frontCtx = frontCanvas.getContext('2d')!;
const sounds = new Sounds();

const INSPECTION_YEAR = Math.max(2026, new Date().getFullYear());
const STATIONS: StationId[] = ['look', 'lights', 'lift', 'brakes', 'shake', 'smoke', 'insurance', 'vin'];

let lang: Lang = detectLang();
let T = DICTS[lang];
let unlocked = loadUnlocked();
let level = 1;
let cars: Car[] = [];
let index = 0;
let results: Grade[] = [];
let score = 0;
let totalCorrect = 0;
let totalCars = 0;
let deciding = false;
let ownerQuote = 0;

// station state
let station: StationId = 'look';
const visited = new Set<StationId>();
let lights = false;
let liftTarget = 0;
let lift = 0;
let revUntil = 0;
let rollersUntil = 0;
let driveStart = 0;
let driveDir: 'in' | 'out' = 'in';
const puffs: Puff[] = [];

function loadUnlocked(): number {
  try {
    return Math.min(LEVELS, Math.max(1, Number(localStorage.getItem('vizsga-unlocked')) || 1));
  } catch {
    return 1;
  }
}
function saveUnlocked(): void {
  try {
    localStorage.setItem('vizsga-unlocked', String(unlocked));
  } catch {
    // ignore
  }
}

function setupCanvas(c: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = w * dpr;
  c.height = h * dpr;
  const context = c.getContext('2d')!;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return context;
}
setupCanvas(canvas, W, H);
setupCanvas(frontCanvas, 240, 150);

const car = () => cars[index];

// ------------------------------------------------------------------ flow

function startLevel(n: number): void {
  sounds.unlock();
  level = n;
  cars = generateLevel(level, mulberry32(Date.now() % 1_000_000_007), INSPECTION_YEAR);
  index = 0;
  results = [];
  hide('title-screen');
  hide('level-screen');
  nextCarIn();
}

function nextCarIn(): void {
  station = 'look';
  visited.clear();
  visited.add('look');
  lights = false;
  liftTarget = 0;
  lift = 0;
  revUntil = 0;
  rollersUntil = 0;
  puffs.length = 0;
  deciding = false;
  driveDir = 'in';
  driveStart = performance.now();
  ownerQuote = Math.floor(Math.random() * T.ownerQuotes.length);
  $('stamp').classList.remove('visible');
  renderAll();
}

function decide(pass: boolean, reason?: DefectId): void {
  if (deciding) return;
  deciding = true;
  hide('reason-screen');
  const g = grade(car(), pass ? { pass: true } : { pass: false, reason: reason! }, INSPECTION_YEAR);
  results.push(g);
  score += g.points;
  totalCars++;
  if (g.correct) totalCorrect++;
  const stamp = $('stamp');
  stamp.textContent = pass ? T.pass.replace(/^\S+\s/, '') : T.fail.replace(/^\S+\s/, '');
  stamp.className = `stamp ${pass ? 'ok' : 'no'}`;
  void stamp.offsetWidth;
  stamp.classList.add('visible');
  sounds.play(pass ? 'stampOk' : 'stampFail');
  lights = false;
  liftTarget = 0;
  renderAll();
  window.setTimeout(() => {
    sounds.play(g.correct ? 'right' : 'wrong');
    showFeedback(g, pass, reason);
  }, 900);
}

function showFeedback(g: Grade, pass: boolean, reason?: DefectId): void {
  $('fb-icon').textContent = g.correct ? '✅' : g.verdictRight ? '🟡' : '❌';
  $('fb-title').textContent = g.correct
    ? pass
      ? T.rightPass
      : T.rightFail
    : g.verdictRight
      ? T.rightFailWrongReason
      : pass
        ? T.wrongPass
        : T.wrongFail;
  const body = $('fb-body');
  body.innerHTML = '';
  const section = (title: string, items: string[]) => {
    const h = document.createElement('h4');
    h.textContent = title;
    const ul = document.createElement('ul');
    for (const it of items) {
      const li = document.createElement('li');
      li.textContent = it;
      ul.append(li);
    }
    body.append(h, ul);
  };
  if (g.defects.length) section(T.realDefects, g.defects.map((d) => `${T.defects[d]}${d === reason ? ' ✔' : ''} – ${T.explain[d]}`));
  else {
    const p = document.createElement('p');
    p.textContent = T.noDefects;
    body.append(p);
  }
  if (g.decoys.length) section(T.traps, g.decoys.map((d) => T.decoys[d]));
  show('feedback-screen');
}

function afterFeedback(): void {
  hide('feedback-screen');
  driveDir = 'out';
  driveStart = performance.now();
  window.setTimeout(() => {
    index++;
    if (index >= CARS_PER_LEVEL) finishLevel();
    else nextCarIn();
  }, 700);
}

function finishLevel(): void {
  const correct = results.filter((r) => r.correct).length;
  const passed = correct >= NEEDED_TO_ADVANCE;
  if (passed && level < LEVELS && unlocked < level + 1) {
    unlocked = level + 1;
    saveUnlocked();
  }
  sounds.play(passed ? 'win' : 'wrong');
  const allDone = passed && level === LEVELS;
  $('lv-art').textContent = allDone ? '🏆' : passed ? '🎉' : '📋';
  $('lv-title').textContent = T.levelDone(level, correct, CARS_PER_LEVEL);
  $('lv-text').textContent = allDone ? T.allDone : passed ? T.levelPassed : T.levelFailed(NEEDED_TO_ADVANCE);
  const share = $('share-text');
  const ratio = totalCars ? totalCorrect / totalCars : 0;
  const rating = T.ratings[ratio >= 0.85 ? 0 : ratio >= 0.65 ? 1 : 2];
  share.textContent = [
    `🔍 ${T.docTitle}`,
    `${T.level} ${level}/${LEVELS} · ${T.score}: ${score}`,
    `🏅 ${rating}`,
    location.href.split('#')[0].split('?')[0],
  ].join('\n');
  share.classList.toggle('hidden', !(allDone || level >= 3));
  const actions = $('lv-actions');
  actions.innerHTML = '';
  const add = (label: string, cls: string, fn: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener('click', () => {
      sounds.play('click');
      fn();
    });
    actions.append(b);
  };
  if (passed && level < LEVELS) add(T.nextLevel, 'primary', () => startLevel(level + 1));
  add(T.retry, passed && level < LEVELS ? '' : 'primary', () => startLevel(level));
  if (!share.classList.contains('hidden')) add(T.share, '', shareResult);
  add(T.menu, '', () => {
    hide('level-screen');
    renderLevels();
    show('title-screen');
  });
  show('level-screen');
}

async function shareResult(): Promise<void> {
  const text = $('share-text').textContent ?? '';
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
  } catch {
    // fall back
  }
  try {
    await navigator.clipboard.writeText(text);
    $('lv-text').textContent = T.copied;
  } catch {
    $('lv-text').textContent = T.shareFailed;
  }
}

// ------------------------------------------------------------------ stations

function useStation(id: StationId): void {
  if (deciding || !cars.length) return;
  sounds.unlock();
  station = id;
  visited.add(id);
  const now = performance.now();
  switch (id) {
    case 'lights':
      lights = !lights;
      sounds.play('switch');
      break;
    case 'lift':
      liftTarget = liftTarget > 0 ? 0 : 1;
      lights = false;
      sounds.play('lift');
      break;
    case 'brakes':
    case 'shake':
      liftTarget = 0;
      rollersUntil = now + 1500;
      sounds.play('rollers');
      break;
    case 'smoke':
      liftTarget = 0;
      revUntil = now + 2200;
      sounds.play('rev');
      break;
    default:
      sounds.play('click');
  }
  renderAll();
}

function protocolLines(): { text: string; bad?: boolean }[] {
  const c = car();
  const a = c.actual;
  const computed = showComputed(level);
  const out: { text: string; bad?: boolean }[] = [];
  for (const s of STATIONS) {
    if (!visited.has(s)) continue;
    switch (s) {
      case 'look':
        out.push({ text: T.r.look });
        break;
      case 'lights':
        out.push({ text: T.r.lights });
        break;
      case 'lift':
        out.push({ text: T.r.lift });
        break;
      case 'brakes':
        out.push({ text: T.r.brakeEff(a.brakes.efficiency, computed ? 50 : null) });
        out.push({ text: T.r.brakeAxle('front', num(a.brakes.front[0], lang), num(a.brakes.front[1], lang), computed ? imbalance(a.brakes.front) : null) });
        out.push({ text: T.r.brakeAxle('rear', num(a.brakes.rear[0], lang), num(a.brakes.rear[1], lang), computed ? imbalance(a.brakes.rear) : null) });
        break;
      case 'shake':
        out.push({ text: T.r.shake(a.suspension, computed) });
        break;
      case 'smoke': {
        const limit = emissionLimit(c.papers.fuel, c.papers.euro, a.cat);
        out.push({
          text:
            c.papers.fuel === 'diesel'
              ? T.r.smokeDiesel(num(a.emission, lang), computed ? num(limit, lang) : null)
              : T.r.smokePetrol(num(a.emission, lang, 2), computed ? num(limit, lang, limit < 1 ? 1 : 1) : null),
        });
        break;
      }
      case 'insurance':
        out.push({ text: a.insured ? T.r.insuranceOk : T.r.insuranceNone, bad: !a.insured });
        break;
      case 'vin':
        out.push({ text: T.r.vin(a.vin) });
        break;
    }
  }
  return out;
}

// ------------------------------------------------------------------ rendering (DOM)

function renderPapers(): void {
  const p = car().papers;
  const dl = $('papers');
  dl.innerHTML = '';
  const row = (label: string, value: string, cls = '') => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    if (cls) dd.className = cls;
    dl.append(dt, dd);
  };
  const km = (v: number) => v.toLocaleString(lang === 'hu' ? 'hu-HU' : lang === 'de' ? 'de-DE' : 'en-GB');
  row(T.f.plate, p.plate);
  row(T.f.make, `${p.brand} ${p.model}`);
  row(T.f.firstReg, String(p.year));
  row(T.f.color, p.twoTone ? `${T.colors[p.color]} (${T.twoTone(T.colors[p.twoTone])})` : T.colors[p.color]);
  row(T.f.fuel, T.fuels[p.fuel]);
  row(T.f.euro, `EURO ${p.euro}`);
  row(T.f.headlight, T.headlights[p.headlight]);
  const entries = [...p.entries.map((m) => T.mods[m]), ...(p.taxi ? [T.taxiEntry] : [])];
  row(T.f.entries, entries.length ? entries.join('; ') : T.f.none, 'entries');
  row(T.f.vin, p.vin);
  row(T.f.owners, String(p.owners));
  row(T.f.kmPrev, km(p.kmPrev));
  row(T.f.km, km(p.kmNow));
}

function renderAll(): void {
  if (!cars.length) return;
  $('hud-level').textContent = `${T.level} ${level}/${LEVELS}`;
  $('hud-car').textContent = `${T.car} ${Math.min(index + 1, CARS_PER_LEVEL)}/${CARS_PER_LEVEL}`;
  $('hud-score').textContent = `${T.score}: ${score}`;
  $('owner').innerHTML = '';
  const b = document.createElement('b');
  b.textContent = `${T.owner}: `;
  $('owner').append(b, `„${T.ownerQuotes[ownerQuote]}”`);
  renderPapers();
  const box = $('stations');
  box.innerHTML = '';
  for (const s of STATIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `station${s === station ? ' active' : ''}${visited.has(s) ? ' done' : ''}`;
    btn.dataset.station = s;
    btn.textContent = T.stations[s];
    btn.disabled = deciding;
    btn.addEventListener('click', () => useStation(s));
    box.append(btn);
  }
  const ul = $('protocol');
  ul.innerHTML = '';
  for (const line of protocolLines()) {
    const li = document.createElement('li');
    li.textContent = line.text;
    if (line.bad) li.className = 'bad';
    ul.append(li);
  }
  if (!ul.children.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = T.protocolEmpty;
    ul.append(li);
  }
  $('btn-pass').textContent = T.pass;
  $('btn-fail').textContent = T.fail;
  $<HTMLButtonElement>('btn-pass').disabled = deciding;
  $<HTMLButtonElement>('btn-fail').disabled = deciding;
}

function openReasons(): void {
  if (deciding) return;
  sounds.play('click');
  const box = $('reasons');
  box.innerHTML = '';
  for (const d of defectPool(level)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'reason-btn';
    b.dataset.defect = d;
    b.textContent = T.defects[d];
    b.addEventListener('click', () => decide(false, d));
    box.append(b);
  }
  show('reason-screen');
}

function renderLevels(): void {
  const box = $('levels');
  box.innerHTML = '';
  for (let n = 1; n <= LEVELS; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `level-btn${n === Math.min(unlocked, LEVELS) ? ' active' : ''}`;
    b.disabled = n > unlocked;
    b.dataset.level = String(n);
    b.textContent = String(n);
    if (n > unlocked) {
      const small = document.createElement('small');
      small.textContent = T.locked;
      b.append(small);
    }
    b.addEventListener('click', () => {
      box.querySelectorAll('.level-btn').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      level = n;
    });
    box.append(b);
  }
  level = Math.min(unlocked, LEVELS);
}

function renderHandbook(): void {
  const ul = $('handbook');
  ul.innerHTML = '';
  for (const rule of T.handbookRules) {
    const li = document.createElement('li');
    li.textContent = rule;
    ul.append(li);
  }
}

// ------------------------------------------------------------------ frame

let lastFrame = performance.now();
function frame(now: number): void {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  lift += Math.sign(liftTarget - lift) * Math.min(Math.abs(liftTarget - lift), dt * 0.9);
  const rolling = now < rollersUntil;
  const revving = now < revUntil;

  drawHall(ctx, rolling, now, T.sign);
  liftPosts(ctx, cars.length && index < cars.length ? lift : 0);
  if (cars.length && index < cars.length) {
    const c = car();
    // drive in from the right, out to the left
    const t = Math.min(1, (now - driveStart) / 900);
    const ease = 1 - (1 - t) ** 3;
    const offset = driveDir === 'in' ? (1 - ease) * 900 : -ease * 1000;
    ctx.save();
    ctx.translate(offset, 0);
    drawCar(ctx, c, { lift, lights, revving: revving || rolling || t < 1, time: now });
    ctx.restore();

    if (station === 'smoke' && offset === 0) drawProbe(ctx, lift);
    // exhaust smoke: more and darker the higher the opacity (diesel) - petrol only shows faint vapour
    if (revving) {
      const diesel = c.papers.fuel === 'diesel';
      const density = diesel ? Math.min(1, c.actual.emission / 3) : 0.08;
      if (Math.random() < dt * (6 + density * 40)) {
        const [x, y] = exhaustPoint(lift);
        puffs.push({ x: x + offset, y, r: 6 + Math.random() * 6, life: 1, dark: diesel ? density : 0 });
      }
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.x += 50 * dt;
      p.y -= 26 * dt;
      p.r += 22 * dt;
      p.life -= dt * 0.45;
      if (p.life <= 0) puffs.splice(i, 1);
    }
    drawSmoke(ctx, puffs);
    drawFront(frontCtx, c, lights, now, 240, 150);
  }
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------ input

$('btn-start').addEventListener('click', () => {
  sounds.unlock();
  sounds.play('click');
  startLevel(level);
});
$('btn-pass').addEventListener('click', () => decide(true));
$('btn-fail').addEventListener('click', openReasons);
$('btn-reason-cancel').addEventListener('click', () => hide('reason-screen'));
$('btn-next-car').addEventListener('click', () => {
  sounds.play('click');
  afterFeedback();
});
$('btn-handbook').addEventListener('click', () => {
  renderHandbook();
  show('handbook-screen');
});
$('btn-handbook-close').addEventListener('click', () => hide('handbook-screen'));
$('btn-sound').addEventListener('click', () => {
  sounds.muted = !sounds.muted;
  $('btn-sound').textContent = sounds.muted ? '🔇' : '🔊';
});
window.addEventListener('resize', () => {
  setupCanvas(canvas, W, H);
  setupCanvas(frontCanvas, 240, 150);
});

function applyLang(next: Lang): void {
  lang = next;
  T = DICTS[lang];
  saveLang(lang);
  document.documentElement.lang = lang;
  document.title = T.docTitle;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = T[el.dataset.i18n as 'title'] as string;
  });
  document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  $('btn-sound').title = T.soundTitle;
  renderLevels();
  renderHandbook();
  renderAll();
}

document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach((button) =>
  button.addEventListener('click', () => {
    if (LANGS.includes(button.dataset.lang as Lang)) applyLang(button.dataset.lang as Lang);
  }),
);

applyLang(lang);
requestAnimationFrame(frame);

// read-only hook for automated browser tests
(window as unknown as { __vizsga: unknown }).__vizsga = {
  car: () => cars[index],
  index: () => index,
  level: () => level,
  results: () => results,
  defects: () => (cars[index] ? findDefects(cars[index], INSPECTION_YEAR) : []),
  year: INSPECTION_YEAR,
};
