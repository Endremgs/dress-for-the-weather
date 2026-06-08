import type { RecommendationResult } from '@kledningsapp/recommendation-engine';

interface Props {
  result: RecommendationResult;
  locationName?: string;
}

function precipLabel(p: string) {
  const map: Record<string, string> = { none: 'Ingen nedbør', light: 'Lett nedbør', moderate: 'Moderat nedbør', heavy: 'Kraftig nedbør' };
  return map[p] ?? p;
}

function skyIcon(precipitation: string, cloudCover: number) {
  if (precipitation !== 'none') {
    const map: Record<string, string> = { light: '🌦️', moderate: '🌧️', heavy: '⛈️' };
    return map[precipitation] ?? '🌧️';
  }
  if (cloudCover < 25)  return '☀️';
  if (cloudCover < 60)  return '⛅';
  if (cloudCover < 85)  return '🌥️';
  return '☁️';
}

function skyLabel(precipitation: string, cloudCover: number) {
  if (precipitation !== 'none') return precipLabel(precipitation);
  if (cloudCover < 25)  return 'Klarvær';
  if (cloudCover < 60)  return 'Delvis skyet';
  if (cloudCover < 85)  return 'Skyet';
  return 'Overskyet';
}

export function WeatherCard({ result, locationName }: Props) {
  const { weather, apparentTemp, effectiveTemp } = result;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 shadow-lg">
      {locationName && (
        <p className="text-blue-100 text-sm font-medium mb-1">{locationName}</p>
      )}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold">{weather.airTemp.toFixed(1)}°</p>
          <p className="text-blue-200 text-sm mt-1">
            Føles som {apparentTemp.toFixed(1)}°C
          </p>
        </div>
        <div className="text-right text-sm space-y-1">
          <p>{skyIcon(weather.precipitation, weather.cloudCover)} {skyLabel(weather.precipitation, weather.cloudCover)}</p>
          <p>💨 {weather.windSpeed.toFixed(1)} m/s</p>
          <p>💧 {weather.humidity.toFixed(0)}% fuktighet</p>
          {weather.precipitationProb > 0 && (
            <p>☔ {weather.precipitationProb.toFixed(0)}% nedbørssannsynlighet</p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-blue-400/50 flex items-center justify-between">
        <span className="text-blue-100 text-sm">Effektiv komforttemp</span>
        <span className="font-semibold">{effectiveTemp.toFixed(1)}°C</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-blue-100 text-sm">Isolasjonsmål (CLO)</span>
        <span className="font-semibold">{result.targetClo.toFixed(2)} CLO</span>
      </div>
    </div>
  );
}
