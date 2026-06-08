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
});

describe('getTargetClo', () => {
  test('25°C → 0.05 CLO', () => expect(getTargetClo(25)).toBe(0.05));
  test('22°C → 0.15 CLO', () => expect(getTargetClo(22)).toBe(0.15));
  test('12°C → 0.55 CLO', () => expect(getTargetClo(12)).toBe(0.55));
  test('0°C → 1.0 CLO', () => expect(getTargetClo(0)).toBe(1.0));
  test('-5°C → 1.25 CLO', () => expect(getTargetClo(-5)).toBe(1.25));
  test('-15°C → 1.65 CLO', () => expect(getTargetClo(-15)).toBe(1.65));
});
