import { NextRequest, NextResponse } from 'next/server';
import {
  fetchWeather,
  getRecommendationFromWeather,
} from '@kledningsapp/recommendation-engine';
import type { ActivityInput, UserInput } from '@kledningsapp/recommendation-engine';

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

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return NextResponse.json({ error: 'lat og lon er påkrevd' }, { status: 400 });
  }
  if (!activity?.type || typeof activity.durationMinutes !== 'number') {
    return NextResponse.json({ error: 'activity.type og activity.durationMinutes er påkrevd' }, { status: 400 });
  }

  try {
    const weather = await fetchWeather({ lat, lon }, activity.durationMinutes);
    const result = getRecommendationFromWeather({ lat, lon }, weather, activity, user);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=1800' }, // 30 min
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukjent feil';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
