'use client';

import type { ActivityType } from '@kledningsapp/recommendation-engine';

const ACTIVITIES: { type: ActivityType; label: string; icon: string }[] = [
  { type: 'rusling', label: 'Rusling', icon: '🚶' },
  { type: 'løping', label: 'Løping', icon: '🏃' },
  { type: 'sykling', label: 'Sykling', icon: '🚴' },
  { type: 'fjelltur', label: 'Fjelltur', icon: '🏔️' },
  { type: 'langrenn', label: 'Langrenn', icon: '⛷️' },
  { type: 'alpint', label: 'Alpint', icon: '🎿' },
  { type: 'klatring', label: 'Klatring', icon: '🧗' },
  { type: 'svømming', label: 'Svømming', icon: '🏊' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240, 360, 480];

interface Props {
  selectedActivity: ActivityType;
  durationMinutes: number;
  sensitivity: number;
  onChange: (activity: ActivityType, duration: number, sensitivity: number) => void;
}

export function ActivityPicker({ selectedActivity, durationMinutes, sensitivity, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Aktivitet
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {ACTIVITIES.map((a) => (
            <button
              key={a.type}
              onClick={() => onChange(a.type, durationMinutes, sensitivity)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                selectedActivity === a.type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Varighet
        </h2>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onChange(selectedActivity, d, sensitivity)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                durationMinutes === d
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {d < 60 ? `${d} min` : `${d / 60} t`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Kulde-sensitivitet
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Fryser lett</span>
          <input
            type="range"
            min={-2}
            max={2}
            step={1}
            value={sensitivity}
            onChange={(e) => onChange(selectedActivity, durationMinutes, Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="text-sm text-slate-500">Tåler kulde</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 text-center">
          {sensitivity === 0 ? 'Normal' : sensitivity > 0 ? `+${sensitivity}°C (varmetolerant)` : `${sensitivity}°C (kuldesensitiv)`}
        </p>
      </div>
    </div>
  );
}
