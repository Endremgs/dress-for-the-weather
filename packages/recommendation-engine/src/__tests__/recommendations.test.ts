import { buildRecommendations } from '../recommendations.js';

// buildRecommendations(effectiveTemp, windSpeed, precipitation, activity)
// When editing recommendations.ts, update the relevant describe-block here.

describe('head recommendations', () => {
  test('< -10 → Balaklava required', () => {
    const r = buildRecommendations(-11, 0, 'none', 'rusling');
    expect(r.head).toMatchObject({ required: true, item: 'Balaklava' });
  });

  test('exactly -10 → Tykk ullmøss (boundary: -10 is NOT < -10)', () => {
    const r = buildRecommendations(-10, 0, 'none', 'rusling');
    expect(r.head.item).toBe('Tykk ullmøss');
    expect(r.head.required).toBe(true);
  });

  test('between -10 and 0 → Tykk ullmøss required', () => {
    const r = buildRecommendations(-3, 0, 'none', 'rusling');
    expect(r.head).toMatchObject({ required: true, item: 'Tykk ullmøss' });
  });

  test('between 0 and 5 → Ullmøss required', () => {
    const r = buildRecommendations(3, 0, 'none', 'rusling');
    expect(r.head).toMatchObject({ required: true, item: 'Ullmøss' });
  });

  test('between 5 and 10 → Lett lue/caps not required', () => {
    const r = buildRecommendations(7, 0, 'none', 'rusling');
    expect(r.head).toMatchObject({ required: false, item: 'Lett lue/caps' });
  });

  test('>= 10 → Valgfri caps not required', () => {
    const r = buildRecommendations(15, 0, 'none', 'rusling');
    expect(r.head).toMatchObject({ required: false, item: 'Valgfri caps' });
  });
});

describe('neck recommendations', () => {
  test('< 0 → Halsverner required', () => {
    const r = buildRecommendations(-2, 0, 'none', 'rusling');
    expect(r.neck).toMatchObject({ required: true, item: 'Halsverner / buff / skjerf' });
  });

  test('between 0 and 5 → Buff not required', () => {
    const r = buildRecommendations(3, 0, 'none', 'rusling');
    expect(r.neck).toMatchObject({ required: false, item: 'Buff (anbefalt)' });
  });

  test('>= 5 → Ikke nødvendig', () => {
    const r = buildRecommendations(10, 0, 'none', 'rusling');
    expect(r.neck).toMatchObject({ required: false, item: 'Ikke nødvendig' });
  });
});

describe('glove recommendations', () => {
  test('< -15 → Tykke votter + liner required', () => {
    const r = buildRecommendations(-18, 0, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: true, item: 'Tykke votter + liner' });
  });

  test('exactly -15 → Isolerte hansker (boundary: -15 is NOT < -15)', () => {
    const r = buildRecommendations(-15, 0, 'none', 'rusling');
    expect(r.hands.item).toBe('Isolerte hansker');
    expect(r.hands.required).toBe(true);
  });

  test('between -15 and -5 → Isolerte hansker required', () => {
    const r = buildRecommendations(-8, 0, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: true, item: 'Isolerte hansker' });
  });

  test('between -5 and 0 → Medium hansker required', () => {
    const r = buildRecommendations(-2, 0, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: true, item: 'Medium hansker' });
  });

  test('between 0 and 5 → Lette hansker required', () => {
    const r = buildRecommendations(3, 0, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: true, item: 'Lette hansker' });
  });

  test('between 5 and 10 without wind → Lette hansker anbefalt not required', () => {
    const r = buildRecommendations(7, 0, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: false, item: 'Lette hansker (anbefalt)' });
  });

  test('>= 10 no wind → Ikke nødvendig', () => {
    const r = buildRecommendations(12, 0, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: false, item: 'Ikke nødvendig' });
  });

  test('wind > 30 km/h at any temp → Lette hansker required', () => {
    // 9 m/s = 32.4 km/h > 30 km/h
    const r = buildRecommendations(15, 9, 'none', 'rusling');
    expect(r.hands).toMatchObject({ required: true, item: 'Lette hansker' });
  });

  test('wind exactly 30 km/h (8.33 m/s) → NOT triggered (requires > 30)', () => {
    // 8.33 m/s = 29.99 km/h ≈ 30 km/h — just below threshold
    const r = buildRecommendations(12, 8.33, 'none', 'rusling');
    expect(r.hands.required).toBe(false);
  });
});

describe('feet recommendations', () => {
  test('< -10 → Tykke vintersokker + varmfôrede støvler', () => {
    const r = buildRecommendations(-12, 0, 'none', 'rusling');
    expect(r.feet.item).toBe('Tykke vintersokker + varmfôrede støvler');
    expect(r.feet.clo).toBe(0.12);
  });

  test('between -10 and 0, no precip → Tykke ullsokker', () => {
    const r = buildRecommendations(-3, 0, 'none', 'rusling');
    expect(r.feet.item).toBe('Tykke ullsokker');
    expect(r.feet.clo).toBe(0.08);
  });

  test('between -10 and 0, with precip → Ullsokker + vanntette støvler', () => {
    const r = buildRecommendations(-3, 0, 'light', 'rusling');
    expect(r.feet.item).toBe('Ullsokker + vanntette støvler');
  });

  test('between 0 and 10, no precip → Ullsokker', () => {
    const r = buildRecommendations(5, 0, 'none', 'rusling');
    expect(r.feet.item).toBe('Ullsokker');
    expect(r.feet.clo).toBe(0.06);
  });

  test('between 0 and 10, with precip → Ullsokker + GoreTex-sko', () => {
    const r = buildRecommendations(5, 0, 'moderate', 'rusling');
    expect(r.feet.item).toBe('Ullsokker + GoreTex-sko');
  });

  test('>= 10 → Lette sokker', () => {
    const r = buildRecommendations(15, 0, 'none', 'rusling');
    expect(r.feet.item).toBe('Lette sokker');
    expect(r.feet.clo).toBe(0.02);
  });
});

describe('upper body - base layer', () => {
  test('< -5, low-intensity activity → Tung termo-base, merino material', () => {
    const r = buildRecommendations(-7, 0, 'none', 'rusling');
    expect(r.upperBody.baseLayer).toMatchObject({
      required: true,
      item: 'Tung termo-base',
      material: 'merino eller syntetisk',
      clo: 0.17,
    });
  });

  test('< -5, high-intensity activity → Tung termo-base, syntetisk material', () => {
    const r = buildRecommendations(-7, 0, 'none', 'løping');
    expect(r.upperBody.baseLayer.material).toBe('syntetisk eller merino');
  });

  test('sykling uses syntetisk material (activity-specific base layer)', () => {
    const r = buildRecommendations(0, 0, 'none', 'sykling');
    expect(r.upperBody.baseLayer.material).toBe('syntetisk fleece-børstet');
  });

  test('fjelltur uses merino material (low intensity)', () => {
    const r = buildRecommendations(0, 0, 'none', 'fjelltur');
    expect(r.upperBody.baseLayer.material).toBe('merino eller syntetisk');
  });

  test('between -5 and 5 → Medium termo-base', () => {
    const r = buildRecommendations(3, 0, 'none', 'rusling');
    expect(r.upperBody.baseLayer).toMatchObject({ item: 'Medium termo-base', clo: 0.12 });
  });

  test('between 5 and 15 → Lett langermet base', () => {
    const r = buildRecommendations(10, 0, 'none', 'rusling');
    expect(r.upperBody.baseLayer).toMatchObject({ item: 'Lett langermet base', clo: 0.07 });
  });

  test('>= 15 → T-skjorte / løpe-singlet', () => {
    const r = buildRecommendations(20, 0, 'none', 'rusling');
    expect(r.upperBody.baseLayer).toMatchObject({ item: 'T-skjorte / løpe-singlet', clo: 0.04 });
  });
});

describe('upper body - mid layer', () => {
  test('> 15 → null for all activities', () => {
    const r = buildRecommendations(16, 0, 'none', 'rusling');
    expect(r.upperBody.midLayer).toBeNull();
  });

  test('løping > 5°C → null (domain rule: dress 10°C warmer)', () => {
    const r = buildRecommendations(6, 0, 'none', 'løping');
    expect(r.upperBody.midLayer).toBeNull();
  });

  test('løping at exactly 5°C → not null (5 is NOT > 5)', () => {
    const r = buildRecommendations(5, 0, 'none', 'løping');
    expect(r.upperBody.midLayer).not.toBeNull();
  });

  test('langrenn > 0°C → null (domain rule: dress 15°C warmer, highest heat output)', () => {
    const r = buildRecommendations(1, 0, 'none', 'langrenn');
    expect(r.upperBody.midLayer).toBeNull();
  });

  test('langrenn at exactly 0°C → not null (0 is NOT > 0)', () => {
    const r = buildRecommendations(0, 0, 'none', 'langrenn');
    expect(r.upperBody.midLayer).not.toBeNull();
  });

  test('< -10 → Tykk fleece (300-vekt) required', () => {
    const r = buildRecommendations(-12, 0, 'none', 'rusling');
    expect(r.upperBody.midLayer).toMatchObject({
      required: true,
      item: 'Tykk fleece (300-vekt) eller dun-jakke',
      clo: 0.32,
    });
  });

  test('between -10 and -5 → Medium fleece (200-vekt)', () => {
    const r = buildRecommendations(-7, 0, 'none', 'rusling');
    expect(r.upperBody.midLayer).toMatchObject({ item: 'Medium fleece (200-vekt)', clo: 0.25 });
  });

  test('between -5 and 5 → Lett fleece (100-vekt) required', () => {
    const r = buildRecommendations(2, 0, 'none', 'rusling');
    expect(r.upperBody.midLayer).toMatchObject({
      required: true,
      item: 'Lett fleece (100-vekt)',
      clo: 0.18,
    });
  });

  test('between 5 and 15 (non-løping/langrenn) → Lett fleece valgfri not required', () => {
    const r = buildRecommendations(8, 0, 'none', 'rusling');
    expect(r.upperBody.midLayer).toMatchObject({ required: false, item: 'Lett fleece (valgfri)' });
  });
});

describe('upper body - outer layer', () => {
  test('moderate precipitation → Hardshell regnjakke required', () => {
    const r = buildRecommendations(10, 0, 'moderate', 'rusling');
    expect(r.upperBody.outerLayer).toMatchObject({ required: true, item: 'Hardshell regnjakke' });
  });

  test('heavy precipitation → Hardshell regnjakke required', () => {
    const r = buildRecommendations(10, 0, 'heavy', 'rusling');
    expect(r.upperBody.outerLayer).toMatchObject({ required: true, item: 'Hardshell regnjakke' });
  });

  test('heavy precipitation + sykling → activity-specific rain jacket', () => {
    const r = buildRecommendations(10, 0, 'heavy', 'sykling');
    expect(r.upperBody.outerLayer?.item).toBe('Sykkeljakke regn (vanntett)');
  });

  test('light precipitation + sykling → Sykkeljakke regn (vanntett)', () => {
    const r = buildRecommendations(10, 0, 'light', 'sykling');
    expect(r.upperBody.outerLayer).toMatchObject({
      required: true,
      item: 'Sykkeljakke regn (vanntett)',
    });
  });

  test('light precipitation + non-sykling → Lett regnjakke', () => {
    const r = buildRecommendations(10, 0, 'light', 'løping');
    expect(r.upperBody.outerLayer).toMatchObject({ required: true, item: 'Lett regnjakke' });
  });

  test('no precip, effectiveTemp < -5 → Vindtett jakke required', () => {
    const r = buildRecommendations(-7, 0, 'none', 'rusling');
    expect(r.upperBody.outerLayer).toMatchObject({
      required: true,
      item: 'Vindtett løpe-/turjakke',
    });
  });

  test('no precip, windy (> 20 km/h) → Vindtett jakke required', () => {
    // 6 m/s = 21.6 km/h > 20 km/h
    const r = buildRecommendations(10, 6, 'none', 'rusling');
    expect(r.upperBody.outerLayer).toMatchObject({
      required: true,
      item: 'Vindtett løpe-/turjakke',
    });
  });

  test('no precip, effectiveTemp between -5 and 5, calm → Vindjakke anbefalt not required', () => {
    const r = buildRecommendations(3, 2, 'none', 'rusling');
    expect(r.upperBody.outerLayer).toMatchObject({ required: false, item: 'Vindjakke (anbefalt)' });
  });

  test('no precip, calm, effectiveTemp >= 5 → null', () => {
    const r = buildRecommendations(15, 2, 'none', 'rusling');
    expect(r.upperBody.outerLayer).toBeNull();
  });
});

describe('lower body - base layer', () => {
  test('low-intensity, effectiveTemp >= 5 → null', () => {
    const r = buildRecommendations(7, 0, 'none', 'rusling');
    expect(r.lowerBody.baseLayer).toBeNull();
  });

  test('effectiveTemp < 0 → Termotights required', () => {
    const r = buildRecommendations(-2, 0, 'none', 'rusling');
    expect(r.lowerBody.baseLayer).toMatchObject({
      required: true,
      item: 'Termotights (underneden)',
      clo: 0.18,
    });
  });

  test('effectiveTemp between 0 and 5 → Lett termotights anbefalt not required', () => {
    const r = buildRecommendations(3, 0, 'none', 'rusling');
    expect(r.lowerBody.baseLayer).toMatchObject({
      required: false,
      item: 'Lett termotights (anbefalt)',
    });
  });
});

describe('lower body - outer layer', () => {
  test('effectiveTemp > 20 → Shorts', () => {
    const r = buildRecommendations(22, 0, 'none', 'rusling');
    expect(r.lowerBody.outerLayer).toMatchObject({ item: 'Shorts' });
  });

  test('løping, effectiveTemp > 10 → Løpeshorts', () => {
    const r = buildRecommendations(17, 0, 'none', 'løping');
    expect(r.lowerBody.outerLayer.item).toBe('Løpeshorts');
  });

  test('rusling, effectiveTemp = 17 → NOT shorts (only løping gets shorts below 20°C)', () => {
    const r = buildRecommendations(17, 0, 'none', 'rusling');
    expect(r.lowerBody.outerLayer.item).not.toBe('Shorts');
  });

  test('sykling, effectiveTemp between 12 and 16 → Sykkelshorts (bib) + knevarmere', () => {
    const r = buildRecommendations(12, 0, 'none', 'sykling');
    expect(r.lowerBody.outerLayer.item).toBe('Sykkelshorts (bib) + knevarmere');
  });

  test('non-sykling, effectiveTemp between 10 and 20 → Lett friluftsbukse', () => {
    const r = buildRecommendations(12, 0, 'none', 'rusling');
    expect(r.lowerBody.outerLayer.item).toBe('Lett friluftsbukse');
  });

  test('effectiveTemp between 0 and 10, no precip → Softshell-bukse', () => {
    const r = buildRecommendations(5, 0, 'none', 'rusling');
    expect(r.lowerBody.outerLayer.item).toBe('Softshell-bukse / tights');
  });

  test('effectiveTemp between 0 and 10, with precip → Softshell + regnbukse', () => {
    const r = buildRecommendations(5, 0, 'light', 'rusling');
    expect(r.lowerBody.outerLayer.item).toBe('Softshell-bukse / tights + regnbukse');
  });

  test('sykling, effectiveTemp between 0 and 7 → Termiske sykkel-tights', () => {
    const r = buildRecommendations(5, 0, 'none', 'sykling');
    expect(r.lowerBody.outerLayer.item).toBe('Termiske sykkel-tights');
  });

  test('effectiveTemp <= 0, no precip → Vinterbukse / isolerte tights', () => {
    const r = buildRecommendations(-3, 0, 'none', 'rusling');
    expect(r.lowerBody.outerLayer.item).toBe('Vinterbukse / isolerte tights');
  });

  test('effectiveTemp <= 0, with precip → Vinterbukse + regnbukse', () => {
    const r = buildRecommendations(-3, 0, 'heavy', 'rusling');
    expect(r.lowerBody.outerLayer.item).toBe('Vinterbukse + regnbukse');
  });
});

describe('backpack extras - domain rules', () => {
  test('fjelltur alltid: Regntøy i sekken uansett vær (norsk regel)', () => {
    // No precipitation — rain gear must still be included
    const r = buildRecommendations(20, 0, 'none', 'fjelltur');
    expect(r.backpackExtras).toContain('Regntøy i sekken (alltid i Norge)');
  });

  test('fjelltur alltid: Ekstra ullsokker', () => {
    const r = buildRecommendations(20, 0, 'none', 'fjelltur');
    expect(r.backpackExtras).toContain('Ekstra ullsokker');
  });

  test('fjelltur < 15°C → Lett fleece i sekken', () => {
    const r = buildRecommendations(10, 0, 'none', 'fjelltur');
    expect(r.backpackExtras).toContain('Lett fleece eller ekstra lag');
  });

  test('fjelltur >= 15°C → ingen fleece i sekken', () => {
    const r = buildRecommendations(16, 0, 'none', 'fjelltur');
    expect(r.backpackExtras).not.toContain('Lett fleece eller ekstra lag');
  });

  test('fjelltur < 5°C → Ekstra termo-base', () => {
    const r = buildRecommendations(3, 0, 'none', 'fjelltur');
    expect(r.backpackExtras).toContain('Ekstra termo-base');
  });

  test('fjelltur < 0°C → Lett dunjakke', () => {
    const r = buildRecommendations(-2, 0, 'none', 'fjelltur');
    expect(r.backpackExtras).toContain('Lett dunjakke');
  });

  test('sykling < 15°C, ingen nedbør → Lett sykkeljakke regn i ryggvesken', () => {
    const r = buildRecommendations(10, 0, 'none', 'sykling');
    expect(r.backpackExtras).toContain('Lett sykkeljakke regn i ryggvesken');
  });

  test('sykling < 15°C med nedbør → ingen ekstra regnjakke (har allerede på)', () => {
    const r = buildRecommendations(10, 0, 'light', 'sykling');
    expect(r.backpackExtras).not.toContain('Lett sykkeljakke regn i ryggvesken');
  });

  test('sykling >= 15°C → ingen ekstra regnjakke', () => {
    const r = buildRecommendations(20, 0, 'none', 'sykling');
    expect(r.backpackExtras).not.toContain('Lett sykkeljakke regn i ryggvesken');
  });

  test('løping < 5°C → Ekstra jakke for avkjøling', () => {
    const r = buildRecommendations(3, 0, 'none', 'løping');
    expect(r.backpackExtras).toContain('Ekstra jakke for avkjøling etter økt');
  });

  test('langrenn < 5°C → Ekstra jakke for avkjøling', () => {
    const r = buildRecommendations(3, 0, 'none', 'langrenn');
    expect(r.backpackExtras).toContain('Ekstra jakke for avkjøling etter økt');
  });

  test('rusling < 5°C → ingen ekstra jakke (bare løping/langrenn)', () => {
    const r = buildRecommendations(3, 0, 'none', 'rusling');
    expect(r.backpackExtras).not.toContain('Ekstra jakke for avkjøling etter økt');
  });

  test('løping >= 5°C → ingen ekstra jakke', () => {
    const r = buildRecommendations(7, 0, 'none', 'løping');
    expect(r.backpackExtras).not.toContain('Ekstra jakke for avkjøling etter økt');
  });
});

describe('activity notes', () => {
  test('løping: alltid bomull-advarsel (cotton kills under 15°C effective)', () => {
    const r = buildRecommendations(10, 0, 'none', 'løping');
    expect(r.notes).toContain('Unngå bomull — risiko for hypotermi etter stopp');
  });

  test('løping < 0°C: kle 10°C varmere-note', () => {
    const r = buildRecommendations(-3, 0, 'none', 'løping');
    expect(r.notes).toContain('Kle deg som om det er 10°C varmere enn termometeret');
  });

  test('løping >= 0°C: ingen 10°C-varmere-note', () => {
    const r = buildRecommendations(5, 0, 'none', 'løping');
    expect(r.notes).not.toContain('Kle deg som om det er 10°C varmere enn termometeret');
  });

  test('sykling: alltid motvind-advarsel', () => {
    const r = buildRecommendations(20, 0, 'none', 'sykling');
    expect(r.notes).toContain('Motvind øker effektiv vindavkjøling dramatisk — kle deg for det kaldeste punktet');
  });

  test('sykling < 16°C: kne-varmer-note', () => {
    const r = buildRecommendations(12, 0, 'none', 'sykling');
    expect(r.notes).toContain('Knevarmere ved 10–16°C — knær tåler dårlig kulde under dynamisk bevegelse');
  });

  test('sykling >= 16°C: ingen kne-varmer-note', () => {
    const r = buildRecommendations(18, 0, 'none', 'sykling');
    expect(r.notes).not.toContain('Knevarmere ved 10–16°C — knær tåler dårlig kulde under dynamisk bevegelse');
  });

  test('sykling < 12°C: skoovertrekk-note', () => {
    const r = buildRecommendations(7, 0, 'none', 'sykling');
    expect(r.notes).toContain('Skoovertrekk mot vind og kulde — neopren anbefalt');
  });

  test('fjelltur: alltid ekstra-lag-note og aldri-bomull-note', () => {
    const r = buildRecommendations(15, 0, 'none', 'fjelltur');
    expect(r.notes).toContain('Pakk alltid ekstra lag — fjellet skifter raskt');
    expect(r.notes).toContain('Aldri bomull i fjellet');
  });

  test('langrenn: kle 15°C varmere og avkjøling-note (domain rule: høyest varmeproduksjon)', () => {
    const r = buildRecommendations(5, 0, 'none', 'langrenn');
    expect(r.notes).toContain('Kle deg som om det er 15°C varmere — høy varmeproduksjon');
    expect(r.notes).toContain('Planlegg for dramatisk avkjøling etter endt økt');
  });

  test('alpint: stillesittende-note', () => {
    const r = buildRecommendations(0, 0, 'none', 'alpint');
    expect(r.notes).toContain('Heis-turer er stillesittende — ta hensyn til kjøling mellom kjøringene');
  });

  test('alpint med nedbør: vanntett-note', () => {
    const r = buildRecommendations(0, 0, 'moderate', 'alpint');
    expect(r.notes).toContain('Vanntett ytterlag kritisk ved snøfall');
  });

  test('klatring: bevegelighet-note', () => {
    const r = buildRecommendations(10, 0, 'none', 'klatring');
    expect(r.notes).toContain('Behov for høy bevegelighet — unngå for trange mellomlag');
  });

  test('klatring < 5°C: hansker-av-note', () => {
    const r = buildRecommendations(3, 0, 'none', 'klatring');
    expect(r.notes).toContain('Hansker som kan tas av raskt ved aktiv klatring');
  });

  test('svømming: fokus på vanntemp og varmt antrekk klart', () => {
    const r = buildRecommendations(20, 0, 'none', 'svømming');
    expect(r.notes).toContain('Fokus på vanntemperatur, ikke lufttemperatur');
    expect(r.notes).toContain('Varmt antrekk klart ved kanten etter svøm');
  });

  test('rusling: ingen spesifikke notes', () => {
    const r = buildRecommendations(10, 0, 'none', 'rusling');
    expect(r.notes).toHaveLength(0);
  });
});

describe('mandatory gear', () => {
  test('sykling: hjelm alltid med', () => {
    const r = buildRecommendations(20, 0, 'none', 'sykling');
    expect(r.mandatoryGear.some(g => g.includes('Sykkelhjelm'))).toBe(true);
  });

  test('alpint: skihjelm og goggles', () => {
    const r = buildRecommendations(0, 0, 'none', 'alpint');
    expect(r.mandatoryGear.some(g => g.includes('Skihjelm'))).toBe(true);
    expect(r.mandatoryGear.some(g => g.includes('goggles'))).toBe(true);
  });

  test('klatring: klatrehjelm og sele', () => {
    const r = buildRecommendations(10, 0, 'none', 'klatring');
    expect(r.mandatoryGear.some(g => g.includes('Klatrehjelm'))).toBe(true);
    expect(r.mandatoryGear.some(g => g.includes('Klatresele'))).toBe(true);
  });

  test('rusling, løping, fjelltur: ingen mandatory gear', () => {
    for (const activity of ['rusling', 'løping', 'fjelltur'] as const) {
      const r = buildRecommendations(10, 0, 'none', activity);
      expect(r.mandatoryGear).toHaveLength(0);
    }
  });
});

describe('summary', () => {
  test('> 20 → Shorts og t-skjorte holder', () => {
    const r = buildRecommendations(22, 0, 'none', 'rusling');
    expect(r.summary).toBe('Rusling: Shorts og t-skjorte holder');
  });

  test('between 10 and 20 → Lett antrekk med langermet', () => {
    const r = buildRecommendations(15, 0, 'none', 'løping');
    expect(r.summary).toBe('Løping: Lett antrekk med langermet');
  });

  test('between 5 and 10 → Termo + vindjakke', () => {
    const r = buildRecommendations(7, 0, 'none', 'fjelltur');
    expect(r.summary).toBe('Fjelltur: Termo + vindjakke');
  });

  test('between 0 and 5 → Termo + fleece + vindjakke', () => {
    const r = buildRecommendations(3, 0, 'none', 'langrenn');
    expect(r.summary).toBe('Langrenn: Termo + fleece + vindjakke');
  });

  test('alpint between -5 and 0 → activity-specific winter summary', () => {
    const r = buildRecommendations(-3, 0, 'none', 'alpint');
    expect(r.summary).toBe('Alpint: Full vinter-skiutrustning + hjelm + goggles');
  });

  test('<= -5 → Ekspedisjons-nivå', () => {
    const r = buildRecommendations(-7, 0, 'none', 'klatring');
    expect(r.summary).toBe('Klatring: Ekspedisjons-nivå — begrens eksponering');
  });
});
