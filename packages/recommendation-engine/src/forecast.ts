import type { WeatherInput, ForecastAlert } from './types.js';

export function analyzeForecastWindow(weather: WeatherInput, durationMinutes: number): ForecastAlert[] {
  const alerts: ForecastAlert[] = [];
  const { forecastWindow, precipitation: currentPrecip, windSpeed: currentWind, airTemp: currentTemp } = weather;

  if (!forecastWindow.length) return alerts;

  // Incoming rain: currently dry but rain starts within the activity window
  if (currentPrecip === 'none') {
    for (let i = 0; i < forecastWindow.length; i++) {
      const entry = forecastWindow[i];
      if (!entry) continue;
      const startsInMinutes = (i + 1) * 60;
      if (startsInMinutes > durationMinutes) break;
      if (entry.precipitation !== 'none') {
        const levelLabel =
          entry.precipitation === 'light' ? 'Lett regn' :
          entry.precipitation === 'moderate' ? 'Moderat regn' : 'Kraftig regn';
        alerts.push({
          type: 'regn',
          message: `${levelLabel} ventes om ca. ${startsInMinutes} min`,
          startsInMinutes,
          severity: entry.precipitation === 'light' ? 'info' : 'advarsel',
        });
        break;
      }
    }
  }

  // Significant temperature drop within the activity window
  let minTemp = currentTemp;
  let minTempAtMinutes = 0;
  for (let i = 0; i < forecastWindow.length; i++) {
    const entry = forecastWindow[i];
    if (!entry) continue;
    const atMinutes = (i + 1) * 60;
    if (atMinutes > durationMinutes) break;
    if (entry.airTemp < minTemp) {
      minTemp = entry.airTemp;
      minTempAtMinutes = atMinutes;
    }
  }
  const tempDrop = currentTemp - minTemp;
  if (tempDrop >= 5 && minTempAtMinutes > 0) {
    alerts.push({
      type: 'temperaturfall',
      message: `Temperaturfall på ~${Math.round(tempDrop)}°C om ca. ${minTempAtMinutes} min`,
      startsInMinutes: minTempAtMinutes,
      severity: tempDrop >= 8 ? 'advarsel' : 'info',
    });
  }

  // Wind increase within the activity window
  let maxWind = currentWind;
  let maxWindAtMinutes = 0;
  for (let i = 0; i < forecastWindow.length; i++) {
    const entry = forecastWindow[i];
    if (!entry) continue;
    const atMinutes = (i + 1) * 60;
    if (atMinutes > durationMinutes) break;
    if (entry.windSpeed > maxWind) {
      maxWind = entry.windSpeed;
      maxWindAtMinutes = atMinutes;
    }
  }
  const windIncrease = maxWind - currentWind;
  if (windIncrease >= 4 && maxWindAtMinutes > 0) {
    alerts.push({
      type: 'vindøkning',
      message: `Vindøkning til ${Math.round(maxWind)} m/s om ca. ${maxWindAtMinutes} min`,
      startsInMinutes: maxWindAtMinutes,
      severity: maxWind >= 10 ? 'advarsel' : 'info',
    });
  }

  return alerts;
}
