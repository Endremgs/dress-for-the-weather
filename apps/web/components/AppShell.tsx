'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ActivityType, RecommendationResult } from '@kledningsapp/recommendation-engine';
import { ActivityPicker } from './ActivityPicker';
import { WeatherCard } from './WeatherCard';
import { OutfitDisplay } from './OutfitDisplay';
import { SafetyWarnings } from './SafetyWarnings';

interface Location {
  lat: number;
  lon: number;
  name?: string;
}

type Status = 'idle' | 'locating' | 'loading' | 'done' | 'error';

export function AppShell() {
  const [location, setLocation] = useState<Location | null>(null);
  const [activity, setActivity] = useState<ActivityType>('rusling');
  const [duration, setDuration] = useState(60);
  const [sensitivity, setSensitivity] = useState(0);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(
    async (loc: Location, act: ActivityType, dur: number, sens: number) => {
      setStatus('loading');
      setError(null);
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: loc.lat,
            lon: loc.lon,
            activity: { type: act, durationMinutes: dur },
            user: { sensitivity: sens },
          }),
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? 'Noe gikk galt');
        }
        const data = await res.json() as RecommendationResult;
        setResult(data);
        setStatus('done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ukjent feil');
        setStatus('error');
      }
    },
    []
  );

  const requestLocation = useCallback(() => {
    setStatus('locating');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc: Location = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(loc);
        await fetchRecommendation(loc, activity, duration, sensitivity);
      },
      () => {
        // Fallback: Oslo sentrum
        const oslo: Location = { lat: 59.9139, lon: 10.7522, name: 'Oslo (standard)' };
        setLocation(oslo);
        fetchRecommendation(oslo, activity, duration, sensitivity);
      },
      { timeout: 8000 }
    );
  }, [activity, duration, sensitivity, fetchRecommendation]);

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActivityChange = (act: ActivityType, dur: number, sens: number) => {
    setActivity(act);
    setDuration(dur);
    setSensitivity(sens);
    if (location) {
      fetchRecommendation(location, act, dur, sens);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kle deg riktig</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Basert på lokalt vær og aktivitet</p>
      </header>

      <ActivityPicker
        selectedActivity={activity}
        durationMinutes={duration}
        sensitivity={sensitivity}
        onChange={handleActivityChange}
      />

      {status === 'locating' && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-3xl mb-2">📍</div>
          <p>Henter lokasjon...</p>
        </div>
      )}

      {status === 'loading' && (
        <div className="text-center py-8 text-slate-400">
          <div className="animate-spin text-3xl mb-2">⟳</div>
          <p>Henter vær og beregner...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-center">
          <p className="text-red-800 dark:text-red-200 font-medium">Noe gikk galt</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          <button
            onClick={requestLocation}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Prøv igjen
          </button>
        </div>
      )}

      {status === 'done' && result && (
        <>
          <WeatherCard result={result} locationName={location?.name} />
          <SafetyWarnings warnings={result.safetyWarnings} />
          <OutfitDisplay result={result} />
        </>
      )}

      <footer className="text-center text-xs text-slate-400 pb-4">
        Værdata fra{' '}
        <a href="https://api.met.no" className="underline" target="_blank" rel="noopener noreferrer">
          api.met.no
        </a>
      </footer>
    </main>
  );
}
