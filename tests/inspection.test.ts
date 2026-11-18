import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CARS_PER_LEVEL,
  Car,
  DEFECTS,
  LEVELS,
  defectPool,
  emissionLimit,
  findDecoys,
  findDefects,
  generateCar,
  generateLevel,
  grade,
  imbalance,
  mulberry32,
  taxiMaxAge,
} from '../src/game/inspection';

const YEAR = 2026;

function cleanCar(): Car {
  return {
    papers: {
      plate: 'ABC-123', brand: 'Zefír', model: '1.4 Classic', year: 2008, fuel: 'petrol', euro: 4, color: 'red', twoTone: null,
      entries: [], headlight: 'halogen', taxi: false, vin: 'ABCDEFGHJKLMNPRST', owners: 2, kmPrev: 150_000, kmNow: 170_000,
    },
    actual: {
      body: 'hatch', color: 'red', door: null, doorShadeOff: false, wheels: 'steel', tint: false, spoiler: false, lowered: false,
      headlight: 'halogen', bulbOut: null, crack: false, insured: true, cat: true, emission: 0.1,
      brakes: { front: [3.2, 3.0], rear: [1.8, 1.9], efficiency: 66 }, suspension: [62, 58, 60, 55], oil: 'none',
      rust: { jack: false, fenderHole: false, surface: false }, vin: 'ABCDEFGHJKLMNPRST', taxiSign: false,
    },
  };
}

test('a clean car has no defects and passes', () => {
  const car = cleanCar();
  assert.deepEqual(findDefects(car, YEAR), []);
  assert.deepEqual(grade(car, { pass: true }, YEAR), { verdictRight: true, correct: true, points: 100, defects: [], decoys: [] });
});

test('unregistered modifications fail, registered ones pass', () => {
  const car = cleanCar();
  car.actual.spoiler = true;
  car.actual.wheels = 'tuning';
  assert.deepEqual(findDefects(car, YEAR), ['tuningWheels', 'spoiler']);
  car.papers.entries = ['spoiler', 'tuningWheels'];
  assert.deepEqual(findDefects(car, YEAR), []);
  assert.ok(findDecoys(car, YEAR).includes('listedMods'));
});

test('colour: body must match the papers, a different-coloured door needs a two-tone entry, a slightly different shade is fine', () => {
  const car = cleanCar();
  car.actual.doorShadeOff = true;
  assert.deepEqual(findDefects(car, YEAR), []);
  car.actual.door = 'yellow';
  assert.deepEqual(findDefects(car, YEAR), ['twoTone']);
  car.papers.twoTone = 'yellow';
  assert.deepEqual(findDefects(car, YEAR), []);
  car.actual.color = 'blue';
  assert.ok(findDefects(car, YEAR).includes('colorMismatch'));
});

test('emission limits depend on fuel, Euro class and catalyst', () => {
  assert.equal(emissionLimit('diesel', 2, true), 3.0);
  assert.equal(emissionLimit('diesel', 5, true), 1.5);
  assert.equal(emissionLimit('diesel', 6, true), 0.7);
  assert.equal(emissionLimit('petrol', 4, true), 0.3);
  assert.equal(emissionLimit('petrol', 0, false), 3.5);
  const car = cleanCar();
  car.papers.fuel = 'diesel';
  car.papers.euro = 2;
  car.actual.emission = 2.4; // smokes, but an old diesel may
  assert.deepEqual(findDefects(car, YEAR), []);
  assert.ok(findDecoys(car, YEAR).includes('oldDieselSmoke'));
  car.actual.emission = 3.4;
  assert.deepEqual(findDefects(car, YEAR), ['emission']);
});

test('brakes: efficiency and left/right imbalance; suspension: minimum and axle difference', () => {
  assert.equal(imbalance([3.0, 2.0]), 33);
  const car = cleanCar();
  car.actual.brakes.efficiency = 48;
  assert.deepEqual(findDefects(car, YEAR), ['brakes']);
  car.actual.brakes.efficiency = 60;
  car.actual.brakes.rear = [2.0, 1.3];
  assert.deepEqual(findDefects(car, YEAR), ['brakes']);
  car.actual.brakes.rear = [2.0, 1.9];
  car.actual.suspension = [62, 39, 60, 55];
  assert.deepEqual(findDefects(car, YEAR), ['suspension']);
  car.actual.suspension = [70, 48, 60, 55];
  assert.deepEqual(findDefects(car, YEAR), ['suspension']);
});

test('taxi rules: yellow, at least Euro 4, 10 years (from 2017) or 13 years (before)', () => {
  assert.equal(taxiMaxAge(2018), 10);
  assert.equal(taxiMaxAge(2014), 13);
  const car = cleanCar();
  car.papers.taxi = true;
  car.papers.year = 2014; // 12 years old, but registered before 2017
  car.papers.euro = 5;
  car.papers.color = 'yellow';
  car.actual.color = 'yellow';
  assert.deepEqual(findDefects(car, YEAR), []);
  assert.ok(findDecoys(car, YEAR).includes('taxiOldButOk'));
  car.papers.year = 2011;
  assert.deepEqual(findDefects(car, YEAR), ['taxiAge']);
  car.papers.year = 2020;
  car.papers.color = 'white';
  car.actual.color = 'white';
  assert.deepEqual(findDefects(car, YEAR), ['taxiColor']);
});

test('odometer going backwards and many owners are not reasons to fail', () => {
  const car = cleanCar();
  car.papers.kmNow = 90_000;
  car.papers.owners = 8;
  car.actual.rust.surface = true;
  car.actual.oil = 'sweat';
  assert.deepEqual(findDefects(car, YEAR), []);
  assert.deepEqual(findDecoys(car, YEAR), ['kmRollback', 'manyOwners', 'surfaceRust', 'oilSweat']);
});

test('grading: a fail needs a real reason for full points', () => {
  const car = cleanCar();
  car.actual.crack = true;
  assert.equal(grade(car, { pass: true }, YEAR).correct, false);
  assert.deepEqual(
    [grade(car, { pass: false, reason: 'crack' }, YEAR).points, grade(car, { pass: false, reason: 'brakes' }, YEAR).points],
    [150, 50],
  );
  assert.equal(grade(cleanCar(), { pass: false, reason: 'crack' }, YEAR).points, 0);
});

test('generated levels: planned mix of passes and fails, defects only from the level pool', () => {
  for (let level = 1; level <= LEVELS; level++) {
    const pool = new Set(defectPool(level));
    for (let seed = 1; seed <= 40; seed++) {
      const cars = generateLevel(level, mulberry32(seed * 100 + level), YEAR);
      assert.equal(cars.length, CARS_PER_LEVEL);
      const fails = cars.filter((c) => findDefects(c, YEAR).length > 0).length;
      assert.ok(fails === 2 || fails === 3, `level ${level} seed ${seed}: ${fails}`);
      for (const car of cars) {
        for (const d of findDefects(car, YEAR)) assert.ok(pool.has(d), `level ${level}: ${d} not unlocked`);
      }
    }
  }
});

test('every defect appears somewhere by level 10', () => {
  const seen = new Set<string>();
  const rng = mulberry32(7);
  for (let i = 0; i < 3000; i++) findDefects(generateCar(10, rng, YEAR, true), YEAR).forEach((d) => seen.add(d));
  for (const d of DEFECTS) assert.ok(seen.has(d), `never generated: ${d}`);
});
