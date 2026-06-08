import { NextRequest, NextResponse } from 'next/server';
import {
  fetchWeather,
  getRecommendationFromWeather,
} from '@kledningsapp/recommendation-engine';
import type { ActivityInput, ActivityType, UserInput } from '@kledningsapp/recommendation-engine';

const VALID_ACTIVITIES: ActivityType[] = [
  'rusling', 'løping', 'sykling', 'fjelltur', 'langrenn', 'alpint', 'klatring', 'svømming',
];

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

  const { lat, lon, activity, user } = body as {
    lat?: number;
    lon?: number;
    activity?: ActivityInput;
    user?: UserInput;
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

  try {
    const weather = await fetchWeather({ lat, lon });
    const result = getRecommendationFromWeather({ lat, lon }, weather, activity, user);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
