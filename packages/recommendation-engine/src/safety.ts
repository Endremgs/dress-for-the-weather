import type { ActivityType, SafetyWarning } from './types.js';

const HIGH_INTENSITY: ActivityType[] = ['løping', 'langrenn', 'sykling'];

export function generateSafetyWarnings(
  effectiveTemp: number,
  windSpeed: number,
  durationMinutes: number,
  activity: ActivityType
): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  const windKmh = windSpeed * 3.6;

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
      message: 'Kald: frostskade ved langvarig eksponering',
      recommendation: 'Beskytt ytterpunkter, ta regelmessige pauser',
    });
  }

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

  if (durationMinutes > 120 && effectiveTemp < 0) {
    warnings.push({
      level: 'medium',
      message: 'Lang eksponering i kulde: risiko for gradvis avkjøling',
      recommendation: 'Ta med ekstra isolasjonslag, varm drikke',
    });
  }

  if (HIGH_INTENSITY.includes(activity) && effectiveTemp < 5) {
    warnings.push({
      level: 'low',
      message: 'Stopp etter høy intensitet: svette + vind kan gi rask avkjøling',
      recommendation: 'Ha et ekstra varmt lag tilgjengelig ved stopp',
    });
  }

  return warnings;
}
