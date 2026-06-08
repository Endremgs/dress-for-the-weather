import type {
  ActivityType,
  BodyZoneRecommendations,
  LayerRecommendation,
  PrecipitationLevel,
  ZoneRecommendation,
} from './types.js';

// ─── Mandatory gear per activity ─────────────────────────────────────────────

function getMandatoryGear(activity: ActivityType): string[] {
  switch (activity) {
    case 'sykling':
      return ['Sykkelhjelm (EN 1078) — sterkt anbefalt, lovpålagt under 15 år', 'Sykkelbriller / solbriller'];
    case 'alpint':
      return ['Skihjelm (EN 1077) — sterkt anbefalt', 'Skibriller / goggles (EN 174)'];
    case 'klatring':
      return ['Klatrehjelm (EN 12492) — sterkt anbefalt utendørs', 'Klatresele (EN 12277)', 'Klatresko'];
    default:
      return [];
  }
}

// ─── Zone recommendations ────────────────────────────────────────────────────

function getHeadRecommendation(effectiveTemp: number, activity: ActivityType): ZoneRecommendation {
  if (activity === 'alpint') {
    if (effectiveTemp < -10) return { required: true, item: 'Skihjelm (EN 1077) + goggles + balaklava under', reason: 'Frostskade-risiko' };
    if (effectiveTemp < 0) return { required: true, item: 'Skihjelm (EN 1077) + goggles + lue under' };
    return { required: true, item: 'Skihjelm (EN 1077) + goggles' };
  }

  if (activity === 'sykling') {
    if (effectiveTemp < -5) return { required: true, item: 'Sykkelhjelm (EN 1078) + balaklava under hjelm', reason: 'Frostskade-risiko' };
    if (effectiveTemp < 0) return { required: true, item: 'Sykkelhjelm (EN 1078) + tykk hjelmlue' };
    if (effectiveTemp < 7) return { required: true, item: 'Sykkelhjelm (EN 1078) + lue under hjelm' };
    if (effectiveTemp < 13) return { required: true, item: 'Sykkelhjelm (EN 1078) + lett hjelmlue (valgfri)' };
    return { required: true, item: 'Sykkelhjelm (EN 1078)' };
  }

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

function getGloveRecommendation(effectiveTemp: number, windSpeed: number, activity: ActivityType): ZoneRecommendation {
  const windKmh = windSpeed * 3.6;

  if (activity === 'sykling') {
    if (effectiveTemp < -5) return { required: true, item: 'Sykkelvotter / hummer-hansker' };
    if (effectiveTemp < 0) return { required: true, item: 'Tykke vinter-sykkelhansker' };
    if (effectiveTemp < 7) return { required: true, item: 'Mellom sykkelhansker (softshell)' };
    if (effectiveTemp < 13) return { required: true, item: 'Lette sykkelhansker (full finger)' };
    if (effectiveTemp < 20) return { required: false, item: 'Fingerfrie sykkelhansker (valgfri)' };
    return { required: false, item: 'Ikke nødvendig' };
  }

  if (activity === 'alpint') {
    if (effectiveTemp < -10) return { required: true, item: 'Ski-votter + liner-hansker' };
    if (effectiveTemp < -5) return { required: true, item: 'Varmfôrede ski-hansker + liner' };
    if (effectiveTemp < 5) return { required: true, item: 'Ski-hansker' };
    return { required: false, item: 'Lette ski-hansker' };
  }

  if (effectiveTemp < -15) return { required: true, item: 'Tykke votter + liner' };
  if (effectiveTemp < -5) return { required: true, item: 'Isolerte hansker' };
  if (effectiveTemp < 0) return { required: true, item: 'Medium hansker' };
  if (effectiveTemp < 5 || windKmh > 30) return { required: true, item: 'Lette hansker' };
  if (effectiveTemp < 10) return { required: false, item: 'Lette hansker (anbefalt)' };
  return { required: false, item: 'Ikke nødvendig' };
}

function getFeetRecommendation(effectiveTemp: number, precipitation: PrecipitationLevel, activity: ActivityType): LayerRecommendation {
  const wet = precipitation !== 'none';

  if (activity === 'sykling') {
    if (effectiveTemp < 0) return { required: true, item: 'Sykkelsko + isolerte vinter-skoovertrekk', clo: 0.17 };
    if (effectiveTemp < 4) return { required: true, item: 'Sykkelsko + isolerte skoovertrekk', clo: 0.14 };
    if (effectiveTemp < 12) return { required: true, item: 'Sykkelsko + neopren skoovertrekk (full)', clo: 0.12 };
    if (effectiveTemp < 18) return { required: false, item: 'Sykkelsko + tå-overtrekk (valgfri)', clo: 0.05 };
    return { required: true, item: 'Sykkelsko', clo: 0.02 };
  }

  if (activity === 'alpint') {
    return { required: true, item: 'Skistøvler (isolert) + merino ski-sokker', clo: 0.06 };
  }

  if (activity === 'langrenn') {
    return { required: true, item: 'Langrennsstøvler + tynne ullesokker', clo: 0.04 };
  }

  if (effectiveTemp < -10) return { required: true, item: 'Tykke vintersokker + varmfôrede støvler', clo: 0.12 };
  if (effectiveTemp < 0) return { required: true, item: wet ? 'Ullsokker + vanntette støvler' : 'Tykke ullsokker', clo: 0.08 };
  if (effectiveTemp < 10) return { required: true, item: wet ? 'Ullsokker + GoreTex-sko' : 'Ullsokker', clo: 0.06 };
  return { required: true, item: 'Lette sokker', clo: 0.02 };
}

// ─── Upper body ───────────────────────────────────────────────────────────────

function getBaseLayer(effectiveTemp: number, activity: ActivityType): LayerRecommendation {
  const isHighIntensity = ['løping', 'langrenn', 'sykling'].includes(activity);
  const material = isHighIntensity ? 'syntetisk eller merino' : 'merino eller syntetisk';

  if (activity === 'sykling') {
    if (effectiveTemp < -5) return { required: true, item: 'Tung termo-base (syntetisk)', material: 'syntetisk', clo: 0.17 };
    if (effectiveTemp < 4) return { required: true, item: 'Termisk sykkeltrøye langermet', material: 'syntetisk fleece-børstet', clo: 0.33 };
    if (effectiveTemp < 10) return { required: true, item: 'Termisk sykkeltrøye langermet', material: 'syntetisk fleece-børstet', clo: 0.33 };
    if (effectiveTemp < 16) return { required: true, item: 'Sykkeltrøye langermet', material: 'syntetisk', clo: 0.22 };
    return { required: true, item: 'Sykkeltrøye kortarm', material: 'syntetisk', clo: 0.12 };
  }

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
  if (activity === 'sykling') {
    // For cycling, the outer jacket serves as the insulating layer
    return null;
  }

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

  if (activity === 'sykling') {
    if (heavyWet) return { required: true, item: 'Sykkeljakke regn (vanntett)', clo: 0.18 };
    if (wet) return { required: true, item: 'Sykkeljakke regn (vanntett)', clo: 0.18 };
    if (effectiveTemp < -5) return { required: true, item: 'Sykkeljakke vinter (termisk, isolert)', clo: 0.47 };
    if (effectiveTemp < 4) return { required: true, item: 'Sykkeljakke softshell', clo: 0.35 };
    if (effectiveTemp < 10) return { required: true, item: 'Sykkeljakke vindtett (packable)', clo: 0.22 };
    if (effectiveTemp < 16) return { required: false, item: 'Sykkelvest/gilet (anbefalt)', clo: 0.15 };
    return null;
  }

  if (heavyWet) return { required: true, item: 'Hardshell regnjakke', clo: 0.08 };
  if (wet) return { required: true, item: 'Lett regnjakke', clo: 0.07 };
  if (effectiveTemp < -5 || windy) return { required: true, item: 'Vindtett løpe-/turjakke', clo: 0.08 };
  if (effectiveTemp < 5) return { required: false, item: 'Vindjakke (anbefalt)', clo: 0.06 };
  return null;
}

// ─── Lower body ──────────────────────────────────────────────────────────────

function getLowerBaseLayer(effectiveTemp: number, activity: ActivityType): LayerRecommendation | null {
  if (effectiveTemp >= 5 && activity !== 'fjelltur' && activity !== 'alpint') return null;
  if (activity === 'sykling' || activity === 'alpint') return null; // Handled in outer layer
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

  if (activity === 'sykling') {
    if (effectiveTemp < -5) return { required: true, item: wet ? 'Termiske sykkel-tights + regnbukse' : 'Termiske sykkel-tights', clo: 0.30 };
    if (effectiveTemp < 0) return { required: true, item: 'Termiske sykkel-tights (fleece-foret)', clo: 0.30 };
    if (effectiveTemp < 7) return { required: true, item: 'Termiske sykkel-tights', clo: 0.25 };
    if (effectiveTemp < 12) return { required: true, item: wet ? 'Sykkel-tights (tynn) + regnbukse' : 'Sykkel-tights (tynn)', clo: 0.16 };
    if (effectiveTemp < 16) return { required: true, item: 'Sykkelshorts (bib) + knevarmere', clo: 0.14 };
    return { required: true, item: 'Sykkelshorts (bib shorts)', clo: 0.07 };
  }

  if (activity === 'løping') {
    if (effectiveTemp > 10) return { required: true, item: 'Løpeshorts', clo: 0.07 };
    if (effectiveTemp > 0) return { required: true, item: 'Løpe-tights (tynne)', clo: 0.16 };
    return { required: true, item: 'Termiske løpe-tights', clo: 0.25 };
  }

  if (activity === 'alpint') {
    if (effectiveTemp < -5) return { required: true, item: 'Salopetter / skibukse (isolert)', clo: 0.45 };
    return { required: true, item: 'Salopetter / skibukse', clo: 0.22 };
  }

  if (effectiveTemp > 20) {
    return { required: true, item: 'Shorts', clo: 0.06 };
  }
  if (effectiveTemp > 10) {
    return { required: true, item: 'Lett friluftsbukse', clo: 0.12 };
  }
  if (effectiveTemp > 0) {
    const base = 'Softshell-bukse / tights';
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
    extras.push('Lett sykkeljakke regn i ryggvesken');
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
      if (effectiveTemp < 0) notes.push('Kle deg som om det er 10°C varmere enn termometeret');
      if (effectiveTemp < -5) notes.push('Vurder innendørstrening');
      break;
    case 'sykling':
      if (effectiveTemp < 16) notes.push('Knevarmere ved 10–16°C — knær tåler dårlig kulde under dynamisk bevegelse');
      if (effectiveTemp < 12) notes.push('Skoovertrekk mot vind og kulde — neopren anbefalt');
      notes.push('Motvind øker effektiv vindavkjøling dramatisk — kle deg for det kaldeste punktet');
      if (precipitation !== 'none') notes.push('Regntøy prioritert — fuktig + kald = hypotermi-risiko');
      break;
    case 'fjelltur':
      notes.push('Pakk alltid ekstra lag — fjellet skifter raskt');
      notes.push('Aldri bomull i fjellet');
      if (effectiveTemp < 5) notes.push('3-lags-systemet essensielt — legg av og på ved varierende intensitet');
      break;
    case 'langrenn':
      notes.push('Kle deg som om det er 15°C varmere — høy varmeproduksjon');
      notes.push('Vær kald ved start — kroppen er i temperatur etter 5–10 min');
      notes.push('Planlegg for dramatisk avkjøling etter endt økt');
      break;
    case 'alpint':
      notes.push('Heis-turer er stillesittende — ta hensyn til kjøling mellom kjøringene');
      if (precipitation !== 'none') notes.push('Vanntett ytterlag kritisk ved snøfall');
      notes.push('Skihjelm og goggles alltid — beskytter mot UV, vind og snø-impact');
      break;
    case 'klatring':
      notes.push('Behov for høy bevegelighet — unngå for trange mellomlag');
      if (effectiveTemp < 5) notes.push('Hansker som kan tas av raskt ved aktiv klatring');
      notes.push('Hjelm sterkt anbefalt utendørs — steiner kan løsne');
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

  if (activity === 'sykling') {
    if (effectiveTemp > 16) return 'Sykling: Sykkelshorts + kortarm trøye + hjelm';
    if (effectiveTemp > 7) return 'Sykling: Sykkel-tights + jakke + hansker + hjelm';
    if (effectiveTemp > 0) return 'Sykling: Termiske tights + sykkeljakke + vinter-hansker + hjelm';
    return 'Sykling: Full vinterutrustning — begrens eksponering';
  }

  if (activity === 'alpint') {
    if (effectiveTemp > 0) return 'Alpint: Skijakke + salopetter + hjelm + goggles';
    return 'Alpint: Full vinter-skiutrustning + hjelm + goggles';
  }

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
  const head = getHeadRecommendation(effectiveTemp, activity);
  const neck = getNeckRecommendation(effectiveTemp);
  const hands = getGloveRecommendation(effectiveTemp, windSpeed, activity);
  const feet = getFeetRecommendation(effectiveTemp, precipitation, activity);

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
  const mandatoryGear = getMandatoryGear(activity);
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
    mandatoryGear,
    notes,
    summary,
  };
}
