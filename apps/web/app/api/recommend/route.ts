import { NextRequest, NextResponse } from 'next/server';
import {
  fetchWeather,
  getRecommendationFromWeather,
} from '@kledningsapp/recommendation-engine';
import type { ActivityInput, ActivityType, PrecipitationLevel, UserInput, WeatherInput } from '@kledningsapp/recommendation-engine';

const VALID_ACTIVITIES: ActivityType[] = [
  'rusling', 'løping', 'sykling', 'fjelltur', 'langrenn', 'alpint', 'klatring', 'svømming',
];

const VALID_PRECIPITATION: PrecipitationLevel[] = ['none', 'light', 'moderate', 'heavy'];

interface WeatherOverrideInput {
  airTemp: number;
  windSpeed: number;
  humidity: number;
  precipitation: PrecipitationLevel;
  precipitationProb: number;
}

function validateWeatherOverride(o: unknown): WeatherOverrideInput | string {
  if (typeof o !== 'object' || o === null) return 'weatherOverride må være et objekt';
  const ov = o as Record<string, unknown>;
  if (typeof ov.airTemp !== 'number' || !isFinite(ov.airTemp) || ov.airTemp < -60 || ov.airTemp > 60)
    return 'weatherOverride.airTemp må være mellom -60 og 60';
  if (typeof ov.windSpeed !== 'number' || !isFinite(ov.windSpeed) || ov.windSpeed < 0 || ov.windSpeed > 100)
    return 'weatherOverride.windSpeed må være mellom 0 og 100';
  if (typeof ov.humidity !== 'number' || !isFinite(ov.humidity) || ov.humidity < 0 || ov.humidity > 100)
    return 'weatherOverride.humidity må være mellom 0 og 100';
  if (!(VALID_PRECIPITATION as unknown[]).includes(ov.precipitation))
    return `weatherOverride.precipitation må være en av: ${VALID_PRECIPITATION.join(', ')}`;
  if (typeof ov.precipitationProb !== 'number' || !isFinite(ov.precipitationProb) || ov.precipitationProb < 0 || ov.precipitationProb > 100)
    return 'weatherOverride.precipitationProb må være mellom 0 og 100';
  return ov as unknown as WeatherOverrideInput;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const { lat, lon, activity, user, weatherOverride } = body as {
    lat?: number;
    lon?: number;
    activity?: ActivityInput;
    user?: UserInput;
    weatherOverride?: unknown;
  };

  if (typeof lat !== 'number' || !isFinite(lat) || lat < -90 || lat > 90) {
    return NextResponse.json({ error: 'lat må være et gyldig tall mellom -90 og 90' }, { status: 400 });
  }
  if (typeof lon !== 'number' || !isFinite(lon) || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'lon må være et gyldig tall mellom -180 og 180' }, { status: 400 });
  }
  if (!activity?.type || !(VALID_ACTIVITIES as string[]).includes(activity.type)) {
    return NextResponse.json({ error: `activity.type må være en av: ${VALID_ACTIVITIES.join(', ')}` }, { status: 400 });
  }
  if (typeof activity.durationMinutes !== 'number' || !isFinite(activity.durationMinutes) || activity.durationMinutes < 1 || activity.durationMinutes > 1440) {
    return NextResponse.json({ error: 'activity.durationMinutes må være et heltall mellom 1 og 1440' }, { status: 400 });
  }
  if (user !== undefined) {
    if (typeof user.sensitivity !== 'number' || !isFinite(user.sensitivity) || user.sensitivity < -2 || user.sensitivity > 2) {
      return NextResponse.json({ error: 'user.sensitivity må være et tall mellom -2 og 2' }, { status: 400 });
    }
  }

  let validatedOverride: WeatherOverrideInput | null = null;
  if (weatherOverride !== undefined) {
    const result = validateWeatherOverride(weatherOverride);
    if (typeof result === 'string') {
      return NextResponse.json({ error: result }, { status: 400 });
    }
    validatedOverride = result;
  }

  try {
    let weather: WeatherInput;
    if (validatedOverride) {
      weather = { ...validatedOverride, forecastWindow: [] };
    } else {
      weather = await fetchWeather({ lat, lon }, activity.durationMinutes);
    }
    const result = getRecommendationFromWeather({ lat, lon }, weather, activity, user);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
