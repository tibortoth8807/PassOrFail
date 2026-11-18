/**
 * Vehicle inspection rules (simplified, Hungarian-style) and a level-based car generator.
 * A car has what the registration certificate says ("papers") and what it really is ("actual");
 * every rule compares the two or checks a measurement against a limit. Pure logic, no DOM.
 */

export type ColorId = 'red' | 'blue' | 'white' | 'black' | 'silver' | 'green' | 'yellow';
export const COLORS: ColorId[] = ['red', 'blue', 'white', 'black', 'silver', 'green', 'yellow'];
export type BodyStyle = 'hatch' | 'sedan' | 'estate';
export type Fuel = 'petrol' | 'diesel';
export type ModId = 'tuningWheels' | 'tint' | 'spoiler' | 'lowered';
export const MODS: ModId[] = ['tuningWheels', 'tint', 'spoiler', 'lowered'];
export type LampId = 'headlight' | 'taillight' | 'indicator';

export interface Papers {
  plate: string;
  brand: string;
  model: string;
  year: number;
  fuel: Fuel;
  euro: number;
  color: ColorId;
  /** Second colour officially entered (two-tone paint). */
  twoTone: ColorId | null;
  entries: ModId[];
  headlight: 'halogen' | 'led';
  taxi: boolean;
  vin: string;
  owners: number;
  kmPrev: number;
  kmNow: number;
}

export interface Actual {
  body: BodyStyle;
  color: ColorId;
  /** A front door painted in a different colour. */
  door: ColorId | null;
  /** Front door in the same colour but a slightly different shade (repaired) - not a defect. */
  doorShadeOff: boolean;
  wheels: 'steel' | 'alloy' | 'tuning';
  tint: boolean;
  spoiler: boolean;
  lowered: boolean;
  headlight: 'halogen' | 'led';
  bulbOut: LampId | null;
  crack: boolean;
  insured: boolean;
  cat: boolean;
  /** Smoke opacity k (1/m) for diesel, CO % for petrol. */
  emission: number;
  /** Brake forces in kN, left/right per axle, and overall efficiency %. */
  brakes: { front: [number, number]; rear: [number, number]; efficiency: number };
  /** EUSAMA-style grip % per wheel: FL, FR, RL, RR. */
  suspension: [number, number, number, number];
  oil: 'none' | 'sweat' | 'drip';
  rust: { jack: boolean; fenderHole: boolean; surface: boolean };
  vin: string;
  taxiSign: boolean;
}

export interface Car {
  papers: Papers;
  actual: Actual;
}

export type DefectId =
  | 'noInsurance'
  | 'vinMismatch'
  | 'colorMismatch'
  | 'twoTone'
  | 'tuningWheels'
  | 'tint'
  | 'spoiler'
  | 'lowered'
  | 'crack'
  | 'bulbOut'
  | 'ledRetrofit'
  | 'emission'
  | 'brakes'
  | 'suspension'
  | 'oilLeak'
  | 'jackRust'
  | 'fenderHole'
  | 'taxiColor'
  | 'taxiAge'
  | 'taxiEuro';

export const DEFECTS: DefectId[] = [
  'noInsurance', 'vinMismatch', 'colorMismatch', 'twoTone', 'tuningWheels', 'tint', 'spoiler', 'lowered', 'crack', 'bulbOut',
  'ledRetrofit', 'emission', 'brakes', 'suspension', 'oilLeak', 'jackRust', 'fenderHole', 'taxiColor', 'taxiAge', 'taxiEuro',
];

/** Things that look suspicious but are not a reason to fail. */
export type DecoyId =
  | 'kmRollback'
  | 'manyOwners'
  | 'listedMods'
  | 'surfaceRust'
  | 'oilSweat'
  | 'oldDieselSmoke'
  | 'noCatPetrol'
  | 'doorShade'
  | 'twoToneListed'
  | 'factoryLed'
  | 'taxiOldButOk';

// ------------------------------------------------------------------ limits (game rules)

export const BRAKE_MIN_EFFICIENCY = 50;
export const BRAKE_MAX_IMBALANCE = 30;
export const SUSPENSION_MIN = 40;
export const SUSPENSION_MAX_DIFF = 20;

export function emissionLimit(fuel: Fuel, euro: number, cat: boolean): number {
  if (fuel === 'diesel') return euro <= 4 ? 3.0 : euro === 5 ? 1.5 : 0.7;
  return cat ? 0.3 : 3.5;
}

/** Brake imbalance on one axle, % of the stronger side. */
export function imbalance([l, r]: [number, number]): number {
  return Math.round((Math.abs(l - r) / Math.max(l, r, 0.01)) * 100);
}

export function taxiMaxAge(year: number): number {
  return year >= 2017 ? 10 : 13;
}

export function euroFor(year: number, fuel: Fuel): number {
  if (year < 1993) return fuel === 'diesel' ? 1 : 0;
  if (year < 1997) return 1;
  if (year < 2001) return 2;
  if (year < 2006) return 3;
  if (year < 2011) return 4;
  if (year < 2015) return 5;
  return 6;
}

// ------------------------------------------------------------------ the inspection

export function findDefects(car: Car, inspectionYear: number): DefectId[] {
  const { papers: p, actual: a } = car;
  const out: DefectId[] = [];
  if (!a.insured) out.push('noInsurance');
  if (a.vin !== p.vin) out.push('vinMismatch');
  if (a.color !== p.color) out.push('colorMismatch');
  if (a.door && a.door !== a.color && p.twoTone !== a.door) out.push('twoTone');
  for (const mod of MODS) {
    const present = mod === 'tuningWheels' ? a.wheels === 'tuning' : a[mod];
    if (present && !p.entries.includes(mod)) out.push(mod);
  }
  if (a.crack) out.push('crack');
  if (a.bulbOut) out.push('bulbOut');
  if (a.headlight === 'led' && p.headlight === 'halogen') out.push('ledRetrofit');
  if (a.emission > emissionLimit(p.fuel, p.euro, a.cat)) out.push('emission');
  if (a.brakes.efficiency < BRAKE_MIN_EFFICIENCY || imbalance(a.brakes.front) > BRAKE_MAX_IMBALANCE || imbalance(a.brakes.rear) > BRAKE_MAX_IMBALANCE) {
    out.push('brakes');
  }
  const [fl, fr, rl, rr] = a.suspension;
  if (Math.min(fl, fr, rl, rr) < SUSPENSION_MIN || Math.abs(fl - fr) > SUSPENSION_MAX_DIFF || Math.abs(rl - rr) > SUSPENSION_MAX_DIFF) {
    out.push('suspension');
  }
  if (a.oil === 'drip') out.push('oilLeak');
  if (a.rust.jack) out.push('jackRust');
  if (a.rust.fenderHole) out.push('fenderHole');
  if (p.taxi) {
    if (a.color !== 'yellow') out.push('taxiColor');
    if (inspectionYear - p.year > taxiMaxAge(p.year)) out.push('taxiAge');
    if (p.euro < 4) out.push('taxiEuro');
  }
  return out;
}

export function findDecoys(car: Car, inspectionYear: number): DecoyId[] {
  const { papers: p, actual: a } = car;
  const out: DecoyId[] = [];
  if (p.kmNow < p.kmPrev) out.push('kmRollback');
  if (p.owners >= 5) out.push('manyOwners');
  const listed = MODS.some((m) => (m === 'tuningWheels' ? a.wheels === 'tuning' : a[m]) && p.entries.includes(m));
  if (listed) out.push('listedMods');
  if (a.rust.surface) out.push('surfaceRust');
  if (a.oil === 'sweat') out.push('oilSweat');
  if (p.fuel === 'diesel' && p.euro <= 2 && a.emission >= 1.2 && a.emission <= emissionLimit(p.fuel, p.euro, a.cat)) out.push('oldDieselSmoke');
  if (p.fuel === 'petrol' && !a.cat && a.emission <= emissionLimit(p.fuel, p.euro, a.cat)) out.push('noCatPetrol');
  if (a.doorShadeOff) out.push('doorShade');
  if (a.door && p.twoTone === a.door) out.push('twoToneListed');
  if (a.headlight === 'led' && p.headlight === 'led') out.push('factoryLed');
  if (p.taxi && inspectionYear - p.year > 10 && inspectionYear - p.year <= taxiMaxAge(p.year)) out.push('taxiOldButOk');
  return out;
}

// ------------------------------------------------------------------ grading

export type Verdict = { pass: true } | { pass: false; reason: DefectId };

export interface Grade {
  /** The pass/fail call was right. */
  verdictRight: boolean;
  /** Fully right: right call, and for a fail, a real defect was named. */
  correct: boolean;
  points: number;
  defects: DefectId[];
  decoys: DecoyId[];
}

export function grade(car: Car, verdict: Verdict, inspectionYear: number): Grade {
  const defects = findDefects(car, inspectionYear);
  const decoys = findDecoys(car, inspectionYear);
  const shouldPass = defects.length === 0;
  if (verdict.pass) {
    return { verdictRight: shouldPass, correct: shouldPass, points: shouldPass ? 100 : 0, defects, decoys };
  }
  if (shouldPass) return { verdictRight: false, correct: false, points: 0, defects, decoys };
  const reasonRight = defects.includes(verdict.reason);
  return { verdictRight: true, correct: reasonRight, points: reasonRight ? 150 : 50, defects, decoys };
}

// ------------------------------------------------------------------ levels and the car generator

export const LEVELS = 10;
export const CARS_PER_LEVEL = 5;
export const NEEDED_TO_ADVANCE = 4;

const POOLS: [number, DefectId[]][] = [
  [1, ['crack', 'bulbOut', 'emission', 'colorMismatch', 'spoiler', 'noInsurance']],
  [2, ['tuningWheels', 'tint', 'oilLeak', 'brakes']],
  [3, ['lowered', 'twoTone', 'suspension']],
  [4, ['jackRust', 'fenderHole']],
  [6, ['ledRetrofit', 'taxiColor', 'taxiAge']],
  [7, ['vinMismatch', 'taxiEuro']],
];

export function defectPool(level: number): DefectId[] {
  return POOLS.filter(([from]) => level >= from).flatMap(([, list]) => list);
}

/** Whether the bench shows the computed imbalance / limits, or only raw values (harder levels). */
export const showComputed = (level: number) => level < 8;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BRANDS: [string, string[]][] = [
  ['Zefír', ['1.4 Classic', '1.6 Comfort', '1.9 D']],
  ['Volano', ['Uno 1.2', 'Sport 2.0', 'Family 1.6 D']],
  ['Kárpát', ['Hegyi 1.5', 'Túra 2.0 D', 'Városi 1.0']],
  ['Ferrox', ['GT 1.8', 'Diesel 2.2', 'Eco 1.3']],
  ['Mirka', ['Kombi 1.6', 'Sedan 1.8', 'Mini 1.1']],
  ['Taurus', ['Prima 2.0', 'Prima 1.9 D', 'Stella 1.4']],
];

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';

export function generateCar(level: number, rng: () => number, inspectionYear: number, wantDefect?: boolean): Car {
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rng() * list.length) % list.length];
  const between = (min: number, max: number) => min + rng() * (max - min);
  const round1 = (v: number) => Math.round(v * 10) / 10;
  const subtle = (level - 1) / (LEVELS - 1); // 0..1

  const [brand, models] = pick(BRANDS);
  const model = pick(models);
  const fuel: Fuel = / D$/.test(model) ? 'diesel' : 'petrol';
  let year = Math.floor(between(1992, inspectionYear - 1));
  const color = pick(COLORS.filter((c) => c !== 'yellow'));
  const plate =
    year >= 2022
      ? `AA${pick(['AB', 'CD', 'EF', 'GH'])}-${String(Math.floor(between(100, 999)))}`
      : `${pick(['H', 'K', 'L', 'M', 'N', 'P', 'R'])}${pick(['A', 'B', 'C', 'D', 'E', 'F'])}${pick(['A', 'H', 'K', 'S', 'T', 'Z'])}-${String(Math.floor(between(100, 999)))}`;
  const vin = Array.from({ length: 17 }, () => pick(VIN_CHARS.split(''))).join('');
  const kmPrev = Math.round(between(60_000, 280_000) / 100) * 100;

  const papers: Papers = {
    plate,
    brand,
    model,
    year,
    fuel,
    euro: euroFor(year, fuel),
    color,
    twoTone: null,
    entries: [],
    headlight: year >= 2016 && rng() < 0.5 ? 'led' : 'halogen',
    taxi: false,
    vin,
    owners: 1 + Math.floor(rng() * 4),
    kmPrev,
    kmNow: kmPrev + Math.round(between(12_000, 40_000) / 100) * 100,
  };
  const actual: Actual = {
    body: pick(['hatch', 'sedan', 'estate'] as BodyStyle[]),
    color,
    door: null,
    doorShadeOff: false,
    wheels: rng() < 0.5 ? 'steel' : 'alloy',
    tint: false,
    spoiler: false,
    lowered: false,
    headlight: papers.headlight,
    bulbOut: null,
    crack: false,
    insured: true,
    cat: !(fuel === 'petrol' && papers.euro === 0),
    emission: 0,
    brakes: { front: [0, 0], rear: [0, 0], efficiency: Math.round(between(56, 82)) },
    suspension: [0, 0, 0, 0],
    oil: 'none',
    rust: { jack: false, fenderHole: false, surface: false },
    vin,
    taxiSign: false,
  };
  const limit = () => emissionLimit(papers.fuel, papers.euro, actual.cat);
  actual.emission = round1(papers.fuel === 'diesel' ? limit() * between(0.15, 0.55) : actual.cat ? between(0.02, 0.18) : between(0.6, 2.4));
  if (papers.fuel === 'petrol' && actual.cat) actual.emission = Math.round(actual.emission * 100) / 100;
  const front = between(2.6, 3.6);
  const rear = between(1.4, 2.2);
  actual.brakes.front = [round1(front), round1(front * between(0.9, 1.0))];
  actual.brakes.rear = [round1(rear * between(0.9, 1.0)), round1(rear)];
  const base = between(52, 78);
  actual.suspension = [base, base - between(0, 10), base - between(0, 8), base - between(0, 10)].map((v) => Math.round(v)) as Actual['suspension'];

  // ---- taxis from level 6
  if (level >= 6 && rng() < 0.3) {
    papers.taxi = true;
    year = Math.floor(between(Math.max(2014, inspectionYear - 9), inspectionYear - 1));
    papers.year = year;
    papers.euro = euroFor(year, papers.fuel);
    papers.color = 'yellow';
    actual.color = 'yellow';
    actual.taxiSign = true;
    actual.body = rng() < 0.5 ? 'sedan' : 'estate';
    papers.kmNow = papers.kmPrev + Math.round(between(60_000, 110_000) / 100) * 100;
    if (papers.fuel === 'diesel') actual.emission = round1(emissionLimit('diesel', papers.euro, true) * between(0.15, 0.5));
    // decoy: older than 10 but registered before 2017, so 13 years apply
    if (level >= 7 && rng() < 0.4) {
      papers.year = inspectionYear - 12;
      papers.euro = Math.max(5, euroFor(papers.year, papers.fuel));
    }
  }

  // ---- decoys: suspicious but legal
  if (level >= 2 && rng() < 0.35) papers.kmNow = papers.kmPrev - Math.round(between(20_000, 90_000) / 100) * 100;
  if (level >= 2 && rng() < 0.3) papers.owners = 5 + Math.floor(rng() * 5);
  if (level >= 3 && rng() < 0.45) {
    const mod = pick(MODS);
    papers.entries.push(mod);
    if (mod === 'tuningWheels') actual.wheels = 'tuning';
    else actual[mod] = true;
  }
  if (level >= 4 && rng() < 0.4) actual.rust.surface = true;
  if (level >= 4 && rng() < 0.3) actual.oil = 'sweat';
  if (level >= 5 && rng() < 0.4 && !papers.taxi) {
    // an old, honest diesel that smokes a bit, or a petrol without a catalyst
    if (papers.fuel === 'diesel') {
      papers.year = Math.floor(between(1993, 2000));
      papers.euro = euroFor(papers.year, 'diesel');
      actual.emission = round1(between(1.4, 2.7));
    } else {
      papers.year = Math.floor(between(1988, 1992));
      papers.euro = 0;
      actual.cat = false;
      actual.emission = round1(between(1.2, 3.2));
    }
    papers.headlight = 'halogen';
    actual.headlight = 'halogen';
  }
  if (level >= 5 && rng() < 0.3 && !actual.taxiSign) actual.doorShadeOff = true;
  if (level >= 6 && rng() < 0.25 && !papers.taxi) {
    const second = pick(COLORS.filter((c) => c !== actual.color));
    actual.door = second;
    papers.twoTone = second;
    actual.doorShadeOff = false;
  }

  // ---- the defect(s)
  const defective = wantDefect ?? rng() < 0.55;
  if (defective) {
    const pool = defectPool(level).filter((d) => (d.startsWith('taxi') ? papers.taxi : true));
    const count = level >= 8 && rng() < 0.35 ? 2 : 1;
    const chosen = new Set<DefectId>();
    while (chosen.size < count) chosen.add(pick(papers.taxi && level >= 6 && rng() < 0.6 ? pool.filter((d) => d.startsWith('taxi')) : pool));
    for (const d of chosen) applyDefect(d);
  }
  return { papers, actual };

  function applyDefect(d: DefectId): void {
    switch (d) {
      case 'noInsurance':
        actual.insured = false;
        break;
      case 'vinMismatch': {
        const i = 9 + Math.floor(rng() * 8);
        const other = VIN_CHARS.split('').filter((c) => c !== vin[i]);
        actual.vin = vin.slice(0, i) + pick(other) + vin.slice(i + 1);
        break;
      }
      case 'colorMismatch':
        actual.color = pick(COLORS.filter((c) => c !== papers.color && c !== 'yellow'));
        actual.door = null;
        papers.twoTone = null;
        break;
      case 'twoTone':
        actual.door = pick(COLORS.filter((c) => c !== actual.color && c !== papers.twoTone));
        actual.doorShadeOff = false;
        break;
      case 'tuningWheels':
      case 'tint':
      case 'spoiler':
      case 'lowered':
        papers.entries = papers.entries.filter((m) => m !== d);
        if (d === 'tuningWheels') actual.wheels = 'tuning';
        else actual[d] = true;
        break;
      case 'crack':
        actual.crack = true;
        break;
      case 'bulbOut':
        actual.bulbOut = pick(['headlight', 'taillight', 'indicator'] as LampId[]);
        break;
      case 'ledRetrofit':
        papers.headlight = 'halogen';
        actual.headlight = 'led';
        break;
      case 'emission': {
        const over = 2.6 - 1.4 * subtle; // 2.6x the limit at level 1, ~1.2x at level 10
        actual.emission = papers.fuel === 'petrol' && actual.cat ? Math.round(limit() * over * 100) / 100 : round1(limit() * over);
        break;
      }
      case 'brakes':
        if (rng() < 0.5) {
          actual.brakes.efficiency = Math.round(BRAKE_MIN_EFFICIENCY - (16 - 13 * subtle) - rng() * 2);
        } else {
          const axle = rng() < 0.6 ? actual.brakes.front : actual.brakes.rear;
          axle[1] = round1(axle[0] * (1 - (0.55 - 0.2 * subtle)));
        }
        break;
      case 'suspension': {
        const i = Math.floor(rng() * 4);
        if (rng() < 0.5) {
          actual.suspension[i] = Math.round(SUSPENSION_MIN - (22 - 18 * subtle));
        } else {
          const pair = i < 2 ? [0, 1] : [2, 3];
          actual.suspension[pair[1]] = Math.max(SUSPENSION_MIN, actual.suspension[pair[0]] - Math.round(SUSPENSION_MAX_DIFF + 18 - 14 * subtle));
          actual.suspension[pair[0]] = actual.suspension[pair[1]] + Math.round(SUSPENSION_MAX_DIFF + 18 - 14 * subtle);
        }
        break;
      }
      case 'oilLeak':
        actual.oil = 'drip';
        break;
      case 'jackRust':
        actual.rust.jack = true;
        break;
      case 'fenderHole':
        actual.rust.fenderHole = true;
        break;
      case 'taxiColor':
        actual.color = pick(['white', 'silver', 'black'] as ColorId[]);
        papers.color = actual.color;
        actual.door = null;
        break;
      case 'taxiAge':
        papers.year = Math.floor(between(2007, inspectionYear - 14));
        papers.euro = Math.max(4, euroFor(papers.year, papers.fuel));
        break;
      case 'taxiEuro':
        papers.year = Math.floor(between(2001, 2006));
        papers.euro = 3;
        break;
    }
  }
}

/** One level's cars: a fixed mix so every level has both passes and fails. */
export function generateLevel(level: number, rng: () => number, inspectionYear: number): Car[] {
  const fails = rng() < 0.5 ? 2 : 3;
  const plan = Array.from({ length: CARS_PER_LEVEL }, (_, i) => i < fails);
  // shuffle the plan
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan.map((defective) => {
    // retry until the car really matches the plan (decoys must never create accidental defects)
    for (let attempt = 0; attempt < 50; attempt++) {
      const car = generateCar(level, rng, inspectionYear, defective);
      const hasDefect = findDefects(car, inspectionYear).length > 0;
      if (hasDefect === defective) return car;
    }
    return generateCar(level, rng, inspectionYear, defective);
  });
}
