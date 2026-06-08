import { generateSafetyWarnings } from '../safety.js';

describe('generateSafetyWarnings', () => {
  test('ingen advarsler ved milde forhold', () => {
    const warnings = generateSafetyWarnings(15, 3, 45, 'rusling');
    expect(warnings).toHaveLength(0);
  });

  test('critical ved ekstrem kulde < -27°C', () => {
    const warnings = generateSafetyWarnings(-30, 2, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'critical')).toBe(true);
  });

  test('high ved kulde < -15°C', () => {
    const warnings = generateSafetyWarnings(-16, 2, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'high')).toBe(true);
    expect(warnings.some((w) => w.level === 'critical')).toBe(false);
  });

  test('medium ved sterk vind > 30 km/h', () => {
    const warnings = generateSafetyWarnings(5, 10, 45, 'rusling'); // 36 km/h
    expect(warnings.some((w) => w.level === 'medium')).toBe(true);
  });

  test('high ved ekstremt vind > 50 km/h', () => {
    const warnings = generateSafetyWarnings(5, 15, 45, 'rusling'); // 54 km/h
    expect(warnings.some((w) => w.level === 'high')).toBe(true);
  });

  test('low-advarsel for løping ved stopp-risiko', () => {
    const warnings = generateSafetyWarnings(2, 2, 45, 'løping');
    expect(warnings.some((w) => w.level === 'low' && w.message.includes('Stopp'))).toBe(true);
  });

  test('medium advarsel ved lang varighet i kulde', () => {
    const warnings = generateSafetyWarnings(-2, 2, 150, 'fjelltur');
    expect(warnings.some((w) => w.message.includes('gradvis avkjøling'))).toBe(true);
  });

  // Temperature boundary values — all conditions use STRICT less-than (<), so the exact
  // threshold temperature falls into the LOWER (less severe) category.
  test('-27.1°C → critical (under grensen)', () => {
    const warnings = generateSafetyWarnings(-27.1, 0, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'critical')).toBe(true);
  });

  test('nøyaktig -27°C → high (ikke critical — betingelse er < -27)', () => {
    const warnings = generateSafetyWarnings(-27, 0, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'critical')).toBe(false);
    expect(warnings.some((w) => w.level === 'high')).toBe(true);
  });

  test('-16°C → high', () => {
    const warnings = generateSafetyWarnings(-16, 0, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'high')).toBe(true);
    expect(warnings.some((w) => w.level === 'critical')).toBe(false);
  });

  test('nøyaktig -15°C → medium (ikke high — betingelse er < -15)', () => {
    const warnings = generateSafetyWarnings(-15, 0, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'high')).toBe(false);
    expect(warnings.some((w) => w.level === 'medium')).toBe(true);
  });

  test('-6°C → medium kulde-advarsel', () => {
    const warnings = generateSafetyWarnings(-6, 0, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'medium' && w.message.includes('frostskade'))).toBe(true);
  });

  test('nøyaktig -5°C → ingen kulde-advarsel (betingelse er < -5)', () => {
    const warnings = generateSafetyWarnings(-5, 0, 30, 'rusling');
    expect(warnings.some((w) => w.message.includes('frostskade'))).toBe(false);
  });

  test('-4.9°C → ingen kulde-advarsel', () => {
    const warnings = generateSafetyWarnings(-4.9, 0, 30, 'rusling');
    expect(warnings.some((w) => w.message.includes('frostskade'))).toBe(false);
  });

  // Wind boundary values (km/h thresholds, windSpeed in m/s)
  test('vind nøyaktig > 50 km/h → high vindadvarsel', () => {
    // 13.9 m/s = 50.04 km/h > 50
    const warnings = generateSafetyWarnings(10, 13.9, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'high' && w.message.includes('Ekstremt vind'))).toBe(true);
  });

  test('vind nøyaktig > 30 km/h → medium vindadvarsel', () => {
    // 8.34 m/s = 30.02 km/h > 30
    const warnings = generateSafetyWarnings(10, 8.34, 30, 'rusling');
    expect(warnings.some((w) => w.level === 'medium' && w.message.includes('vind'))).toBe(true);
  });

  test('vind nøyaktig 30 km/h (8.333 m/s) → ingen vindadvarsel (krever > 30)', () => {
    const warnings = generateSafetyWarnings(10, 8.333, 30, 'rusling'); // 29.999 km/h
    expect(warnings.some((w) => w.message.toLowerCase().includes('vind'))).toBe(false);
  });

  // Long duration — requires BOTH durationMinutes > 120 AND effectiveTemp < 0 (both strict)
  test('121 min ved -1°C → gradvis-avkjøling-advarsel', () => {
    const warnings = generateSafetyWarnings(-1, 2, 121, 'rusling');
    expect(warnings.some((w) => w.message.includes('gradvis avkjøling'))).toBe(true);
  });

  test('121 min ved nøyaktig 0°C → ingen advarsel (betingelse er < 0, ikke <= 0)', () => {
    const warnings = generateSafetyWarnings(0, 2, 121, 'rusling');
    expect(warnings.some((w) => w.message.includes('gradvis avkjøling'))).toBe(false);
  });

  test('lang varighet men over 0°C → ingen gradvis-avkjøling-advarsel', () => {
    const warnings = generateSafetyWarnings(1, 2, 150, 'rusling');
    expect(warnings.some((w) => w.message.includes('gradvis avkjøling'))).toBe(false);
  });

  test('nøyaktig 120 min i kulde → ingen gradvis-avkjøling (krever > 120)', () => {
    const warnings = generateSafetyWarnings(-2, 2, 120, 'rusling');
    expect(warnings.some((w) => w.message.includes('gradvis avkjøling'))).toBe(false);
  });

  // High-intensity activities get stopp-warning at < 5°C
  test('sykling < 5°C → stopp-advarsel (høy intensitet)', () => {
    const warnings = generateSafetyWarnings(2, 2, 60, 'sykling');
    expect(warnings.some((w) => w.level === 'low' && w.message.includes('Stopp'))).toBe(true);
  });

  test('langrenn < 5°C → stopp-advarsel (høy intensitet)', () => {
    const warnings = generateSafetyWarnings(2, 2, 60, 'langrenn');
    expect(warnings.some((w) => w.level === 'low' && w.message.includes('Stopp'))).toBe(true);
  });

  test('fjelltur < 5°C → ingen stopp-advarsel (lav intensitet)', () => {
    const warnings = generateSafetyWarnings(2, 2, 60, 'fjelltur');
    expect(warnings.some((w) => w.level === 'low' && w.message.includes('Stopp'))).toBe(false);
  });

  test('løping >= 5°C → ingen stopp-advarsel', () => {
    const warnings = generateSafetyWarnings(5, 2, 60, 'løping');
    expect(warnings.some((w) => w.message.includes('Stopp'))).toBe(false);
  });

  // Multiple simultaneous warnings
  test('kulde + vind + lang varighet + høy intensitet → minst 3 advarsler', () => {
    // -10°C (medium), 12 m/s = 43.2 km/h (medium vind), 180 min (medium varighet), løping (low stopp)
    const warnings = generateSafetyWarnings(-10, 12, 180, 'løping');
    expect(warnings.length).toBeGreaterThanOrEqual(3);
  });

  // All warnings have required fields
  test('alle advarsler har level, message og recommendation', () => {
    const warnings = generateSafetyWarnings(-20, 12, 180, 'løping');
    for (const w of warnings) {
      expect(w).toHaveProperty('level');
      expect(w).toHaveProperty('message');
      expect(w).toHaveProperty('recommendation');
      expect(w.message.length).toBeGreaterThan(0);
      expect(w.recommendation.length).toBeGreaterThan(0);
    }
  });
});
