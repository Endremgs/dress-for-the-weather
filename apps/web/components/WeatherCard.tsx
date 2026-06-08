import type { RecommendationResult } from '@kledningsapp/recommendation-engine';

interface Props {
  result: RecommendationResult;
  locationName?: string;
  isManualMode?: boolean;
  onToggleManual?: () => void;
}

function precipLabel(p: string) {
  const map: Record<string, string> = { none: 'Ingen nedbør', light: 'Lett nedbør', moderate: 'Moderat nedbør', heavy: 'Kraftig nedbør' };
  return map[p] ?? p;
}

function precipIcon(p: string) {
  const map: Record<string, string> = { none: '☀️', light: '🌦️', moderate: '🌧️', heavy: '⛈️' };
  return map[p] ?? '🌤️';
}

export function WeatherCard({ result, locationName, isManualMode = false, onToggleManual }: Props) {
  const { weather, apparentTemp, effectiveTemp } = result;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 shadow-lg">
      <div className="flex items-start justify-between mb-1">
        <div>
          {locationName && (
            <p className="text-blue-100 text-sm font-medium">{locationName}</p>
          )}
        </div>
        {isManualMode && (
          <span className="text-xs font-semibold uppercase tracking-wide bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
            Manuell modus
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold">{weather.airTemp.toFixed(1)}°</p>
          <p className="text-blue-200 text-sm mt-1">
            Føles som {apparentTemp.toFixed(1)}°C
          </p>
        </div>
        <div className="text-right text-sm space-y-1">
          <p>{precipIcon(weather.precipitation)} {precipLabel(weather.precipitation)}</p>
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
      {onToggleManual && (
        <div className="mt-4 pt-3 border-t border-blue-400/50">
          <button
            onClick={onToggleManual}
            className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
              isManualMode
                ? 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border border-amber-400/40'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isManualMode ? '📍 Tilbake til geo-posisjon' : '✏️ Juster vær manuelt'}
          </button>
        </div>
      )}
    </div>
  );
}
