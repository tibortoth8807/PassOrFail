/** UI texts in Hungarian, English and German. */
import type { ColorId, DecoyId, DefectId, Fuel, ModId } from './game/inspection';

export type Lang = 'hu' | 'en' | 'de';
export const LANGS: Lang[] = ['hu', 'en', 'de'];

export type StationId = 'look' | 'lights' | 'lift' | 'brakes' | 'shake' | 'smoke' | 'insurance' | 'vin';

export interface Dict {
  docTitle: string;
  sign: string;
  title: string;
  subtitle: string;
  intro: string;
  rules: string;
  pickLevel: string;
  locked: string;
  start: string;
  soundTitle: string;
  handbook: string;
  footer: string;
  level: string;
  car: string;
  score: string;
  papersTitle: string;
  f: {
    plate: string; make: string; firstReg: string; color: string; fuel: string; euro: string; headlight: string;
    entries: string; none: string; taxi: string; vin: string; owners: string; km: string; kmPrev: string;
  };
  colors: Record<ColorId, string>;
  twoTone: (c: string) => string;
  fuels: Record<Fuel, string>;
  headlights: { halogen: string; led: string };
  mods: Record<ModId, string>;
  taxiEntry: string;
  stations: Record<StationId, string>;
  frontView: string;
  protocol: string;
  protocolEmpty: string;
  r: {
    look: string;
    lights: string;
    lift: string;
    brakeEff: (v: number, min: number | null) => string;
    brakeAxle: (axle: 'front' | 'rear', l: string, r: string, imb: number | null) => string;
    shake: (v: number[], computed: boolean) => string;
    smokeDiesel: (v: string, limit: string | null) => string;
    smokePetrol: (v: string, limit: string | null) => string;
    insuranceOk: string;
    insuranceNone: string;
    vin: (v: string) => string;
  };
  pass: string;
  fail: string;
  pickReason: string;
  cancel: string;
  defects: Record<DefectId, string>;
  explain: Record<DefectId, string>;
  decoys: Record<DecoyId, string>;
  rightPass: string;
  rightFail: string;
  rightFailWrongReason: string;
  wrongPass: string;
  wrongFail: string;
  realDefects: string;
  noDefects: string;
  traps: string;
  nextCar: string;
  levelDone: (level: number, correct: number, total: number) => string;
  levelPassed: string;
  levelFailed: (need: number) => string;
  nextLevel: string;
  retry: string;
  menu: string;
  allDone: string;
  ratings: [string, string, string];
  share: string;
  copied: string;
  shareFailed: string;
  owner: string;
  ownerQuotes: string[];
  handbookRules: string[];
  close: string;
}

const hu: Dict = {
  docTitle: 'Vizsgabiztos – átmegy vagy bukta?',
  sign: 'MŰSZAKI VIZSGA',
  title: 'Vizsgabiztos',
  subtitle: 'átmegy vagy bukta?',
  intro: 'Te vagy a vizsgabiztos a műszaki vizsgaállomáson. Jönnek az autók, és neked kell kiszúrni, mi a turpisság – és azt is, ami csak gyanúsnak tűnik, de nem buktató ok.',
  rules:
    'Vizsgáld meg az autót az állomásokon (szemle, lámpák, emelő, fékpad, rázópad, füstmérés, KGFB, alvázszám), vesd össze a forgalmival, aztán döntsd el: átmegy vagy bukta. Buktatásnál nevezd meg az okot is. Szintenként 5 autó, legalább 4 jó döntés kell a továbblépéshez. A szabályok a játék kedvéért egyszerűsítettek.',
  pickLevel: 'Szint',
  locked: 'zárva',
  start: 'Kezdjük!',
  soundTitle: 'Hang be/ki',
  handbook: '📘 Kézikönyv',
  footer: 'Játék, egyszerűsített szabályokkal – nem hivatalos vizsgakövetelmény. A márkák és típusok kitaláltak.',
  level: 'Szint',
  car: 'Autó',
  score: 'Pont',
  papersTitle: 'Forgalmi engedély',
  f: {
    plate: 'Rendszám', make: 'Gyártmány, típus', firstReg: 'Első forgalomba helyezés', color: 'Szín', fuel: 'Hajtóanyag', euro: 'Környezetvédelmi osztály',
    headlight: 'Fényszóró', entries: 'Bejegyzések', none: '–', taxi: 'Személytaxi', vin: 'Alvázszám', owners: 'Tulajdonosok száma', km: 'Km-óra most', kmPrev: 'Km-óra előző vizsgán',
  },
  colors: { red: 'piros', blue: 'kék', white: 'fehér', black: 'fekete', silver: 'ezüst', green: 'zöld', yellow: 'sárga' },
  twoTone: (c) => `kétszínű, második szín: ${c}`,
  fuels: { petrol: 'benzin', diesel: 'dízel' },
  headlights: { halogen: 'halogén', led: 'gyári LED' },
  mods: { tuningWheels: 'Könnyűfém keréktárcsa 8Jx18 ET35', tint: 'Sötétített üvegfólia', spoiler: 'Hátsó légterelő', lowered: 'Ültetett futómű (−40 mm)' },
  taxiEntry: 'Személytaxi (Budapest)',
  stations: { look: '👀 Szemle', lights: '💡 Lámpák', lift: '⬆️ Emelő', brakes: '🛑 Fékpad', shake: '〰️ Rázópad', smoke: '💨 Füstmérés', insurance: '📄 KGFB', vin: '🔎 Alvázszám' },
  frontView: 'Elölnézet',
  protocol: 'Jegyzőkönyv',
  protocolEmpty: 'Még nem mértél semmit.',
  r: {
    look: 'Szemle: nézd meg a színt, kerekeket, üvegeket, karosszériát és a szélvédőt.',
    lights: 'Lámpák bekapcsolva: fényszóró, index, hátsó lámpa – mind ég? Milyen színű a fény?',
    lift: 'Emelőn: nézz alá – olaj, emelési pontok, rozsda.',
    brakeEff: (v, min) => `Fékhatás: ${v} %${min !== null ? ` (min. ${min} %)` : ''}`,
    brakeAxle: (a, l, r, imb) => `${a === 'front' ? 'Első' : 'Hátsó'} tengely: B ${l} kN · J ${r} kN${imb !== null ? ` (eltérés ${imb} %)` : ''}`,
    shake: (v, c) => `Rázópad: BE ${v[0]} % · JE ${v[1]} % · BH ${v[2]} % · JH ${v[3]} %${c ? ' (min. 40 %, tengelyen max. 20 pont eltérés)' : ''}`,
    smokeDiesel: (v, l) => `Füstölésmérés: k = ${v} 1/m${l ? ` (határérték: ${l})` : ''}`,
    smokePetrol: (v, l) => `Gázelemzés: CO = ${v} %${l ? ` (határérték: ${l} %)` : ''}`,
    insuranceOk: 'KGFB: érvényes kötelező biztosítás ✔',
    insuranceNone: 'KGFB: nincs érvényes kötelező biztosítás! ✘',
    vin: (v) => `Beütött alvázszám: ${v}`,
  },
  pass: '✅ Átment',
  fail: '❌ Bukta',
  pickReason: 'Mi a buktató ok?',
  cancel: 'Mégse',
  defects: {
    noInsurance: 'Nincs biztosítás', vinMismatch: 'Alvázszám nem egyezik', colorMismatch: 'Szín nem egyezik', twoTone: 'Más színű elem, nincs beírva',
    tuningWheels: 'Tuningfelni, nincs beírva', tint: 'Sötétítés, nincs beírva', spoiler: 'Szárny, nincs beírva', lowered: 'Ültetés, nincs beírva',
    crack: 'Repedt szélvédő', bulbOut: 'Nem ég egy lámpa', ledRetrofit: 'LED izzó halogénben', emission: 'Füst / emisszió határérték felett',
    brakes: 'Rossz fék a fékpadon', suspension: 'Rossz futómű a rázópadon', oilLeak: 'Olajfolyás', jackRust: 'Rozsdás emelési pont', fenderHole: 'Átrohadt sárvédő',
    taxiColor: 'Taxi, de nem sárga', taxiAge: 'Taxi, de túl öreg', taxiEuro: 'Taxi, de Euro 4 alatti',
  },
  explain: {
    noInsurance: 'Érvényes kötelező biztosítás (KGFB) nélkül nincs műszaki vizsga.',
    vinMismatch: 'A beütött alvázszám eltér a forgalmiban szereplőtől – egyetlen karakter is elég a buktához.',
    colorMismatch: 'Az autó színe nem az, ami a forgalmiban áll.',
    twoTone: 'Egy elem más színű, és a második szín nincs bejegyezve a forgalmiba.',
    tuningWheels: 'Utólagos tuningfelni bejegyzés nélkül.',
    tint: 'Sötétített üvegfólia bejegyzés nélkül.',
    spoiler: 'Utólagos szárny/légterelő bejegyzés nélkül.',
    lowered: 'Ültetett futómű bejegyzés nélkül.',
    crack: 'Repedt szélvédő a vezető látóterében.',
    bulbOut: 'Valamelyik lámpa nem világít.',
    ledRetrofit: 'Halogén fényszóróba szerelt LED izzó – hidegfehér, kékes fény, de a forgalmiban halogén áll.',
    emission: 'A mért érték a határérték felett van.',
    brakes: 'Kevés a fékhatás, vagy túl nagy a bal–jobb eltérés egy tengelyen.',
    suspension: 'Egy kerék tapadása kevés, vagy túl nagy az eltérés egy tengelyen.',
    oilLeak: 'Csöpög az olaj – folt a padlón.',
    jackRust: 'Az emelési pont átrozsdásodott – teherhordó elem.',
    fenderHole: 'Átrohadt, lyukas sárvédő.',
    taxiColor: 'Budapesti taxinak sárgának kell lennie.',
    taxiAge: 'Túl öreg taxi: 2017 előtt forgalomba helyezettnél max. 13 év, utána max. 10 év.',
    taxiEuro: 'Taxi csak legalább Euro 4-es lehet.',
  },
  decoys: {
    kmRollback: 'Csökkent a km-óra állása – a vizsgán ez nem buktató ok.',
    manyOwners: 'Sok tulajdonos volt – ez sem számít.',
    listedMods: 'Van rajta átalakítás, de be van jegyezve – rendben.',
    surfaceRust: 'Felületi rozsda a küszöbön – nem buktató ok.',
    oilSweat: 'Az olajteknő kicsit izzad, de nem csöpög – rendben.',
    oldDieselSmoke: 'Kormol egy kicsit, de egy régi Euro 1–2-es dízel határértékén belül van.',
    noCatPetrol: 'Katalizátor nélküli öreg benzines – a saját határértékén belül van.',
    doorShade: 'Az ajtó árnyalata picit más (javított), de ugyanaz a szín – rendben.',
    twoToneListed: 'Kétszínű, de a második szín be van jegyezve – rendben.',
    factoryLed: 'Gyári LED fényszóró, a forgalmiban is LED – rendben.',
    taxiOldButOk: 'A taxi 10 évnél idősebb, de 2017 előtt helyezték forgalomba, így 13 év a határ – rendben.',
  },
  rightPass: 'Helyes! Ez az autó tényleg átmegy.',
  rightFail: 'Helyes! Bukta, és jó okot találtál.',
  rightFailWrongReason: 'A bukta jogos, de nem ez volt a hiba.',
  wrongPass: 'Hoppá! Ezt átengedted, pedig hibás volt.',
  wrongFail: 'Hoppá! Ezt megbuktattad, pedig átment volna.',
  realDefects: 'A valódi hibák:',
  noDefects: 'Nem volt rajta buktató hiba.',
  traps: 'Csapdák, amik nem buktató okok:',
  nextCar: 'Következő autó →',
  levelDone: (l, c, t) => `${l}. szint vége: ${c}/${t} jó döntés.`,
  levelPassed: 'Továbbjutottál!',
  levelFailed: (n) => `Legalább ${n} jó döntés kellett volna. Próbáld újra!`,
  nextLevel: 'Következő szint →',
  retry: 'Újra ez a szint',
  menu: 'Menü',
  allDone: 'Mind a 10 szintet teljesítetted – főfelügyelő lettél! 🏆',
  ratings: ['Főfelügyelő 🏆', 'Szigorú, de igazságos vizsgabiztos 🔧', 'Gyakornok a vizsgasoron 📋'],
  share: 'Megosztás',
  copied: 'Vágólapra másolva!',
  shareFailed: 'Nem sikerült megosztani.',
  owner: 'Tulaj',
  ownerQuotes: [
    'Tegnap még minden tökéletes volt!',
    'Csak a nagymama vitte vasárnap a templomba.',
    'Ez gyárilag ilyen, esküszöm!',
    'A sógorom szerelte, ért hozzá.',
    'Ugye nem tart sokáig? Dolgozni megyek.',
    'Húz, mint a gőzmozdony!',
    'Most volt szervizben, minden ki van cserélve.',
    'Ennél jobb állapotú példány nincs az országban.',
  ],
  handbookRules: [
    'A forgalmiban szereplő színnek kell lennie az autón. Más színű elem csak akkor lehet, ha a második szín be van jegyezve. Ugyanaz a szín, picit más árnyalat: rendben.',
    'Utólagos tuningfelni, sötétítő fólia, szárny, ültetés: csak bejegyezve.',
    'Minden lámpának világítania kell. Halogén fényszóróba LED izzó: bukta. Gyári LED (be van írva): rendben.',
    'Repedt szélvédő: bukta.',
    'Dízel füstölés (k): Euro 1–4: max. 3,0 · Euro 5: max. 1,5 · Euro 6: max. 0,7 (1/m).',
    'Benzines CO: katalizátoros max. 0,3 % · katalizátor nélküli (Euro 0) max. 3,5 %.',
    'Fékpad: fékhatás min. 50 %, tengelyenként a bal–jobb eltérés max. 30 % (az erősebb oldalhoz képest).',
    'Rázópad: kerekenként min. 40 %, tengelyen belül max. 20 pont eltérés.',
    'Olaj: csöpögés bukta, enyhe izzadás rendben. Emelési pont átrozsdásodva vagy átrohadt sárvédő: bukta. Felületi rozsda: rendben.',
    'Érvényes KGFB kötelező. A beütött alvázszámnak egyeznie kell a forgalmival.',
    'Budapesti taxi: sárga, legalább Euro 4, max. 13 év (2017-től forgalomba helyezettnél max. 10 év).',
    'Nem buktató ok: km-óra csökkenése, tulajdonosok száma.',
  ],
  close: 'Bezár',
};

const en: Dict = {
  docTitle: 'Inspector – pass or fail?',
  sign: 'VEHICLE INSPECTION',
  title: 'Inspector',
  subtitle: 'pass or fail?',
  intro: 'You are the inspector at a Hungarian vehicle test station. Cars roll in, and you have to spot what is wrong – and what only looks suspicious but is no reason to fail.',
  rules:
    'Check the car at the stations (look-over, lights, lift, brake test, shaker, emissions, insurance, VIN), compare it with the registration certificate, then decide: pass or fail. When failing, name the reason too. 5 cars per level, at least 4 right calls to move on. Rules are simplified for the game.',
  pickLevel: 'Level',
  locked: 'locked',
  start: 'Let’s go!',
  soundTitle: 'Sound on/off',
  handbook: '📘 Handbook',
  footer: 'A game with simplified rules – not official inspection requirements. Makes and models are made up.',
  level: 'Level',
  car: 'Car',
  score: 'Score',
  papersTitle: 'Registration certificate',
  f: {
    plate: 'Plate', make: 'Make, model', firstReg: 'First registered', color: 'Colour', fuel: 'Fuel', euro: 'Emission class',
    headlight: 'Headlights', entries: 'Entries', none: '–', taxi: 'Taxi', vin: 'VIN', owners: 'Owners', km: 'Odometer now', kmPrev: 'Odometer at last test',
  },
  colors: { red: 'red', blue: 'blue', white: 'white', black: 'black', silver: 'silver', green: 'green', yellow: 'yellow' },
  twoTone: (c) => `two-tone, second colour: ${c}`,
  fuels: { petrol: 'petrol', diesel: 'diesel' },
  headlights: { halogen: 'halogen', led: 'factory LED' },
  mods: { tuningWheels: 'Alloy wheels 8Jx18 ET35', tint: 'Tinted window film', spoiler: 'Rear spoiler', lowered: 'Lowered suspension (−40 mm)' },
  taxiEntry: 'Taxi (Budapest)',
  stations: { look: '👀 Look-over', lights: '💡 Lights', lift: '⬆️ Lift', brakes: '🛑 Brakes', shake: '〰️ Shaker', smoke: '💨 Emissions', insurance: '📄 Insurance', vin: '🔎 VIN' },
  frontView: 'Front view',
  protocol: 'Test report',
  protocolEmpty: 'Nothing measured yet.',
  r: {
    look: 'Look-over: check the colour, wheels, windows, bodywork and the windscreen.',
    lights: 'Lights on: headlights, indicators, tail lights – all working? What colour is the light?',
    lift: 'On the lift: look underneath – oil, jacking points, rust.',
    brakeEff: (v, min) => `Braking efficiency: ${v}%${min !== null ? ` (min. ${min}%)` : ''}`,
    brakeAxle: (a, l, r, imb) => `${a === 'front' ? 'Front' : 'Rear'} axle: L ${l} kN · R ${r} kN${imb !== null ? ` (imbalance ${imb}%)` : ''}`,
    shake: (v, c) => `Shaker: FL ${v[0]}% · FR ${v[1]}% · RL ${v[2]}% · RR ${v[3]}%${c ? ' (min. 40%, max. 20 points difference per axle)' : ''}`,
    smokeDiesel: (v, l) => `Smoke opacity: k = ${v} 1/m${l ? ` (limit: ${l})` : ''}`,
    smokePetrol: (v, l) => `Gas analysis: CO = ${v}%${l ? ` (limit: ${l}%)` : ''}`,
    insuranceOk: 'Insurance: valid third-party insurance ✔',
    insuranceNone: 'Insurance: no valid third-party insurance! ✘',
    vin: (v) => `Stamped VIN: ${v}`,
  },
  pass: '✅ Pass',
  fail: '❌ Fail',
  pickReason: 'What is the reason?',
  cancel: 'Cancel',
  defects: {
    noInsurance: 'No insurance', vinMismatch: 'VIN does not match', colorMismatch: 'Colour does not match', twoTone: 'Odd-coloured panel, not registered',
    tuningWheels: 'Aftermarket wheels, not registered', tint: 'Tinted windows, not registered', spoiler: 'Spoiler, not registered', lowered: 'Lowered, not registered',
    crack: 'Cracked windscreen', bulbOut: 'A light is out', ledRetrofit: 'LED bulb in halogen lamp', emission: 'Smoke / emissions over the limit',
    brakes: 'Bad brakes on the brake test', suspension: 'Bad suspension on the shaker', oilLeak: 'Oil leak', jackRust: 'Rusted jacking point', fenderHole: 'Rusted-through wing',
    taxiColor: 'Taxi, but not yellow', taxiAge: 'Taxi, but too old', taxiEuro: 'Taxi, but below Euro 4',
  },
  explain: {
    noInsurance: 'No valid compulsory insurance – no inspection.',
    vinMismatch: 'The stamped VIN differs from the certificate – a single character is enough to fail.',
    colorMismatch: 'The car is not the colour on the certificate.',
    twoTone: 'A panel is a different colour and the second colour is not registered.',
    tuningWheels: 'Aftermarket wheels without an entry.',
    tint: 'Window tint film without an entry.',
    spoiler: 'Aftermarket wing/spoiler without an entry.',
    lowered: 'Lowered suspension without an entry.',
    crack: 'Cracked windscreen in the driver’s view.',
    bulbOut: 'One of the lights does not work.',
    ledRetrofit: 'LED bulb in a halogen headlight – cold, bluish light, but the certificate says halogen.',
    emission: 'The measured value is over the limit.',
    brakes: 'Not enough braking, or too much left–right difference on an axle.',
    suspension: 'One wheel has too little grip, or the difference on an axle is too big.',
    oilLeak: 'Oil is dripping – there is a puddle on the floor.',
    jackRust: 'The jacking point has rusted through – that is structural.',
    fenderHole: 'Rusted-through wing with a hole.',
    taxiColor: 'A Budapest taxi must be yellow.',
    taxiAge: 'Taxi too old: max. 13 years if registered before 2017, max. 10 years after.',
    taxiEuro: 'A taxi must be at least Euro 4.',
  },
  decoys: {
    kmRollback: 'The odometer went backwards – not a reason to fail at the inspection.',
    manyOwners: 'Lots of previous owners – does not matter.',
    listedMods: 'It is modified, but the modification is registered – fine.',
    surfaceRust: 'Surface rust on the sill – not a reason to fail.',
    oilSweat: 'The oil pan sweats a little but does not drip – fine.',
    oldDieselSmoke: 'It smokes a bit, but within the limit for an old Euro 1–2 diesel.',
    noCatPetrol: 'An old petrol car without a catalyst – within its own limit.',
    doorShade: 'The door is a slightly different shade (repaired) but the same colour – fine.',
    twoToneListed: 'Two-tone, but the second colour is registered – fine.',
    factoryLed: 'Factory LED headlights, registered as LED – fine.',
    taxiOldButOk: 'The taxi is over 10 years old, but it was registered before 2017, so 13 years apply – fine.',
  },
  rightPass: 'Correct! This car really passes.',
  rightFail: 'Correct! A fail, and you found the right reason.',
  rightFailWrongReason: 'Failing it was right, but that was not the problem.',
  wrongPass: 'Oops! You passed it, but it had a defect.',
  wrongFail: 'Oops! You failed it, but it would have passed.',
  realDefects: 'The real defects:',
  noDefects: 'Nothing on it was a reason to fail.',
  traps: 'Traps that are not reasons to fail:',
  nextCar: 'Next car →',
  levelDone: (l, c, t) => `Level ${l} done: ${c}/${t} right calls.`,
  levelPassed: 'You made it!',
  levelFailed: (n) => `You needed at least ${n} right calls. Try again!`,
  nextLevel: 'Next level →',
  retry: 'Retry this level',
  menu: 'Menu',
  allDone: 'All 10 levels done – you are the chief inspector! 🏆',
  ratings: ['Chief inspector 🏆', 'Strict but fair inspector 🔧', 'Trainee on the test lane 📋'],
  share: 'Share',
  copied: 'Copied to the clipboard!',
  shareFailed: 'Couldn’t share.',
  owner: 'Owner',
  ownerQuotes: [
    'Everything was perfect yesterday!',
    'Only my grandma drove it, to church on Sundays.',
    'It came like this from the factory, I swear!',
    'My brother-in-law fixed it, he knows his stuff.',
    'This won’t take long, right? I have to get to work.',
    'Pulls like a steam engine!',
    'Just had it serviced, everything’s been replaced.',
    'You won’t find a better one in the whole country.',
  ],
  handbookRules: [
    'The car must be the colour on the certificate. A panel in another colour only if the second colour is registered. Same colour, slightly different shade: fine.',
    'Aftermarket wheels, window tint, spoiler, lowering: only if registered.',
    'Every light must work. LED bulb in a halogen headlight: fail. Factory LED (registered): fine.',
    'Cracked windscreen: fail.',
    'Diesel smoke (k): Euro 1–4: max. 3.0 · Euro 5: max. 1.5 · Euro 6: max. 0.7 (1/m).',
    'Petrol CO: with catalyst max. 0.3% · without catalyst (Euro 0) max. 3.5%.',
    'Brakes: efficiency min. 50%, left–right imbalance per axle max. 30% (of the stronger side).',
    'Shaker: min. 40% per wheel, max. 20 points difference within an axle.',
    'Oil: dripping fails, slight sweating is fine. Rusted-through jacking point or wing: fail. Surface rust: fine.',
    'Valid insurance is required. The stamped VIN must match the certificate.',
    'Budapest taxi: yellow, at least Euro 4, max. 13 years old (max. 10 if registered from 2017).',
    'Not a reason to fail: odometer going backwards, number of owners.',
  ],
  close: 'Close',
};

const de: Dict = {
  docTitle: 'Der Prüfer – bestanden oder nicht?',
  sign: 'FAHRZEUGPRÜFUNG',
  title: 'Der Prüfer',
  subtitle: 'bestanden oder nicht?',
  intro: 'Du bist Prüfer an einer ungarischen Prüfstelle. Die Autos rollen herein, und du musst erkennen, was faul ist – und was nur verdächtig aussieht, aber kein Grund zum Durchfallen ist.',
  rules:
    'Prüfe das Auto an den Stationen (Sichtprüfung, Licht, Hebebühne, Bremsenprüfstand, Fahrwerkstester, Abgas, Versicherung, FIN), vergleiche es mit dem Fahrzeugschein und entscheide: bestanden oder durchgefallen. Beim Durchfallen nenne auch den Grund. 5 Autos pro Level, mindestens 4 richtige Entscheidungen zum Weiterkommen. Die Regeln sind fürs Spiel vereinfacht.',
  pickLevel: 'Level',
  locked: 'gesperrt',
  start: 'Los geht’s!',
  soundTitle: 'Ton an/aus',
  handbook: '📘 Handbuch',
  footer: 'Ein Spiel mit vereinfachten Regeln – keine offiziellen Prüfvorschriften. Marken und Modelle sind erfunden.',
  level: 'Level',
  car: 'Auto',
  score: 'Punkte',
  papersTitle: 'Fahrzeugschein',
  f: {
    plate: 'Kennzeichen', make: 'Marke, Typ', firstReg: 'Erstzulassung', color: 'Farbe', fuel: 'Kraftstoff', euro: 'Schadstoffklasse',
    headlight: 'Scheinwerfer', entries: 'Eintragungen', none: '–', taxi: 'Taxi', vin: 'FIN', owners: 'Halter', km: 'Kilometerstand jetzt', kmPrev: 'Kilometerstand letzte Prüfung',
  },
  colors: { red: 'rot', blue: 'blau', white: 'weiß', black: 'schwarz', silver: 'silber', green: 'grün', yellow: 'gelb' },
  twoTone: (c) => `zweifarbig, Zweitfarbe: ${c}`,
  fuels: { petrol: 'Benzin', diesel: 'Diesel' },
  headlights: { halogen: 'Halogen', led: 'Werks-LED' },
  mods: { tuningWheels: 'Leichtmetallräder 8Jx18 ET35', tint: 'Getönte Scheibenfolie', spoiler: 'Heckspoiler', lowered: 'Tieferlegung (−40 mm)' },
  taxiEntry: 'Taxi (Budapest)',
  stations: { look: '👀 Sichtprüfung', lights: '💡 Licht', lift: '⬆️ Hebebühne', brakes: '🛑 Bremsen', shake: '〰️ Fahrwerk', smoke: '💨 Abgas', insurance: '📄 Versicherung', vin: '🔎 FIN' },
  frontView: 'Frontansicht',
  protocol: 'Prüfprotokoll',
  protocolEmpty: 'Noch nichts gemessen.',
  r: {
    look: 'Sichtprüfung: Farbe, Räder, Scheiben, Karosserie und Windschutzscheibe ansehen.',
    lights: 'Licht an: Scheinwerfer, Blinker, Rücklichter – alles an? Welche Lichtfarbe?',
    lift: 'Auf der Bühne: unten nachsehen – Öl, Wagenheberaufnahmen, Rost.',
    brakeEff: (v, min) => `Abbremsung: ${v} %${min !== null ? ` (min. ${min} %)` : ''}`,
    brakeAxle: (a, l, r, imb) => `${a === 'front' ? 'Vorderachse' : 'Hinterachse'}: L ${l} kN · R ${r} kN${imb !== null ? ` (Differenz ${imb} %)` : ''}`,
    shake: (v, c) => `Fahrwerkstester: VL ${v[0]} % · VR ${v[1]} % · HL ${v[2]} % · HR ${v[3]} %${c ? ' (min. 40 %, max. 20 Punkte Differenz pro Achse)' : ''}`,
    smokeDiesel: (v, l) => `Trübungsmessung: k = ${v} 1/m${l ? ` (Grenzwert: ${l})` : ''}`,
    smokePetrol: (v, l) => `Abgasanalyse: CO = ${v} %${l ? ` (Grenzwert: ${l} %)` : ''}`,
    insuranceOk: 'Versicherung: gültige Haftpflicht ✔',
    insuranceNone: 'Versicherung: keine gültige Haftpflicht! ✘',
    vin: (v) => `Eingeschlagene FIN: ${v}`,
  },
  pass: '✅ Bestanden',
  fail: '❌ Durchgefallen',
  pickReason: 'Was ist der Grund?',
  cancel: 'Abbrechen',
  defects: {
    noInsurance: 'Keine Versicherung', vinMismatch: 'FIN stimmt nicht', colorMismatch: 'Farbe stimmt nicht', twoTone: 'Andersfarbiges Teil, nicht eingetragen',
    tuningWheels: 'Tuningfelgen, nicht eingetragen', tint: 'Tönung, nicht eingetragen', spoiler: 'Spoiler, nicht eingetragen', lowered: 'Tieferlegung, nicht eingetragen',
    crack: 'Gerissene Frontscheibe', bulbOut: 'Eine Leuchte ist aus', ledRetrofit: 'LED-Birne im Halogenscheinwerfer', emission: 'Rauch / Abgas über Grenzwert',
    brakes: 'Bremsen mangelhaft', suspension: 'Fahrwerk mangelhaft', oilLeak: 'Ölverlust', jackRust: 'Durchgerostete Wagenheberaufnahme', fenderHole: 'Durchgerosteter Kotflügel',
    taxiColor: 'Taxi, aber nicht gelb', taxiAge: 'Taxi, aber zu alt', taxiEuro: 'Taxi, aber unter Euro 4',
  },
  explain: {
    noInsurance: 'Ohne gültige Haftpflichtversicherung keine Prüfung.',
    vinMismatch: 'Die eingeschlagene FIN weicht vom Fahrzeugschein ab – ein einziges Zeichen reicht.',
    colorMismatch: 'Das Auto hat nicht die Farbe aus dem Fahrzeugschein.',
    twoTone: 'Ein Teil ist andersfarbig, und die Zweitfarbe ist nicht eingetragen.',
    tuningWheels: 'Nachgerüstete Felgen ohne Eintragung.',
    tint: 'Tönungsfolie ohne Eintragung.',
    spoiler: 'Nachgerüsteter Spoiler ohne Eintragung.',
    lowered: 'Tieferlegung ohne Eintragung.',
    crack: 'Riss in der Frontscheibe im Sichtfeld.',
    bulbOut: 'Eine der Leuchten funktioniert nicht.',
    ledRetrofit: 'LED-Birne im Halogenscheinwerfer – kaltes, bläuliches Licht, eingetragen ist aber Halogen.',
    emission: 'Der Messwert liegt über dem Grenzwert.',
    brakes: 'Zu wenig Abbremsung oder zu große Links-rechts-Differenz an einer Achse.',
    suspension: 'Ein Rad hat zu wenig Bodenhaftung oder die Differenz an einer Achse ist zu groß.',
    oilLeak: 'Es tropft Öl – Fleck auf dem Boden.',
    jackRust: 'Die Wagenheberaufnahme ist durchgerostet – tragendes Teil.',
    fenderHole: 'Durchgerosteter Kotflügel mit Loch.',
    taxiColor: 'Ein Budapester Taxi muss gelb sein.',
    taxiAge: 'Taxi zu alt: max. 13 Jahre bei Zulassung vor 2017, danach max. 10 Jahre.',
    taxiEuro: 'Ein Taxi muss mindestens Euro 4 haben.',
  },
  decoys: {
    kmRollback: 'Der Kilometerstand ist gesunken – bei der Prüfung kein Durchfallgrund.',
    manyOwners: 'Viele Vorbesitzer – spielt keine Rolle.',
    listedMods: 'Umgebaut, aber eingetragen – in Ordnung.',
    surfaceRust: 'Oberflächenrost am Schweller – kein Durchfallgrund.',
    oilSweat: 'Die Ölwanne schwitzt etwas, tropft aber nicht – in Ordnung.',
    oldDieselSmoke: 'Er rußt etwas, liegt aber im Grenzwert eines alten Euro-1/2-Diesels.',
    noCatPetrol: 'Alter Benziner ohne Kat – innerhalb seines eigenen Grenzwerts.',
    doorShade: 'Die Tür hat einen etwas anderen Farbton (repariert), aber dieselbe Farbe – in Ordnung.',
    twoToneListed: 'Zweifarbig, aber die Zweitfarbe ist eingetragen – in Ordnung.',
    factoryLed: 'Werks-LED-Scheinwerfer, als LED eingetragen – in Ordnung.',
    taxiOldButOk: 'Das Taxi ist über 10 Jahre alt, wurde aber vor 2017 zugelassen, also gelten 13 Jahre – in Ordnung.',
  },
  rightPass: 'Richtig! Dieses Auto besteht wirklich.',
  rightFail: 'Richtig! Durchgefallen, und du hast den richtigen Grund gefunden.',
  rightFailWrongReason: 'Durchfallen lassen war richtig, aber das war nicht der Mangel.',
  wrongPass: 'Hoppla! Du hast es bestehen lassen, aber es hatte einen Mangel.',
  wrongFail: 'Hoppla! Du hast es durchfallen lassen, aber es hätte bestanden.',
  realDefects: 'Die echten Mängel:',
  noDefects: 'Nichts daran war ein Durchfallgrund.',
  traps: 'Fallen, die kein Durchfallgrund sind:',
  nextCar: 'Nächstes Auto →',
  levelDone: (l, c, t) => `Level ${l} geschafft: ${c}/${t} richtige Entscheidungen.`,
  levelPassed: 'Weiter geht’s!',
  levelFailed: (n) => `Du brauchtest mindestens ${n} richtige Entscheidungen. Nochmal!`,
  nextLevel: 'Nächstes Level →',
  retry: 'Level wiederholen',
  menu: 'Menü',
  allDone: 'Alle 10 Level geschafft – du bist Oberprüfer! 🏆',
  ratings: ['Oberprüfer 🏆', 'Streng, aber gerecht 🔧', 'Praktikant an der Prüfstraße 📋'],
  share: 'Teilen',
  copied: 'In die Zwischenablage kopiert!',
  shareFailed: 'Teilen fehlgeschlagen.',
  owner: 'Halter',
  ownerQuotes: [
    'Gestern war noch alles perfekt!',
    'Nur Oma ist damit sonntags zur Kirche gefahren.',
    'Das ist ab Werk so, ehrlich!',
    'Mein Schwager hat das gemacht, der kennt sich aus.',
    'Dauert nicht lange, oder? Ich muss zur Arbeit.',
    'Zieht wie eine Dampflok!',
    'War gerade in der Werkstatt, alles neu.',
    'Einen besseren findest du im ganzen Land nicht.',
  ],
  handbookRules: [
    'Das Auto muss die Farbe aus dem Fahrzeugschein haben. Ein andersfarbiges Teil nur, wenn die Zweitfarbe eingetragen ist. Gleiche Farbe, leicht anderer Farbton: in Ordnung.',
    'Nachgerüstete Felgen, Tönungsfolie, Spoiler, Tieferlegung: nur eingetragen.',
    'Alle Leuchten müssen funktionieren. LED-Birne im Halogenscheinwerfer: durchgefallen. Werks-LED (eingetragen): in Ordnung.',
    'Gerissene Frontscheibe: durchgefallen.',
    'Diesel-Trübung (k): Euro 1–4: max. 3,0 · Euro 5: max. 1,5 · Euro 6: max. 0,7 (1/m).',
    'Benzin CO: mit Kat max. 0,3 % · ohne Kat (Euro 0) max. 3,5 %.',
    'Bremsen: Abbremsung min. 50 %, Links-rechts-Differenz pro Achse max. 30 % (bezogen auf die stärkere Seite).',
    'Fahrwerk: min. 40 % pro Rad, max. 20 Punkte Differenz innerhalb einer Achse.',
    'Öl: Tropfen = durchgefallen, leichtes Schwitzen in Ordnung. Durchgerostete Wagenheberaufnahme oder Kotflügel: durchgefallen. Oberflächenrost: in Ordnung.',
    'Gültige Haftpflicht ist Pflicht. Die eingeschlagene FIN muss mit dem Fahrzeugschein übereinstimmen.',
    'Budapester Taxi: gelb, mindestens Euro 4, max. 13 Jahre alt (max. 10 bei Zulassung ab 2017).',
    'Kein Durchfallgrund: gesunkener Kilometerstand, Anzahl der Halter.',
  ],
  close: 'Schließen',
};

export const DICTS: Record<Lang, Dict> = { hu, en, de };

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('vizsga-lang');
    if (saved === 'hu' || saved === 'en' || saved === 'de') return saved;
  } catch {
    // storage unavailable
  }
  const nav = (navigator.language || 'hu').slice(0, 2);
  return nav === 'de' ? 'de' : nav === 'hu' ? 'hu' : 'en';
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem('vizsga-lang', lang);
  } catch {
    // ignore
  }
}

/** Decimal comma for HU/DE. */
export function num(v: number, lang: Lang, digits = 1): string {
  const s = v.toFixed(digits);
  return lang === 'en' ? s : s.replace('.', ',');
}
