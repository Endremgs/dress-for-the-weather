import { calcApparentTemp, calcActivityOffset, calcEffectiveTemp, getTargetClo } from '../algorithm.js';

describe('calcApparentTemp', () => {
  test('wind chill: Oslo vinter (-5°C, 5 m/s)', () => {
    const result = calcApparentTemp(-5, 5, 70);
    // Domain example shows -9.5 but has arithmetic error (11.37×18^0.16 ≈ 18.05, not 16.64)
    // Correct JAG/TI result is ~-11.2°C
    expect(result).toBeCloseTo(-11.2, 0);
  });

  test('wind chill: no effect below 4.8 km/h wind', () => {
    const result = calcApparentTemp(-5, 1, 70); // 3.6 km/h < 4.8
    // Falls through to Steadman formula
    expect(result).toBeLessThan(-5);
  });

  test('Steadman: summer temp above 10°C', () => {
    const result = calcApparentTemp(22, 3, 55);
    // Warm day, slight humidity boost minus wind
    expect(result).toBeGreaterThan(15);
    expect(result).toBeLessThan(25);
  });

  // Boundary: condition is airTemp < 10 (strict less-than)
  test('grense: nøyaktig 10°C med sterk vind → Steadman (ikke vindkjøling)', () => {
    const at10 = calcApparentTemp(10, 5, 70);
    const at99 = calcApparentTemp(9.9, 5, 70);
    // Different formulas → different results
    expect(at10).not.toBeCloseTo(at99, 0);
    // Steadman at 10°C, 5 m/s gives roughly 5–6°C
    expect(at10).toBeGreaterThan(4);
    expect(at10).toBeLessThan(8);
  });

  // Boundary: wind threshold is windKmh > 4.8 (strict greater-than)
  test('grense: vind nøyaktig 4.8 km/h (1.333 m/s) → Steadman', () => {
    // 1.333 m/s * 3.6 = 4.8 km/h, which is NOT > 4.8 → uses Steadman
    const result = calcApparentTemp(-5, 1.333, 70);
    // Steadman formula: approx -8.7°C (see weather.ts tests for formula details)
    expect(result).toBeLessThan(-5);
  });

  test('grense: vind 1.4 m/s (5.04 km/h) → vindkjøling brukes for -5°C', () => {
    const withWindChill = calcApparentTemp(-5, 1.4, 70); // 5.04 km/h > 4.8
    const withSteadman = calcApparentTemp(-5, 1.333, 70); // 4.8 km/h ≤ 4.8
    // Wind chill formula gives different result than Steadman
    expect(withWindChill).not.toBeCloseTo(withSteadman, 1);
  });

  test('ingen vind og høy luftfuktighet → Steadman gir varmere enn lufttemp', () => {
    // High humidity adds heat stress via vapor pressure
    const result = calcApparentTemp(30, 0, 95);
    expect(result).toBeGreaterThan(30);
  });

  test('ekstremt kald + sterk vind → langt under lufttemp', () => {
    const result = calcApparentTemp(-20, 15, 60); // 54 km/h wind
    expect(result).toBeLessThan(-30);
  });
});

describe('calcActivityOffset', () => {
  test('løping MET 8.0 → offset 5.6', () => {
    expect(calcActivityOffset('løping')).toBeCloseTo(5.6, 5);
  });

  test('rusling MET 3.5 → offset 2.0', () => {
    expect(calcActivityOffset('rusling')).toBeCloseTo(2.0, 5);
  });

  test('langrenn MET 9.0 → offset 6.4', () => {
    expect(calcActivityOffset('langrenn')).toBeCloseTo(6.4, 5);
  });

  // All remaining activities — formula: (MET - 1.0) * 0.8
  test('sykling MET 8.0 → offset 5.6 (samme som løping)', () => {
    expect(calcActivityOffset('sykling')).toBeCloseTo(5.6, 5);
  });

  test('fjelltur MET 5.5 → offset 3.6', () => {
    expect(calcActivityOffset('fjelltur')).toBeCloseTo(3.6, 5);
  });

  test('alpint MET 7.0 → offset 4.8', () => {
    expect(calcActivityOffset('alpint')).toBeCloseTo(4.8, 5);
  });

  test('klatring MET 6.0 → offset 4.0', () => {
    expect(calcActivityOffset('klatring')).toBeCloseTo(4.0, 5);
  });

  test('svømming MET 10.0 → offset 7.2 (høyest)', () => {
    expect(calcActivityOffset('svømming')).toBeCloseTo(7.2, 5);
  });

  test('offset er alltid positiv (alle aktiviteter har MET > 1.0)', () => {
    const activities = ['rusling', 'løping', 'sykling', 'fjelltur', 'langrenn', 'alpint', 'klatring', 'svømming'] as const;
    for (const activity of activities) {
      expect(calcActivityOffset(activity)).toBeGreaterThan(0);
    }
  });
});

describe('calcEffectiveTemp', () => {
  test('Eksempel 1: Oslo vinter, løping 45 min', () => {
    // apparentTemp ≈ -9.5, offset 5.6, duration 45 min, no precip, sensitivity 0
    const result = calcEffectiveTemp(-9.5, 5.6, 45, 'none', 0);
    // Expected ~-5.5°C from domain example
    expect(result).toBeCloseTo(-5.5, 0);
  });

  test('Eksempel 2: Hardangervidda fjelltur', () => {
    // apparentTemp ≈ -3.4, offset 3.6, duration 240 min, light precip
    const result = calcEffectiveTemp(-3.4, 3.6, 240, 'light', 0);
    // Expected ~-2.5°C from domain example
    expect(result).toBeCloseTo(-2.5, 0);
  });

  test('Eksempel 3: Sommersykkel', () => {
    // apparentTemp 22, offset 5.6, duration 90 min, no precip
    const result = calcEffectiveTemp(22, 5.6, 90, 'none', 0);
    // Expected ~25.9°C from domain example
    expect(result).toBeCloseTo(25.9, 0);
  });

  test('sensitivity +2 gir høyere effektiv temp', () => {
    const base = calcEffectiveTemp(0, 2.0, 30, 'none', 0);
    const warm = calcEffectiveTemp(0, 2.0, 30, 'none', 2);
    expect(warm).toBeGreaterThan(base);
    expect(warm - base).toBeCloseTo(2, 5);
  });

  test('heavy precip gir 3°C kaldere enn none', () => {
    const dry = calcEffectiveTemp(5, 3.0, 60, 'none', 0);
    const wet = calcEffectiveTemp(5, 3.0, 60, 'heavy', 0);
    expect(dry - wet).toBeCloseTo(3.0, 5);
  });

  // Sensitivity edge cases
  test('sensitivity -2 gir 4°C kaldere enn +2', () => {
    const warm = calcEffectiveTemp(10, 3.0, 60, 'none', 2);
    const cold = calcEffectiveTemp(10, 3.0, 60, 'none', -2);
    expect(warm - cold).toBeCloseTo(4, 5);
  });

  // All precipitation levels
  test('nedbørsnivåer: none < light < moderate < heavy', () => {
    const base = (precip: Parameters<typeof calcEffectiveTemp>[3]) =>
      calcEffectiveTemp(10, 0, 30, precip, 0);
    expect(base('none')).toBeGreaterThan(base('light'));
    expect(base('light')).toBeGreaterThan(base('moderate'));
    expect(base('moderate')).toBeGreaterThan(base('heavy'));
  });

  test('light precip: 0.9°C kaldere enn none', () => {
    const dry = calcEffectiveTemp(10, 0, 0, 'none', 0);
    const wet = calcEffectiveTemp(10, 0, 0, 'light', 0);
    expect(dry - wet).toBeCloseTo(0.9, 5);
  });

  test('moderate precip: 1.8°C kaldere enn none', () => {
    const dry = calcEffectiveTemp(10, 0, 0, 'none', 0);
    const wet = calcEffectiveTemp(10, 0, 0, 'moderate', 0);
    expect(dry - wet).toBeCloseTo(1.8, 5);
  });

  // Duration factor: durationFactor = 1.0 + (minutes/60)*0.05, subtracted * 1.5
  test('0 minutters varighet → trekker fra 1.5°C (minimum)', () => {
    const result = calcEffectiveTemp(10, 0, 0, 'none', 0);
    expect(result).toBeCloseTo(8.5, 5);
  });

  test('60 minutters varighet → litt kaldere enn 0 min', () => {
    const short = calcEffectiveTemp(10, 0, 0, 'none', 0);
    const long = calcEffectiveTemp(10, 0, 60, 'none', 0);
    expect(long).toBeLessThan(short);
  });

  test('lengre varighet gir lavere effectiveTemp (økt isolasjonsbehov)', () => {
    const t30 = calcEffectiveTemp(10, 0, 30, 'none', 0);
    const t120 = calcEffectiveTemp(10, 0, 120, 'none', 0);
    const t300 = calcEffectiveTemp(10, 0, 300, 'none', 0);
    expect(t30).toBeGreaterThan(t120);
    expect(t120).toBeGreaterThan(t300);
  });
});

describe('getTargetClo', () => {
  test('25°C → 0.05 CLO', () => expect(getTargetClo(25)).toBe(0.05));
  test('22°C → 0.15 CLO', () => expect(getTargetClo(22)).toBe(0.15));
  test('12°C → 0.55 CLO', () => expect(getTargetClo(12)).toBe(0.55));
  test('0°C → 1.0 CLO', () => expect(getTargetClo(0)).toBe(1.0));
  test('-5°C → 1.25 CLO', () => expect(getTargetClo(-5)).toBe(1.25));
  test('-15°C → 1.65 CLO', () => expect(getTargetClo(-15)).toBe(1.65));

  // Boundary values — each threshold is inclusive at the lower end (effectiveTemp >= minTemp)
  test('nøyaktig 20°C → 0.15 CLO (grenseverdi)', () => expect(getTargetClo(20)).toBe(0.15));
  test('19°C → 0.35 CLO (under 20-grensen)', () => expect(getTargetClo(19)).toBe(0.35));
  test('nøyaktig 15°C → 0.35 CLO', () => expect(getTargetClo(15)).toBe(0.35));
  test('14°C → 0.55 CLO', () => expect(getTargetClo(14)).toBe(0.55));
  test('nøyaktig 10°C → 0.55 CLO', () => expect(getTargetClo(10)).toBe(0.55));
  test('9°C → 0.75 CLO', () => expect(getTargetClo(9)).toBe(0.75));
  test('nøyaktig 5°C → 0.75 CLO', () => expect(getTargetClo(5)).toBe(0.75));
  test('4°C → 1.0 CLO', () => expect(getTargetClo(4)).toBe(1.0));
  test('nøyaktig -10°C → 1.45 CLO', () => expect(getTargetClo(-10)).toBe(1.45));
  test('-11°C → 1.65 CLO (laveste sone)', () => expect(getTargetClo(-11)).toBe(1.65));
  test('-40°C → 1.65 CLO (ekstrem kulde)', () => expect(getTargetClo(-40)).toBe(1.65));

  test('CLO øker monotont med synkende temperatur', () => {
    const temps = [30, 22, 17, 12, 7, 2, -2, -7, -12];
    const clos = temps.map(getTargetClo);
    for (let i = 0; i < clos.length - 1; i++) {
      expect(clos[i]).toBeLessThanOrEqual(clos[i + 1]!);
    }
  });
});
