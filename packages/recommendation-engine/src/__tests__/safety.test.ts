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
});
