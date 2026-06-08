import type { ForecastEntry, WeatherInput } from '@kledningsapp/recommendation-engine';

interface Props {
  weather: WeatherInput & { location: { lat: number; lon: number } };
  durationMinutes: number;
}

function tempColor(t: number): string {
  if (t <= -10) return 'text-violet-400';
  if (t <= 0)   return 'text-blue-400';
  if (t <= 10)  return 'text-cyan-500';
  if (t <= 20)  return 'text-green-500';
  return 'text-orange-400';
}

function precipIcon(precipitation: string, cloudCover?: number): string {
  if (precipitation === 'heavy')    return '⛈️';
  if (precipitation === 'moderate') return '🌧️';
  if (precipitation === 'light')    return '🌦️';
  const cover = cloudCover ?? 50;
  if (cover < 25) return '☀️';
  if (cover < 60) return '⛅';
  if (cover < 85) return '🌥️';
  return '☁️';
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

function TempBar({ temp, minTemp, maxTemp }: { temp: number; minTemp: number; maxTemp: number }) {
  const range = maxTemp - minTemp || 1;
  const pct = Math.round(((temp - minTemp) / range) * 100);
  return (
    <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
      <div
        className="h-full rounded-full bg-blue-400 dark:bg-blue-500 transition-all"
        style={{ width: `${Math.max(8, pct)}%` }}
      />
    </div>
  );
}

function TimelineEntry({
  label,
  icon,
  temp,
  precipProb,
  windSpeed,
  isFirst,
  minTemp,
  maxTemp,
}: {
  label: string;
  icon: string;
  temp: number;
  precipProb: number;
  windSpeed: number;
  isFirst?: boolean;
  minTemp: number;
  maxTemp: number;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 min-w-[60px] px-2 py-3 rounded-xl ${
        isFirst
          ? 'bg-blue-500/10 dark:bg-blue-400/10 border border-blue-300/40 dark:border-blue-500/30'
          : 'bg-slate-50 dark:bg-slate-800/60'
      }`}
    >
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
        {isFirst ? 'Nå' : label}
      </span>
      <span className="text-xl leading-none">{icon}</span>
      <span className={`text-sm font-bold tabular-nums ${tempColor(temp)}`}>
        {temp.toFixed(0)}°
      </span>
      <TempBar temp={temp} minTemp={minTemp} maxTemp={maxTemp} />
      {precipProb > 5 && (
        <span className="text-xs text-blue-500 dark:text-blue-400 tabular-nums">
          {precipProb.toFixed(0)}%
        </span>
      )}
      <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
        {windSpeed.toFixed(0)}m/s
      </span>
    </div>
  );
}

export function ForecastTimeline({ weather, durationMinutes }: Props) {
  const { forecastWindow, airTemp, precipitation, cloudCover, precipitationProb, windSpeed } = weather;

  // Build the "now" entry + forecast entries within the activity window
  const hoursNeeded = Math.ceil(durationMinutes / 60);
  const entries = forecastWindow?.slice(0, hoursNeeded) ?? [];

  // No forecast data available in manual mode or short activities
  if (entries.length === 0) return null;

  const allTemps = [airTemp, ...entries.map(e => e.airTemp)];
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
        Vær under turen
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <TimelineEntry
          label="Nå"
          icon={precipIcon(precipitation, cloudCover)}
          temp={airTemp}
          precipProb={precipitationProb}
          windSpeed={windSpeed}
          isFirst
          minTemp={minTemp}
          maxTemp={maxTemp}
        />
        {entries.map((entry: ForecastEntry, i: number) => (
          <TimelineEntry
            key={i}
            label={formatTime(entry.time)}
            icon={precipIcon(entry.precipitation, entry.cloudCover)}
            temp={entry.airTemp}
            precipProb={entry.precipitationProb}
            windSpeed={entry.windSpeed}
            minTemp={minTemp}
            maxTemp={maxTemp}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
        % = nedbørssannsynlighet · m/s = vind
      </p>
    </div>
  );
}
