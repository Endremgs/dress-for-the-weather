import type { WeatherInput, PrecipitationLevel, Location } from './types.js';

const MET_API_BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const USER_AGENT = 'kledningsapp/1.0 github.com/kledningsapp';

interface MetTimeseries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        relative_humidity: number;
        cloud_area_fraction?: number;
        precipitation_amount?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount: number; probability_of_precipitation: number };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount: number; probability_of_precipitation: number };
    };
  };
}

function classifyPrecipitation(amount: number): PrecipitationLevel {
  if (amount === 0) return 'none';
  if (amount < 0.5) return 'light';
  if (amount < 2.0) return 'moderate';
  return 'heavy';
}

export async function fetchWeather(location: Location): Promise<WeatherInput> {
  const url = `${MET_API_BASE}?lat=${location.lat.toFixed(4)}&lon=${location.lon.toFixed(4)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`api.met.no returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json() as {
    properties: { timeseries: MetTimeseries[] };
  };

  const timeseries = data.properties.timeseries;
  if (!timeseries || timeseries.length === 0) {
    throw new Error('No timeseries data from api.met.no');
  }

  const current = timeseries[0];
  if (!current) throw new Error('No current timeseries entry');

  const instant = current.data.instant.details;
  const next1h = current.data.next_1_hours;
  const next6h = current.data.next_6_hours;

  const precipAmount = next1h?.details.precipitation_amount ?? next6h?.details.precipitation_amount ?? 0;
  const precipProb = next1h?.details.probability_of_precipitation ?? next6h?.details.probability_of_precipitation ?? 0;

  return {
    airTemp: instant.air_temperature,
    windSpeed: instant.wind_speed,
    humidity: instant.relative_humidity,
    precipitation: classifyPrecipitation(precipAmount),
    precipitationProb: precipProb,
    cloudCover: instant.cloud_area_fraction ?? 50,
  };
}
