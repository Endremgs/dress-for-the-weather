import { jest } from '@jest/globals';
import { fetchWeather } from '../weather.js';

// fetchWeather tests mock global.fetch.
// When editing the Met API response shape in weather.ts, update the mock helpers here.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFetch = jest.fn() as any;
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

function metResponse(
  airTemp: number,
  windSpeed: number,
  humidity: number,
  precipAmount1h: number | null,
  precipProb1h: number | null,
  precipAmount6h?: number,
  precipProb6h?: number
) {
  const next_1_hours =
    precipAmount1h !== null
      ? {
          summary: { symbol_code: 'partly_cloudy' },
          details: {
            precipitation_amount: precipAmount1h,
            probability_of_precipitation: precipProb1h ?? 0,
          },
        }
      : undefined;

  const next_6_hours =
    precipAmount6h !== undefined
      ? {
          summary: { symbol_code: 'cloudy' },
          details: {
            precipitation_amount: precipAmount6h,
            probability_of_precipitation: precipProb6h ?? 0,
          },
        }
      : undefined;

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () =>
      Promise.resolve({
        properties: {
          timeseries: [
            {
              time: '2026-06-08T12:00:00Z',
              data: {
                instant: {
                  details: {
                    air_temperature: airTemp,
                    wind_speed: windSpeed,
                    relative_humidity: humidity,
                  },
                },
                next_1_hours,
                next_6_hours,
              },
            },
          ],
        },
      }),
  };
}

describe('fetchWeather - grunnleggende mapping', () => {
  test('mapper met-felt korrekt', async () => {
    mockFetch.mockResolvedValue(metResponse(5, 3, 80, 0, 20));

    const result = await fetchWeather({ lat: 59.9139, lon: 10.7522 });

    expect(result.airTemp).toBe(5);
    expect(result.windSpeed).toBe(3);
    expect(result.humidity).toBe(80);
    expect(result.precipitation).toBe('none');
    expect(result.precipitationProb).toBe(20);
  });

  test('URL inneholder korrekt koordinat-format', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 0, 0));

    await fetchWeather({ lat: 59.9139, lon: 10.7522 });

    const calledUrl = mockFetch.mock.calls[0]![0] as string;
    expect(calledUrl).toContain('lat=59.9139');
    expect(calledUrl).toContain('lon=10.7522');
  });

  test('sender User-Agent header', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 0, 0));

    await fetchWeather({ lat: 59.9139, lon: 10.7522 });

    const calledOptions = mockFetch.mock.calls[0]![1] as RequestInit;
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers['User-Agent']).toBeTruthy();
  });
});

describe('fetchWeather - nedbørsklassifisering', () => {
  // Thresholds in classifyPrecipitation: < 0.1 → none, < 0.5 → light, < 2.0 → moderate, >= 2.0 → heavy

  test('0 mm → none', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 0, 0));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('none');
  });

  test('0.3 mm → light', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 0.3, 40));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('light');
  });

  test('0.5 mm → moderate (grenseverdi: 0.5 er IKKE < 0.5)', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 0.5, 60));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('moderate');
  });

  test('1.5 mm → moderate', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 1.5, 70));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('moderate');
  });

  test('2.0 mm → heavy (grenseverdi: 2.0 er IKKE < 2.0)', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 2.0, 90));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('heavy');
  });

  test('5.0 mm → heavy', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 5.0, 95));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('heavy');
  });
});

describe('fetchWeather - fallback til next_6_hours', () => {
  test('bruker next_6_hours når next_1_hours mangler', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, null, null, 1.5, 75));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('moderate');
    expect(result.precipitationProb).toBe(75);
  });

  test('next_1_hours prioriteres over next_6_hours', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, 0.3, 40, 3.0, 90));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('light'); // bruker 1h (0.3) ikke 6h (3.0)
    expect(result.precipitationProb).toBe(40);
  });

  test('ingen next_1h eller next_6h → precip=none, prob=0', async () => {
    mockFetch.mockResolvedValue(metResponse(10, 2, 60, null, null));
    const result = await fetchWeather({ lat: 59.9, lon: 10.7 });
    expect(result.precipitation).toBe('none');
    expect(result.precipitationProb).toBe(0);
  });
});

describe('fetchWeather - feilhåndtering', () => {
  test('kaster feil ved ikke-OK svar', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: () => Promise.resolve({}),
    });

    await expect(fetchWeather({ lat: 59.9, lon: 10.7 })).rejects.toThrow('429');
  });

  test('kaster feil ved tom timeseries', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () =>
        Promise.resolve({
          properties: { timeseries: [] },
        }),
    });

    await expect(fetchWeather({ lat: 59.9, lon: 10.7 })).rejects.toThrow();
  });
});
