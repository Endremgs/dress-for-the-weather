'use client';

import { useState, useEffect, useRef } from 'react';
import type { PrecipitationLevel } from '@kledningsapp/recommendation-engine';

export interface WeatherOverride {
  airTemp: number;
  windSpeed: number;
  humidity: number;
  precipitation: PrecipitationLevel;
  precipitationProb: number;
}

interface Props {
  initial: WeatherOverride;
  onChange: (override: WeatherOverride) => void;
}

const PRECIP_OPTIONS: { value: PrecipitationLevel; label: string; icon: string }[] = [
  { value: 'none', label: 'Ingen', icon: '☀️' },
  { value: 'light', label: 'Lett', icon: '🌦️' },
  { value: 'moderate', label: 'Moderat', icon: '🌧️' },
  { value: 'heavy', label: 'Kraftig', icon: '⛈️' },
];

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, format, onChange }: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 dark:text-slate-400 w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500 h-2 cursor-pointer"
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-16 text-right tabular-nums">
        {format(value)}
      </span>
    </div>
  );
}

export function WeatherOverridePanel({ initial, onChange }: Props) {
  const [values, setValues] = useState<WeatherOverride>(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const update = (patch: Partial<WeatherOverride>) => {
    const next = { ...values, ...patch };
    setValues(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), 400);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Juster vær manuelt
      </p>

      <SliderRow
        label="Temperatur"
        value={values.airTemp}
        min={-20}
        max={40}
        step={0.5}
        format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}°C`}
        onChange={(v) => update({ airTemp: v })}
      />

      <SliderRow
        label="Vind"
        value={values.windSpeed}
        min={0}
        max={30}
        step={0.5}
        format={(v) => `${v.toFixed(1)} m/s`}
        onChange={(v) => update({ windSpeed: v })}
      />

      <SliderRow
        label="Fuktighet"
        value={values.humidity}
        min={0}
        max={100}
        step={5}
        format={(v) => `${v.toFixed(0)}%`}
        onChange={(v) => update({ humidity: v })}
      />

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400 w-24 shrink-0">Nedbør</span>
        <div className="flex flex-1 gap-1">
          {PRECIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ precipitation: opt.value })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                values.precipitation === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <span className="block text-base leading-none mb-0.5">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <SliderRow
        label="Nedbørssjanse"
        value={values.precipitationProb}
        min={0}
        max={100}
        step={5}
        format={(v) => `${v.toFixed(0)}%`}
        onChange={(v) => update({ precipitationProb: v })}
      />
    </div>
  );
}
