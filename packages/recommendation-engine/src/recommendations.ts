import type {
  ActivityType,
  BodyZoneRecommendations,
  LayerRecommendation,
  PrecipitationLevel,
  ZoneRecommendation,
} from './types.js';

// ─── Zone recommendations ────────────────────────────────────────────────────

function getHeadRecommendation(effectiveTemp: number): ZoneRecommendation {
  if (effectiveTemp < -10) return { required: true, item: 'Balaklava', reason: 'Frostskade-risiko' };
  if (effectiveTemp < 0) return { required: true, item: 'Tykk ullmøss' };
  if (effectiveTemp < 5) return { required: true, item: 'Ullmøss' };
  if (effectiveTemp < 10) return { required: false, item: 'Lett lue/caps' };
  return { required: false, item: 'Valgfri caps' };
}

function getNeckRecommendation(effectiveTemp: number): ZoneRecommendation {
  if (effectiveTemp < 0) return { required: true, item: 'Halsverner / buff / skjerf' };
  if (effectiveTemp < 5) return { required: false, item: 'Buff (anbefalt)' };
  return { required: false, item: 'Ikke nødvendig' };
}

function getGloveRecommendation(effectiveTemp: number, windSpeed: number): ZoneRecommendation {
  const windKmh = windSpeed * 3.6;
  if (effectiveTemp < -15) return { required: true, item: 'Tykke votter + liner' };
  if (effectiveTemp < -5) return { required: true, item: 'Isolerte hansker' };
  if (effectiveTemp < 0) return { required: true, item: 'Medium hansker' };
  if (effectiveTemp < 5 || windKmh > 30) return { required: true, item: 'Lette hansker' };
  if (effectiveTemp < 10) return { required: false, item: 'Lette hansker (anbefalt)' };
  return { required: false, item: 'Ikke nødvendig' };
}

function getFeetRecommendation(effectiveTemp: number, precipitation: PrecipitationLevel): LayerRecommendation {
  const wet = precipitation !== 'none';
  if (effectiveTemp < -10) return { required: true, item: 'Tykke vintersokker + varmfôrede støvler', clo: 0.12 };
  if (effectiveTemp < 0) return { required: true, item: wet ? 'Ullsokker + vanntette støvler' : 'Tykke ullsokker', clo: 0.08 };
  if (effectiveTemp < 10) return { required: true, item: wet ? 'Ullsokker + GoreTex-sko' : 'Ullsokker', clo: 0.06 };
  return { required: true, item: 'Lette sokker', clo: 0.02 };
}

// ─── Upper body ───────────────────────────────────────────────────────────────

function getBaseLayer(effectiveTemp: number, activity: ActivityType): LayerRecommendation {
  const isHighIntensity = ['løping', 'langrenn', 'sykling'].includes(activity);
  const material = isHighIntensity ? 'syntetisk eller merino' : 'merino eller syntetisk';

  if (effectiveTemp < -5) {
    return { required: true, item: 'Tung termo-base', material, clo: 0.17 };
  }
  if (effectiveTemp < 5) {
    return { required: true, item: 'Medium termo-base', material, clo: 0.12 };
  }
  if (effectiveTemp < 15) {
    return { required: true, item: 'Lett langermet base', material, clo: 0.07 };
  }
  return { required: true, item: 'T-skjorte / løpe-singlet', material, clo: 0.04 };
}

function getMidLayer(effectiveTemp: number, activity: ActivityType): LayerRecommendation | null {
  if (effectiveTemp > 15) return null;
  if (activity === 'løping' && effectiveTemp > 5) return null;
  if (activity === 'langrenn' && effectiveTemp > 0) return null;

  if (effectiveTemp < -10) return { required: true, item: 'Tykk fleece (300-vekt) eller dun-jakke', clo: 0.32 };
  if (effectiveTemp < -5) return { required: true, item: 'Medium fleece (200-vekt)', clo: 0.25 };
  if (effectiveTemp < 5) return { required: true, item: 'Lett fleece (100-vekt)', clo: 0.18 };
  return { required: false, item: 'Lett fleece (valgfri)', clo: 0.15 };
}

function getOuterLayer(
  effectiveTemp: number,
  windSpeed: number,
  precipitation: PrecipitationLevel,
  activity: ActivityType
): LayerRecommendation | null {
  const windy = windSpeed * 3.6 > 20;
  const wet = precipitation !== 'none';
  const heavyWet = precipitation === 'moderate' || precipitation === 'heavy';

  if (heavyWet) return { required: true, item: 'Hardshell regnjakke', clo: 0.08 };
  if (wet && activity === 'sykling') return { required: true, item: 'Isolert regnjakke (sykling)', clo: 0.10 };
  if (wet) return { required: true, item: 'Lett regnjakke', clo: 0.07 };
  // Cycling always needs windproof below 15°C — wind exposure is 2–3× normal
  if (activity === 'sykling' && effectiveTemp < 15) return { required: true, item: 'Vindtett sykkeljakke', clo: 0.08 };
  if (effectiveTemp < -5 || windy) return { required: true, item: 'Vindtett løpe-/sykkeljakke', clo: 0.08 };
  if (effectiveTemp < 5) return { required: false, item: 'Vindjakke (anbefalt)', clo: 0.06 };
  return null;
}

// ─── Lower body ──────────────────────────────────────────────────────────────

function getLowerBaseLayer(effectiveTemp: number, activity: ActivityType): LayerRecommendation | null {
  if (effectiveTemp >= 5 && activity !== 'fjelltur' && activity !== 'alpint') return null;
  if (effectiveTemp < 0) return { required: true, item: 'Termotights (underneden)', clo: 0.18 };
  if (effectiveTemp < 5) return { required: false, item: 'Lett termotights (anbefalt)', clo: 0.12 };
  return null;
}

function getLowerOuterLayer(
  effectiveTemp: number,
  precipitation: PrecipitationLevel,
  activity: ActivityType
): LayerRecommendation {
  const wet = precipitation !== 'none';

  if (effectiveTemp > 20 || (effectiveTemp > 15 && activity === 'løping')) {
    return { required: true, item: 'Shorts', clo: 0.06 };
  }
  if (effectiveTemp > 10) {
    return { required: true, item: activity === 'sykling' ? 'Sykkelshorts/-tights' : 'Lett friluftsbukse', clo: 0.12 };
  }
  if (effectiveTemp > 0) {
    const base = activity === 'sykling' ? 'Lange sykkel-tights' : 'Softshell-bukse / tights';
    const item = wet ? `${base} + regnbukse` : base;
    return { required: true, item, clo: 0.22 };
  }
  const item = wet ? 'Vinterbukse + regnbukse' : 'Vinterbukse / isolerte tights';
  return { required: true, item, clo: 0.32 };
}

// ─── Backpack extras ─────────────────────────────────────────────────────────

function getBackpackExtras(effectiveTemp: number, activity: ActivityType, precipitation: PrecipitationLevel): string[] {
  const extras: string[] = [];

  if (activity === 'fjelltur') {
    extras.push('Regntøy i sekken (alltid i Norge)');
    if (effectiveTemp < 15) extras.push('Lett fleece eller ekstra lag');
    if (effectiveTemp < 5) extras.push('Ekstra termo-base');
    if (effectiveTemp < 0) extras.push('Lett dunjakke');
    extras.push('Ekstra ullsokker');
  }

  if (activity === 'sykling' && precipitation === 'none' && effectiveTemp < 15) {
    extras.push('Lett regnjakke i vesken');
  }

  if (['løping', 'langrenn'].includes(activity) && effectiveTemp < 5) {
    extras.push('Ekstra jakke for avkjøling etter økt');
  }

  return extras;
}

// ─── Notes per activity ───────────────────────────────────────────────────────

function getActivityNotes(
  activity: ActivityType,
  effectiveTemp: number,
  precipitation: PrecipitationLevel
): string[] {
  const notes: string[] = [];

  switch (activity) {
    case 'løping':
      notes.push('Unngå bomull — risiko for hypotermi etter stopp');
      notes.push('Kle deg som om det er 10°C varmere enn termometeret');
      break;
    case 'sykling':
      if (effectiveTemp < 15) notes.push('Kne-varmere anbefalt under 15°C');
      if (effectiveTemp < 10) notes.push('Skoovertrekk mot vind og kulde');
      notes.push('Motvind øker effektiv vindavkjøling dramatisk');
      break;
    case 'fjelltur':
      notes.push('Pakk alltid ekstra lag — fjellet skifter raskt');
      notes.push('Aldri bomull i fjellet');
      break;
    case 'langrenn':
      notes.push('Kle deg som om det er 15°C varmere — høy varmeproduksjon');
      notes.push('Planlegg for dramatisk avkjøling etter endt økt');
      break;
    case 'alpint':
      notes.push('Heisturer er stillesittende — ta hensyn til kjøling');
      if (precipitation !== 'none') notes.push('Vanntett ytterlag kritisk ved snøfall');
      break;
    case 'klatring':
      notes.push('Behov for høy bevegelighet — unngå for trange mellomlag');
      if (effectiveTemp < 5) notes.push('Hansker som kan tas av raskt ved klatring');
      break;
    case 'svømming':
      notes.push('Fokus på vanntemperatur, ikke lufttemperatur');
      notes.push('Varmt antrekk klart ved kanten etter svøm');
      break;
  }

  return notes;
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function buildSummary(effectiveTemp: number, activity: ActivityType): string {
  const activityLabel: Record<ActivityType, string> = {
    rusling: 'Rusling',
    løping: 'Løping',
    sykling: 'Sykling',
    fjelltur: 'Fjelltur',
    langrenn: 'Langrenn',
    alpint: 'Alpint',
    klatring: 'Klatring',
    svømming: 'Svømming',
  };

  if (effectiveTemp > 20) return `${activityLabel[activity]}: Shorts og t-skjorte holder`;
  if (effectiveTemp > 10) return `${activityLabel[activity]}: Lett antrekk med langermet`;
  if (effectiveTemp > 5) return `${activityLabel[activity]}: Termo + vindjakke`;
  if (effectiveTemp > 0) return `${activityLabel[activity]}: Termo + fleece + vindjakke`;
  if (effectiveTemp > -5) return `${activityLabel[activity]}: Full vinter-utrustning`;
  return `${activityLabel[activity]}: Ekspedisjons-nivå — begrens eksponering`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildRecommendations(
  effectiveTemp: number,
  windSpeed: number,
  precipitation: PrecipitationLevel,
  activity: ActivityType
): BodyZoneRecommendations & { notes: string[]; summary: string } {
  const head = getHeadRecommendation(effectiveTemp);
  const neck = getNeckRecommendation(effectiveTemp);
  const hands = getGloveRecommendation(effectiveTemp, windSpeed);
  const feet = getFeetRecommendation(effectiveTemp, precipitation);

  const upperBody = {
    baseLayer: getBaseLayer(effectiveTemp, activity),
    midLayer: getMidLayer(effectiveTemp, activity),
    outerLayer: getOuterLayer(effectiveTemp, windSpeed, precipitation, activity),
  };

  const lowerBody = {
    baseLayer: getLowerBaseLayer(effectiveTemp, activity),
    outerLayer: getLowerOuterLayer(effectiveTemp, precipitation, activity),
  };

  const backpackExtras = getBackpackExtras(effectiveTemp, activity, precipitation);
  const notes = getActivityNotes(activity, effectiveTemp, precipitation);
  const summary = buildSummary(effectiveTemp, activity);

  return {
    head,
    neck,
    upperBody,
    lowerBody,
    hands,
    feet,
    backpackExtras,
    notes,
    summary,
  };
}
