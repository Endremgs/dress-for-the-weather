# Recommendation Engine

## Kjerne­algoritme

### Input-parametere

```typescript
interface WeatherInput {
  airTemp: number;          // °C (fra api.met.no: air_temperature)
  windSpeed: number;        // m/s (fra api.met.no: wind_speed)
  humidity: number;         // % (fra api.met.no: relative_humidity)
  precipitation: 'none' | 'light' | 'moderate' | 'heavy';
  precipitationProb: number; // % (probability_of_precipitation)
}

interface ActivityInput {
  type: ActivityType;
  intensityLevel: 'low' | 'medium' | 'high';  // valgfri, utledet fra type
  durationMinutes: number;
}

interface UserInput {
  sensitivity: number;  // -2 til +2 (kuldeSensitiv → varmetolerant)
}

type ActivityType = 
  | 'rusling'      // casual walk
  | 'løping'       // running
  | 'sykling'      // cycling
  | 'fjelltur'     // hiking
  | 'langrenn'     // cross-country skiing
  | 'alpint'       // downhill skiing
  | 'klatring'     // climbing
  | 'svømming';    // open water swimming
```

### Steg 1: Beregn følt temperatur (Apparent Temperature)

```typescript
function calcApparentTemp(airTemp: number, windSpeed: number, humidity: number): number {
  if (airTemp < 10) {
    // Wind Chill (JAG/TI standard) — gyldig ved T < 10°C og vind > 4.8 km/h
    const windKmh = windSpeed * 3.6;
    if (windKmh > 4.8) {
      return 13.12 + 0.6215 * airTemp 
             - 11.37 * Math.pow(windKmh, 0.16) 
             + 0.3965 * airTemp * Math.pow(windKmh, 0.16);
    }
  }
  // Steadman apparent temperature (inkluderer fuktighet)
  const vaporPressure = (humidity / 100) * 6.1078 * Math.exp((17.27 * airTemp) / (237.3 + airTemp));
  return airTemp + 0.33 * vaporPressure - 0.70 * windSpeed - 4.00;
}
```

### Steg 2: Aktivitetsvarme-offset

```typescript
const MET_VALUES: Record<ActivityType, number> = {
  rusling:   3.5,
  løping:    8.0,   // moderat tempo ~12 km/t
  sykling:   8.0,   // moderat intensitet
  fjelltur:  5.5,   // moderat terreng
  langrenn:  9.0,
  alpint:    7.0,
  klatring:  6.0,
  svømming:  10.0,
};

const CALIBRATION_FACTOR = 0.8;

function calcActivityOffset(activity: ActivityType): number {
  const met = MET_VALUES[activity];
  return (met - 1.0) * CALIBRATION_FACTOR;
}
```

### Steg 3: Effektiv komforttemperatur

```typescript
function calcEffectiveTemp(
  apparentTemp: number,
  activityOffset: number,
  durationMinutes: number,
  precipitation: string,
  sensitivity: number
): number {
  let effectiveTemp = apparentTemp + activityOffset;

  // Varighets-modifikator (lenger ute = trenger mer isolasjon)
  const durationFactor = 1.0 + (durationMinutes / 60) * 0.05;
  effectiveTemp -= durationFactor * 1.5;

  // Nedbørs-modifikator (vått = kaldere følt)
  const precipMap = { none: 0, light: 0.3, moderate: 0.6, heavy: 1.0 };
  effectiveTemp -= (precipMap[precipitation] ?? 0) * 3.0;

  // Bruker-sensitivitets-justering
  effectiveTemp += sensitivity;

  return effectiveTemp;
}
```

### Steg 4: CLO-målsetting

```typescript
interface CloThreshold {
  minTemp: number;
  targetClo: number;
}

const CLO_THRESHOLDS: CloThreshold[] = [
  { minTemp: 25, targetClo: 0.05 },
  { minTemp: 20, targetClo: 0.15 },
  { minTemp: 15, targetClo: 0.35 },
  { minTemp: 10, targetClo: 0.55 },
  { minTemp: 5,  targetClo: 0.75 },
  { minTemp: 0,  targetClo: 1.00 },
  { minTemp: -5, targetClo: 1.25 },
  { minTemp: -10,targetClo: 1.45 },
  { minTemp: -Infinity, targetClo: 1.65 },
];

function getTargetClo(effectiveTemp: number): number {
  const threshold = CLO_THRESHOLDS.find(t => effectiveTemp >= t.minTemp);
  return threshold?.targetClo ?? 1.65;
}
```

---

## Plagganbefalings-logikk

### Kropp­sone-grenseverdier

```typescript
interface ZoneRecommendation {
  required: boolean;
  item: string;
  reason?: string;
}

function getHeadRecommendation(effectiveTemp: number): ZoneRecommendation {
  if (effectiveTemp < -10) return { required: true, item: 'Balaklava', reason: 'Frost­bite-risiko' };
  if (effectiveTemp < 0)  return { required: true, item: 'Tykk ullmøss' };
  if (effectiveTemp < 5)  return { required: true, item: 'Ullmøss' };
  if (effectiveTemp < 10) return { required: false, item: 'Lett lue/caps' };
  return { required: false, item: 'Valgfri caps' };
}

function getGloveRecommendation(effectiveTemp: number, windSpeed: number): ZoneRecommendation {
  const windKmh = windSpeed * 3.6;
  if (effectiveTemp < -15) return { required: true, item: 'Tykke votter + liner' };
  if (effectiveTemp < -5)  return { required: true, item: 'Isolerte hansker' };
  if (effectiveTemp < 0)   return { required: true, item: 'Medium hansker' };
  if (effectiveTemp < 5 || windKmh > 30) return { required: true, item: 'Lette hansker' };
  if (effectiveTemp < 10)  return { required: false, item: 'Lette hansker (anbefalt)' };
  return { required: false, item: 'Ikke nødvendig' };
}

function getNeckRecommendation(effectiveTemp: number): ZoneRecommendation {
  if (effectiveTemp < 0)  return { required: true, item: 'Hals­verner / buff / skjerf' };
  if (effectiveTemp < 5)  return { required: false, item: 'Buff (anbefalt)' };
  return { required: false, item: 'Valgfri' };
}
```

### Aktivitets­spesifikke justeringer

```typescript
function applyActivityOverrides(
  base: GarmentSet,
  activity: ActivityType,
  effectiveTemp: number,
  precipitation: string
): GarmentSet {
  const result = { ...base };

  // Løping: alltid fukt-transporterende materialer
  if (activity === 'løping') {
    result.baseLayer.material = 'syntetisk eller merino';
    result.notes.push('Unngå bomull — risiko for hypotermi etter stopp');
    if (effectiveTemp > 10) {
      result.midLayer = null; // Ikke behov
    }
  }

  // Sykling: vindeksponering kritisk
  if (activity === 'sykling') {
    result.notes.push('Kne-varmere ved < 15°C');
    if (effectiveTemp < 10) {
      result.notes.push('Skoovertrekk anbefalt');
    }
    if (precipitation !== 'none') {
      result.outerLayer = { item: 'Isolert regnjakke', required: true };
    }
  }

  // Fjelltur: alltid ekstra i sekken
  if (activity === 'fjelltur') {
    result.backpackExtras = getHikingBackpackLayer(effectiveTemp);
    result.notes.push('Pakk alltid ekstra lag — fjellet skifter raskt');
    result.notes.push('Alltid regntøy i sekken i Norge');
  }

  // Langrenn: vind fremover i glid-fase
  if (activity === 'langrenn') {
    result.notes.push('Kle deg som om det er 15°C varmere — høy varme­produksjon');
    result.outerLayer = { item: 'Vindtett langrenn-trøye/-jakke', required: effectiveTemp < 0 };
  }

  return result;
}
```

---

## Sikkerhets-advarsler

```typescript
interface SafetyWarning {
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
}

function generateSafetyWarnings(
  effectiveTemp: number,
  windSpeed: number,
  durationMinutes: number,
  activity: ActivityType
): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  const windKmh = windSpeed * 3.6;

  // Frost­bite risiko
  if (effectiveTemp < -27) {
    warnings.push({
      level: 'critical',
      message: 'Ekstrem kulde: frostskade på eksponert hud på 10 minutter',
      recommendation: 'Vurder å avlyse aktiviteten',
    });
  } else if (effectiveTemp < -15) {
    warnings.push({
      level: 'high',
      message: 'Alvorlig kulde: frostskade-risiko innen 30 minutter',
      recommendation: 'Full ansikts- og håndbeskyttelse, begrens eksponeringstid',
    });
  } else if (effectiveTemp < -5) {
    warnings.push({
      level: 'medium',
      message: 'Kald: frost­skade ved langvarig eksponering',
      recommendation: 'Beskytt ytterpunkter, ta regelmessige pauser',
    });
  }

  // Vind-fare
  if (windKmh > 50) {
    warnings.push({
      level: 'high',
      message: 'Ekstremt vind: farlige forhold',
      recommendation: 'Vindtett ytterlag, vurder å finne ly',
    });
  } else if (windKmh > 30) {
    warnings.push({
      level: 'medium',
      message: 'Sterk vind øker kuldepersepsjon signifikant',
      recommendation: 'Vindtett ytterlag nødvendig',
    });
  }

  // Lang varighet + kulde
  if (durationMinutes > 120 && effectiveTemp < 0) {
    warnings.push({
      level: 'medium',
      message: 'Lang eksponering i kulde: risiko for gradvis avkjøling',
      recommendation: 'Ta med ekstra isolasjons­lag, varm drikke',
    });
  }

  // Stopprisiko etter høy­intensitiv aktivitet
  const highIntensityActivities: ActivityType[] = ['løping', 'langrenn', 'sykling'];
  if (highIntensityActivities.includes(activity) && effectiveTemp < 5) {
    warnings.push({
      level: 'low',
      message: 'Stopp etter høy intensitet: svette + vind kan gi rask avkjøling',
      recommendation: 'Ha et ekstra varmt lag tilgjengelig ved stopp',
    });
  }

  return warnings;
}
```

---

## Fulle beregnings­eksempler

### Eksempel 1: Oslo vinter, løping
```
Input:
  - airTemp: −5°C
  - windSpeed: 5 m/s (18 km/h)
  - humidity: 70%
  - precipitation: 'none'
  - activity: 'løping', duration: 45 min
  - sensitivity: 0

Steg 1 - Apparent temp:
  Wind chill = 13.12 + 0.6215(−5) − 11.37(18^0.16) + 0.3965(−5)(18^0.16)
             ≈ 13.12 − 3.11 − 16.64 − 2.90 ≈ −9.5°C

Steg 2 - Activity offset:
  MET(løping) = 8.0 → offset = (8−1) × 0.8 = 5.6°C

Steg 3 - Effective temp:
  = −9.5 + 5.6 = −3.9°C
  − duration: (1 + 0.75 × 0.05) × 1.5 = 1.6°C → −5.5°C
  − precipitation: 0
  = −5.5°C

Target CLO: 1.25

Anbefaling:
  - Base: Tung syntetisk termo-base (0.15 CLO)
  - Mellom: Medium fleece (0.22 CLO)
  - Ytre: Vindtett løpejakke (0.10 CLO)
  - Tights (0.20 CLO)
  - Ullmøss (0.08 CLO)
  - Medium hansker (0.12 CLO)
  Total: ~0.87 CLO + varsler om stopp-risiko
```

### Eksempel 2: Hardangervidda, fjelltur
```
Input:
  - airTemp: 2°C
  - windSpeed: 12 m/s (43 km/h)
  - humidity: 85%
  - precipitation: 'light'
  - activity: 'fjelltur', duration: 240 min
  - sensitivity: 0

Steg 1 - Wind chill:
  = 13.12 + 0.6215(2) − 11.37(43^0.16) + 0.3965(2)(43^0.16)
  ≈ 13.12 + 1.24 − 19.1 + 1.33 ≈ −3.4°C

Steg 2 - Activity offset:
  MET(fjelltur) = 5.5 → offset = (5.5−1) × 0.8 = 3.6°C

Steg 3 - Effective temp:
  = −3.4 + 3.6 = 0.2°C
  − duration: (1 + 4×0.05) × 1.5 = 1.8°C → −1.6°C
  − precipitation (light=0.3): 0.3 × 3 = 0.9°C → −2.5°C
  = −2.5°C

Target CLO: 1.25

Anbefaling:
  - Base: Merino ullongs (0.12 CLO)
  - Mellom: 200-vekt fleece (0.25 CLO)
  - Ytre: Hardshell regntøy (0.08 CLO)
  - Softshell-bukse (0.25 CLO) + regnbukse
  - Hansker (0.12 CLO)
  - Ullmøss (0.08 CLO)
  - Hals-buff (0.05 CLO)
  I sekken: Ekstra base-lag, lett dun-jakke
  Advarsel: "Sterk vind + lett nedbør, pakk alltid regntøy og ekstra lag"
```

### Eksempel 3: Sommersykkel, Oslo
```
Input:
  - airTemp: 22°C
  - windSpeed: 3 m/s
  - humidity: 55%
  - precipitation: 'none'
  - activity: 'sykling', duration: 90 min
  - sensitivity: 0

Steg 1 - Apparent temp: 22°C (over 10°C, ingen vindavkjøling-formel)

Steg 2 - Activity offset:
  MET(sykling) = 8.0 → offset = 5.6°C

Steg 3 - Effective temp:
  = 22 + 5.6 = 27.6°C
  − duration: (1 + 1.5×0.05) × 1.5 = 1.7°C → 25.9°C
  = 25.9°C

Target CLO: 0.15

Anbefaling:
  - Sykkelshorts (0.06 CLO)
  - Lett syntetisk sykkeltrøye (0.08 CLO)
  - Ingen ytterlag
  Total: ~0.14 CLO
  Note: "Ta med en vindjake i vesken — kan bli kjølig i nedoverbakke"
```

---

## Validerings­grenser og edge cases

### Grenseverdier som alltid gjelder

```typescript
const ABSOLUTE_RULES = {
  // Aldri bomull i kald aktivitet
  noCottonBelow: 15,            // °C (effective temp)
  
  // Alltid vanntett ved nedbør > lett
  waterproofThreshold: 'moderate', // precipitation level
  
  // Alltid lue under
  hatRequired: 0,               // °C (effective temp)
  
  // Balaklava alltid
  balaclavaCritical: -15,       // °C (effective temp)
  
  // Ekstra lag i sekken for fjelltur alltid ved
  hikingExtraLayer: 10,         // °C (lufttemp)
};
```

### Individuelle forskjeller

CLO-behovet varierer ±15–20% mellom individer. Sensitivity-parameter (−2 til +2°C) kompenserer for:
- Kjønnforskjeller (gjennomsnittlig kvinner tåler kulde litt dårligere pga. lavere BMR)
- Kroppskomposisjon (høyere fettprosent = bedre kulde-toleranse)
- Akklimatisering (nordmenn generelt godt akklimatisert)
- Medisinbruk / helse­tilstand
