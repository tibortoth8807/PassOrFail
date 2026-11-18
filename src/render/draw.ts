/**
 * Inspection hall and the car under test, drawn with Canvas 2D. Cars are generic, unbranded
 * side-view drawings in three body styles; everything that can be wrong with them is a parameter.
 */
import type { Car, ColorId } from '../game/inspection';

export type Ctx = CanvasRenderingContext2D;

export const W = 960;
export const H = 600;
export const GROUND = 478;
export const LIFT_HEIGHT = 150;
const WHEEL = { front: 292, rear: 676 };

export const PAINT: Record<ColorId, [string, string, string]> = {
  red: ['#e0414a', '#c3202c', '#7c1018'],
  blue: ['#4a7fd0', '#2456a6', '#163668'],
  white: ['#ffffff', '#e9ecef', '#b9c0c7'],
  black: ['#4a4f57', '#24272c', '#0d0f12'],
  silver: ['#e4e8ec', '#b9c0c8', '#7f8891'],
  green: ['#4f9a6a', '#2c6e46', '#183f28'],
  yellow: ['#ffd84d', '#f5c400', '#b38c00'],
};
/** A slightly different shade of the same colour, for repaired doors (not a defect). */
const SHADE_OFF: Record<ColorId, [string, string, string]> = {
  red: ['#d94a4f', '#b8262f', '#701219'],
  blue: ['#5584cc', '#2c5ea6', '#183a6c'],
  white: ['#f7f5ee', '#e3e0d6', '#b3b0a6'],
  black: ['#50545a', '#2a2c30', '#121315'],
  silver: ['#dde2e6', '#b1b8bf', '#788088'],
  green: ['#57a070', '#33744c', '#1d452e'],
  yellow: ['#ffdb5c', '#f0c20a', '#ad8806'],
};

// ------------------------------------------------------------------ helpers

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, style: string | CanvasGradient): void {
  ctx.fillStyle = style;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function circle(ctx: Ctx, x: number, y: number, r: number, style: string | CanvasGradient): void {
  ctx.fillStyle = style;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  ctx.fill();
}

function grad(ctx: Ctx, shades: [string, string, string], top: number, bottom: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, shades[0]);
  g.addColorStop(0.45, shades[1]);
  g.addColorStop(1, shades[2]);
  return g;
}

// ------------------------------------------------------------------ hall

export function drawHall(ctx: Ctx, rollers: boolean, time: number, sign: string): void {
  const wall = ctx.createLinearGradient(0, 0, 0, GROUND);
  wall.addColorStop(0, '#c9d3dc');
  wall.addColorStop(1, '#aeb9c4');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, GROUND);
  // high windows
  for (let i = 0; i < 5; i++) {
    rr(ctx, 60 + i * 180, 30, 140, 60, 4, '#e8f2fa');
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(128 + i * 180, 30, 4, 60);
  }
  // station sign
  rr(ctx, 330, 112, 300, 46, 8, '#1f4f8f');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, 480, 136);
  // wall panels + toolbox + tyre stack
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let x = 0; x < W; x += 96) ctx.fillRect(x, 170, 2, GROUND - 170);
  rr(ctx, 26, 360, 70, 110, 6, '#c0392b');
  for (let i = 0; i < 4; i++) rr(ctx, 30, 368 + i * 25, 62, 18, 3, '#a93226');
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#1b1b1d';
    ctx.beginPath();
    ctx.ellipse(905, 455 - i * 26, 36, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3a3d';
    ctx.beginPath();
    ctx.ellipse(905, 451 - i * 26, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // floor
  const floor = ctx.createLinearGradient(0, GROUND, 0, H);
  floor.addColorStop(0, '#8e959b');
  floor.addColorStop(1, '#6f767c');
  ctx.fillStyle = floor;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(0, GROUND + 6, W, 4);
  // roller bench pits under the wheels
  for (const x of [WHEEL.front, WHEEL.rear]) {
    rr(ctx, x - 62, GROUND - 2, 124, 20, 4, '#3a3f45');
    for (let i = 0; i < 2; i++) {
      const cx = x - 28 + i * 56;
      circle(ctx, cx, GROUND + 6, 13, '#9aa3ab');
      if (rollers) {
        ctx.strokeStyle = '#4a5056';
        ctx.lineWidth = 3;
        const a = time / 60;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 11, GROUND + 6 + Math.sin(a) * 11);
        ctx.lineTo(cx - Math.cos(a) * 11, GROUND + 6 - Math.sin(a) * 11);
        ctx.stroke();
      }
    }
  }
}

export function liftPosts(ctx: Ctx, lift: number): void {
  for (const x of [118, 842]) {
    rr(ctx, x - 14, 150, 28, GROUND - 150, 4, '#2f5d9a');
    rr(ctx, x - 6, 160, 12, GROUND - 170, 3, '#244a7a');
    rr(ctx, x - 22, GROUND - 6, 44, 10, 3, '#1f2a36');
  }
  // arms reaching the jack points
  const y = GROUND - 30 - lift * LIFT_HEIGHT + 8;
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(118, y);
  ctx.lineTo(332, y);
  ctx.moveTo(842, y);
  ctx.lineTo(636, y);
  ctx.stroke();
  for (const x of [332, 636]) rr(ctx, x - 12, y - 6, 24, 8, 2, '#1f2a36');
}

// ------------------------------------------------------------------ the car

export interface CarView {
  lift: number; // 0..1
  lights: boolean;
  revving: boolean;
  time: number;
}

const BODY: Record<Car['actual']['body'], string> = {
  hatch: 'M196,-42 L195,-80 Q198,-98 216,-102 L340,-114 L414,-162 Q444,-172 486,-172 L652,-170 Q694,-168 718,-142 L764,-104 L772,-60 L770,-40 Q770,-30 758,-30 L208,-30 Q196,-30 196,-42 Z',
  sedan: 'M196,-42 L195,-80 Q198,-98 216,-102 L340,-114 L414,-162 Q444,-172 486,-172 L622,-170 Q664,-166 690,-124 L758,-118 Q772,-116 774,-100 L774,-40 Q774,-30 762,-30 L208,-30 Q196,-30 196,-42 Z',
  estate: 'M196,-42 L195,-80 Q198,-98 216,-102 L340,-114 L414,-162 Q444,-172 486,-172 L734,-170 Q754,-168 760,-150 L772,-104 L774,-40 Q774,-30 762,-30 L208,-30 Q196,-30 196,-42 Z',
};
const GLASS: Record<Car['actual']['body'], string> = {
  hatch: 'M352,-112 L418,-157 L648,-158 Q682,-156 704,-136 L732,-112 Z',
  sedan: 'M352,-112 L418,-157 L618,-158 Q650,-154 672,-118 L674,-112 Z',
  estate: 'M352,-112 L418,-157 L728,-158 Q744,-155 748,-140 L754,-112 Z',
};

function wheel(ctx: Ctx, x: number, kind: Car['actual']['wheels'], spin: number): void {
  const y = -42;
  const tyre = kind === 'tuning' ? 44 : 42;
  circle(ctx, x, y, tyre, '#141416');
  if (kind === 'tuning') {
    // big chrome rim, low-profile tyre
    const g = ctx.createRadialGradient(x - 8, y - 8, 4, x, y, 36);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#9aa3ab');
    circle(ctx, x, y, 36, g);
    circle(ctx, x, y, 31, '#5c6168');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.strokeStyle = '#e9edf0';
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
      ctx.rotate(Math.PI / 5);
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(31, 0);
      ctx.stroke();
    }
    ctx.restore();
    circle(ctx, x, y, 7, '#d9dee2');
  } else if (kind === 'alloy') {
    circle(ctx, x, y, 28, '#b9c0c7');
    circle(ctx, x, y, 24, '#6d737a');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.fillStyle = '#c9ced4';
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-6, -24);
      ctx.lineTo(6, -24);
      ctx.lineTo(4, 0);
      ctx.fill();
    }
    ctx.restore();
    circle(ctx, x, y, 6, '#5c6168');
  } else {
    // steel wheel with a plastic hubcap
    circle(ctx, x, y, 28, '#2a2c30');
    circle(ctx, x, y, 26, '#a7adb4');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.fillStyle = '#868d94';
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(10, -2, 13, 4);
    }
    ctx.restore();
    circle(ctx, x, y, 8, '#c9ced4');
  }
}

export function drawCar(ctx: Ctx, car: Car, view: CarView): void {
  const a = car.actual;
  const lifted = view.lift * LIFT_HEIGHT;
  const shake = view.revving ? Math.sin(view.time / 25) * 0.8 : 0;
  const drop = a.lowered ? 12 : 0;

  // floor shadow (fades as the car rises)
  ctx.fillStyle = `rgba(0,0,0,${0.3 * (1 - view.lift * 0.7)})`;
  ctx.beginPath();
  ctx.ellipse(484, GROUND + 4, 300 + lifted * 0.2, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // oil on the floor (only noticeable once you look underneath, but it is there)
  if (a.oil === 'drip') {
    ctx.fillStyle = 'rgba(25, 20, 10, 0.75)';
    ctx.beginPath();
    ctx.ellipse(300, GROUND + 10, 46, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(0, GROUND - lifted + shake);

  const paint = PAINT[a.color];
  const body = new Path2D(BODY[a.body]);

  // underbody (visible on the lift)
  ctx.save();
  ctx.translate(0, drop);
  rr(ctx, 220, -36, 540, 16, 6, '#26292d');
  // exhaust
  rr(ctx, 350, -24, 410, 7, 3, '#7a746c');
  rr(ctx, 690, -28, 80, 14, 6, '#8a847b');
  rr(ctx, 768, -24, 18, 6, 2, '#a8a29a');
  // oil pan
  rr(ctx, 238, -30, 76, 14, 4, '#5c6168');
  if (a.oil !== 'none') {
    ctx.fillStyle = 'rgba(25, 20, 10, 0.75)';
    ctx.beginPath();
    ctx.ellipse(276, -18, a.oil === 'drip' ? 34 : 18, a.oil === 'drip' ? 5 : 3, 0, 0, Math.PI * 2);
    ctx.fill();
    if (a.oil === 'drip' && view.lift > 0.5) {
      for (let i = 0; i < 3; i++) {
        const t = ((view.time / 700 + i / 3) % 1);
        circle(ctx, 268 + i * 9, -14 + t * (lifted + 20), 3, `rgba(25, 20, 10, ${1 - t * 0.5})`);
      }
    }
  }
  // jack points
  for (const x of [332, 636]) {
    rr(ctx, x - 14, -32, 28, 8, 2, a.rust.jack ? '#8a4a1c' : '#3a3f45');
    if (a.rust.jack) {
      circle(ctx, x - 4, -28, 3, '#1a0d05');
      circle(ctx, x + 6, -27, 2.2, '#1a0d05');
      ctx.fillStyle = 'rgba(160, 80, 30, 0.8)';
      ctx.fillRect(x - 16, -26, 32, 4);
    }
  }
  ctx.restore();

  ctx.save();
  ctx.translate(0, drop);
  // body
  ctx.fillStyle = grad(ctx, paint, -172, -30);
  ctx.fill(body);
  // a door in another colour, or the same colour in a slightly different shade
  const doorPath = new Path2D('M352,-110 L520,-110 L520,-34 L362,-34 Q354,-70 352,-110 Z');
  if (a.door || a.doorShadeOff) {
    ctx.fillStyle = grad(ctx, a.door ? PAINT[a.door] : SHADE_OFF[a.color], -110, -30);
    ctx.fill(doorPath);
  }
  // wheel arches
  ctx.save();
  ctx.clip(body);
  for (const x of [WHEEL.front, WHEEL.rear]) circle(ctx, x, -42 - drop, 50 - drop * 0.3, '#0b0b0c');
  ctx.restore();
  // windows
  const glass = new Path2D(GLASS[a.body]);
  ctx.fillStyle = a.tint ? '#0a0c0f' : '#3c4c5a';
  ctx.fill(glass);
  ctx.save();
  ctx.clip(glass);
  ctx.fillStyle = a.tint ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.18)';
  for (const x of [470, 600]) {
    ctx.beginPath();
    ctx.moveTo(x, -160);
    ctx.lineTo(x + 30, -160);
    ctx.lineTo(x - 10, -110);
    ctx.lineTo(x - 40, -110);
    ctx.fill();
  }
  ctx.restore();
  // pillars
  ctx.fillStyle = '#16191c';
  ctx.fillRect(516, -158, 10, 48);
  if (a.body !== 'sedan') ctx.fillRect(a.body === 'hatch' ? 640 : 650, -158, 9, 48);
  // door seams + handles
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke(doorPath);
  ctx.beginPath();
  ctx.moveTo(521, -34);
  ctx.lineTo(521, -110);
  ctx.moveTo(652, -110);
  ctx.quadraticCurveTo(648, -70, 640, -34);
  ctx.stroke();
  rr(ctx, 488, -98, 22, 5, 2, '#9aa2a8');
  rr(ctx, 614, -98, 22, 5, 2, '#9aa2a8');
  // mirror
  ctx.fillStyle = grad(ctx, a.door ? PAINT[a.door] : paint, -128, -110);
  ctx.beginPath();
  ctx.roundRect(356, -128, 24, 16, 4);
  ctx.fill();
  // bumpers' black strips
  rr(ctx, 196, -62, 54, 6, 2, '#1d1f22');
  rr(ctx, 730, -62, 44, 6, 2, '#1d1f22');
  // shoulder line
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(214, -96);
  ctx.lineTo(764, -98);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke(body);

  // spoiler
  if (a.spoiler) {
    ctx.fillStyle = '#16191c';
    if (a.body === 'sedan') {
      rr(ctx, 712, -132, 64, 8, 3, '#16191c');
      ctx.fillRect(722, -126, 5, 10);
      ctx.fillRect(762, -126, 5, 10);
    } else {
      ctx.beginPath();
      const x = a.body === 'estate' ? 726 : 650;
      ctx.moveTo(x, -172);
      ctx.lineTo(x + 70, -174);
      ctx.lineTo(x + 76, -162);
      ctx.lineTo(x, -166);
      ctx.fill();
    }
  }
  // taxi sign
  if (a.taxiSign) {
    rr(ctx, 500, -192, 70, 20, 5, '#f2f2ee');
    ctx.fillStyle = '#1d1f22';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TAXI', 535, -182);
  }

  // rust
  if (a.rust.surface) {
    ctx.fillStyle = 'rgba(150, 70, 25, 0.75)';
    for (const [x, y, r] of [[420, -36, 4], [436, -38, 2.5], [560, -35, 3.5], [580, -37, 2], [250, -40, 3]] as [number, number, number][]) circle(ctx, x, y, r, 'rgba(150, 70, 25, 0.75)');
  }
  if (a.rust.fenderHole) {
    ctx.fillStyle = '#8a4a1c';
    ctx.beginPath();
    ctx.ellipse(728, -78, 15, 11, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#120a05';
    ctx.beginPath();
    ctx.moveTo(722, -84);
    ctx.lineTo(736, -80);
    ctx.lineTo(731, -72);
    ctx.lineTo(720, -74);
    ctx.closePath();
    ctx.fill();
  }

  // lights (side view): headlight at the front corner, tail light at the back, indicator on the wing
  const blinkOn = Math.floor(view.time / 400) % 2 === 0;
  const head = a.headlight === 'led' ? '#e6f4ff' : '#fff1bf';
  const headOn = view.lights && a.bulbOut !== 'headlight';
  rr(ctx, 197, -92, 26, 14, 4, headOn ? head : '#d9dfe4');
  if (headOn) {
    const beam = ctx.createLinearGradient(196, 0, 20, 0);
    beam.addColorStop(0, a.headlight === 'led' ? 'rgba(220, 240, 255, 0.55)' : 'rgba(255, 236, 170, 0.5)');
    beam.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(198, -90);
    ctx.lineTo(10, -120);
    ctx.lineTo(10, -20);
    ctx.lineTo(198, -80);
    ctx.fill();
  }
  const tailX = a.body === 'sedan' ? 760 : 758;
  const tailOn = view.lights && a.bulbOut !== 'taillight';
  rr(ctx, tailX, -100, 14, 22, 3, tailOn ? '#ff3b3b' : '#8e1a22');
  if (tailOn) circle(ctx, tailX + 10, -89, 20, 'rgba(255, 50, 50, 0.25)');
  const indOn = view.lights && a.bulbOut !== 'indicator' && blinkOn;
  rr(ctx, 262, -84, 12, 6, 2, indOn ? '#ffb020' : '#c98a2a');
  if (indOn) circle(ctx, 268, -81, 12, 'rgba(255, 176, 32, 0.35)');
  ctx.restore();

  // wheels (do not drop with lowered suspension; the body does)
  const spin = view.revving ? view.time / 40 : 0;
  wheel(ctx, WHEEL.front, a.wheels, spin);
  wheel(ctx, WHEEL.rear, a.wheels, spin);
  ctx.restore();
}

// ------------------------------------------------------------------ exhaust smoke

export interface Puff {
  x: number;
  y: number;
  r: number;
  life: number;
  dark: number;
}

export function exhaustPoint(lift: number): [number, number] {
  return [790, GROUND - lift * LIFT_HEIGHT - 21];
}

export function drawSmoke(ctx: Ctx, puffs: Puff[]): void {
  for (const p of puffs) {
    const shade = Math.round(220 - p.dark * 190);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.55 * p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Smoke meter probe in the tailpipe. */
export function drawProbe(ctx: Ctx, lift: number): void {
  const [x, y] = exhaustPoint(lift);
  ctx.strokeStyle = '#1d1f22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.quadraticCurveTo(x + 60, y + 10, x + 90, GROUND - 40);
  ctx.stroke();
  rr(ctx, x + 70, GROUND - 70, 60, 70, 6, '#e9ecef');
  rr(ctx, x + 78, GROUND - 62, 44, 20, 3, '#163c2a');
}

// ------------------------------------------------------------------ front view close-up

export function drawFront(ctx: Ctx, car: Car, lights: boolean, time: number, w: number, h: number): void {
  const a = car.actual;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#c9d3dc';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h - 12);
  const s = w / 300;
  ctx.scale(s, s);
  const paint = PAINT[a.color];
  // body
  ctx.fillStyle = grad(ctx, paint, -190, 0);
  ctx.beginPath();
  ctx.moveTo(-130, 0);
  ctx.lineTo(-138, -70);
  ctx.quadraticCurveTo(-130, -96, -96, -104);
  ctx.lineTo(-74, -170);
  ctx.quadraticCurveTo(0, -182, 74, -170);
  ctx.lineTo(96, -104);
  ctx.quadraticCurveTo(130, -96, 138, -70);
  ctx.lineTo(130, 0);
  ctx.closePath();
  ctx.fill();
  if (a.taxiSign) {
    rr(ctx, -30, -200, 60, 20, 4, '#f2f2ee');
    ctx.fillStyle = '#1d1f22';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TAXI', 0, -190);
  }
  // windscreen
  ctx.fillStyle = '#3c4c5a';
  ctx.beginPath();
  ctx.moveTo(-88, -108);
  ctx.lineTo(-68, -164);
  ctx.quadraticCurveTo(0, -174, 68, -164);
  ctx.lineTo(88, -108);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(-40, -164);
  ctx.lineTo(-10, -166);
  ctx.lineTo(-50, -110);
  ctx.lineTo(-80, -110);
  ctx.fill();
  if (a.crack) {
    // a stone chip with cracks running across the driver's view
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.6;
    const cx = -30;
    const cy = -138;
    circle(ctx, cx, cy, 4, 'rgba(255,255,255,0.8)');
    for (const [dx, dy] of [[70, -18], [52, 22], [-34, 24], [-20, -26], [100, 4]]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * 0.5, cy + dy * 0.5 + 3);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.stroke();
    }
  }
  // grille, bumper, plate
  rr(ctx, -60, -84, 120, 22, 8, '#1d1f22');
  rr(ctx, -132, -46, 264, 14, 5, '#1d1f22');
  rr(ctx, -46, -28, 92, 20, 3, '#f8f8f4');
  ctx.fillStyle = '#1d1f22';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(car.papers.plate, 0, -18);
  // headlights
  const blinkOn = Math.floor(time / 400) % 2 === 0;
  for (const side of [-1, 1]) {
    const x = side * 102;
    const headOn = lights && !(a.bulbOut === 'headlight' && side === -1);
    if (a.headlight === 'led' && car.papers.headlight === 'led') {
      // factory LED: slim strip headlight
      rr(ctx, x - 30, -94, 60, 16, 6, '#1d2125');
      rr(ctx, x - 26, -88, 52, 4, 2, headOn ? '#f2fbff' : '#8a949c');
    } else {
      // round reflector headlight (halogen housing - maybe with an LED bulb inside)
      rr(ctx, x - 30, -98, 60, 24, 8, '#1d2125');
      circle(ctx, x, -86, 10, headOn ? (a.headlight === 'led' ? '#eaf6ff' : '#fff1bf') : '#cfd6dc');
      circle(ctx, x, -86, 4, headOn ? '#ffffff' : '#e8edf0');
    }
    if (headOn) {
      ctx.fillStyle = a.headlight === 'led' ? 'rgba(200, 230, 255, 0.35)' : 'rgba(255, 236, 170, 0.35)';
      ctx.beginPath();
      ctx.arc(x, -86, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    const indOn = lights && blinkOn && !(a.bulbOut === 'indicator' && side === 1);
    rr(ctx, x + side * 28 - 6, -92, 12, 8, 2, indOn ? '#ffb020' : '#b07a2a');
  }
  ctx.restore();
}
