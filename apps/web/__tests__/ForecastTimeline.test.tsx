import { render, screen } from '@testing-library/react';
import { ForecastTimeline } from '../components/ForecastTimeline';
import type { WeatherInput } from '@kledningsapp/recommendation-engine';

const baseWeather: WeatherInput & { location: { lat: number; lon: number } } = {
  airTemp: 10,
  windSpeed: 3,
  humidity: 70,
  precipitation: 'none',
  precipitationProb: 0,
  cloudCover: 30,
  location: { lat: 59.9, lon: 10.7 },
  forecastWindow: [],
};

describe('ForecastTimeline', () => {
  it('renders nothing when forecastWindow is empty', () => {
    const { container } = render(
      <ForecastTimeline weather={baseWeather} durationMinutes={60} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders "Nå" entry and forecast entries within duration', () => {
    const weather = {
      ...baseWeather,
      forecastWindow: [
        {
          time: '2026-06-08T10:00:00Z',
          airTemp: 12,
          windSpeed: 4,
          precipitation: 'none' as const,
          precipitationProb: 5,
          cloudCover: 40,
        },
        {
          time: '2026-06-08T11:00:00Z',
          airTemp: 8,
          windSpeed: 7,
          precipitation: 'light' as const,
          precipitationProb: 60,
          cloudCover: 90,
        },
      ],
    };
    render(<ForecastTimeline weather={weather} durationMinutes={120} />);
    expect(screen.getByText('Nå')).toBeInTheDocument();
    expect(screen.getByText('Vær under turen')).toBeInTheDocument();
  });

  it('only shows entries within the activity duration', () => {
    const weather = {
      ...baseWeather,
      forecastWindow: [
        {
          time: '2026-06-08T10:00:00Z',
          airTemp: 12,
          windSpeed: 4,
          precipitation: 'none' as const,
          precipitationProb: 0,
          cloudCover: 20,
        },
        {
          time: '2026-06-08T11:00:00Z',
          airTemp: 8,
          windSpeed: 7,
          precipitation: 'light' as const,
          precipitationProb: 50,
          cloudCover: 80,
        },
      ],
    };
    // duration 60 min → only 1 hourly entry (ceil(60/60) = 1)
    render(<ForecastTimeline weather={weather} durationMinutes={60} />);
    expect(screen.getByText('Nå')).toBeInTheDocument();
    // Only first forecast entry shown — the second should be cut
    const tempElements = screen.getAllByText(/°$/);
    // "Nå" entry (10°) + 1 forecast entry (12°) = 2 temp values
    expect(tempElements).toHaveLength(2);
  });

  it('shows precipitation probability when > 5%', () => {
    const weather = {
      ...baseWeather,
      precipitationProb: 40,
      forecastWindow: [
        {
          time: '2026-06-08T10:00:00Z',
          airTemp: 10,
          windSpeed: 3,
          precipitation: 'light' as const,
          precipitationProb: 75,
          cloudCover: 80,
        },
      ],
    };
    render(<ForecastTimeline weather={weather} durationMinutes={60} />);
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
