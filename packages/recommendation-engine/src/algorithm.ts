import type { ActivityType, PrecipitationLevel } from './types.js';

export const MET_VALUES: Record<ActivityType, number> = {
  rusling: 3.5,
  løping: 8.0,
  sykling: 8.0,
  fjelltur: 5.5,
  langrenn: 9.0,
  alpint: 7.0,
  klatring: 6.0,
  svømming: 10.0,
};

const CALIBRATION_FACTOR = 0.8;

const PRECIP_CHILL: Record<PrecipitationLevel, number> = {
  none: 0,
  light: 0.3,
  moderate: 0.6,
  heavy: 1.0,
};

export function calcApparentTemp(airTemp: number, windSpeed: number, humidity: number): number {
  if (airTemp < 10) {
    const windKmh = windSpeed * 3.6;
    if (windKmh > 4.8) {
      // Wind Chill — JAG/TI standard
      return (
        13.12 +
        0.6215 * airTemp -
        11.37 * Math.pow(windKmh, 0.16) +
        0.3965 * airTemp * Math.pow(windKmh, 0.16)
      );
    }
  }
  // Steadman apparent temperature
  const vaporPressure =
    (humidity / 100) * 6.1078 * Math.exp((17.27 * airTemp) / (237.3 + airTemp));
  return airTemp + 0.33 * vaporPressure - 0.7 * windSpeed - 4.0;
}

export function calcActivityOffset(activity: ActivityType): number {
  return (MET_VALUES[activity] - 1.0) * CALIBRATION_FACTOR;
}

export function calcEffectiveTemp(
  apparentTemp: number,
  activityOffset: number,
  durationMinutes: number,
  precipitation: PrecipitationLevel,
  sensitivity: number
): number {
  let effectiveTemp = apparentTemp + activityOffset;

  // Longer exposure → more insulation needed
  const durationFactor = 1.0 + (durationMinutes / 60) * 0.05;
  effectiveTemp -= durationFactor * 1.5;

  // Wet feels colder
  effectiveTemp -= PRECIP_CHILL[precipitation] * 3.0;

  // Personal cold sensitivity
  effectiveTemp += sensitivity;

  return effectiveTemp;
}

interface CloThreshold {
  minTemp: number;
  targetClo: number;
}

const CLO_THRESHOLDS: CloThreshold[] = [
  { minTemp: 25, targetClo: 0.05 },
  { minTemp: 20, targetClo: 0.15 },
  { minTemp: 15, targetClo: 0.35 },
  { minTemp: 10, targetClo: 0.55 },
  { minTemp: 5, targetClo: 0.75 },
  { minTemp: 0, targetClo: 1.0 },
  { minTemp: -5, targetClo: 1.25 },
  { minTemp: -10, targetClo: 1.45 },
  { minTemp: -Infinity, targetClo: 1.65 },
];

export function getTargetClo(effectiveTemp: number): number {
  const threshold = CLO_THRESHOLDS.find((t) => effectiveTemp >= t.minTemp);
  return threshold?.targetClo ?? 1.65;
}
