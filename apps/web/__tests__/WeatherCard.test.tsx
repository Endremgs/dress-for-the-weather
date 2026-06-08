import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { WeatherCard } from '@/components/WeatherCard';
import type { RecommendationResult } from '@kledningsapp/recommendation-engine';

const mockResult: RecommendationResult = {
  weather: {
    airTemp: 8.5,
    windSpeed: 4.2,
    humidity: 72,
    precipitation: 'light',
    precipitationProb: 40,
  },
  apparentTemp: 5.3,
  effectiveTemp: 3.1,
  targetClo: 1.1,
  garments: {
    head: { item: 'Tynn lue', required: true, clo: 0.1 },
    neck: null,
    upperBody: {
      baseLayer: { item: 'Ullundertøy', required: true, material: 'Merinould', clo: 0.3 },
      midLayer: { item: 'Fleecegenser', required: true, clo: 0.4 },
      outerLayer: { item: 'Softshell-jakke', required: true, clo: 0.3 },
    },
    lowerBody: {
      baseLayer: null,
      outerLayer: { item: 'Joggebukse', required: true, clo: 0.3 },
    },
    hands: { item: 'Tynne hansker', required: true, clo: 0.1 },
    feet: { item: 'Ullsokker', required: true, clo: 0.1 },
    backpackExtras: [],
    mandatoryGear: [],
  },
  notes: [],
  summary: 'Kjølig dag — kle deg i lag',
  safetyWarnings: [],
};

describe('WeatherCard', () => {
  it('displays air temperature', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText('8.5°')).toBeInTheDocument();
  });

  it('displays apparent temperature', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText(/Føles som 5.3°C/)).toBeInTheDocument();
  });

  it('displays wind speed', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText(/4.2 m\/s/)).toBeInTheDocument();
  });

  it('displays humidity', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText(/72% fuktighet/)).toBeInTheDocument();
  });

  it('displays precipitation label for light rain', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText(/Lett nedbør/)).toBeInTheDocument();
  });

  it('displays precipitation probability when > 0', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText(/40% nedbørssannsynlighet/)).toBeInTheDocument();
  });

  it('displays effective temp and CLO', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.getByText('3.1°C')).toBeInTheDocument();
    expect(screen.getByText('1.10 CLO')).toBeInTheDocument();
  });

  it('shows location name when provided', () => {
    render(<WeatherCard result={mockResult} locationName="Oslo (standard)" />);
    expect(screen.getByText('Oslo (standard)')).toBeInTheDocument();
  });

  it('hides location name when not provided', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.queryByText('Oslo (standard)')).not.toBeInTheDocument();
  });

  it('hides precipitation probability when 0', () => {
    const result = { ...mockResult, weather: { ...mockResult.weather, precipitationProb: 0 } };
    render(<WeatherCard result={result} />);
    expect(screen.queryByText(/nedbørssannsynlighet/)).not.toBeInTheDocument();
  });

  it('shows "Juster vær manuelt" button when onToggleManual is provided', () => {
    render(<WeatherCard result={mockResult} onToggleManual={vi.fn()} />);
    expect(screen.getByText(/Juster vær manuelt/)).toBeInTheDocument();
  });

  it('shows "Tilbake til geo-posisjon" when in manual mode', () => {
    render(<WeatherCard result={mockResult} isManualMode onToggleManual={vi.fn()} />);
    expect(screen.getByText(/Tilbake til geo-posisjon/)).toBeInTheDocument();
  });

  it('shows "Manuell modus" badge when in manual mode', () => {
    render(<WeatherCard result={mockResult} isManualMode onToggleManual={vi.fn()} />);
    expect(screen.getByText('Manuell modus')).toBeInTheDocument();
  });

  it('calls onToggleManual when toggle button is clicked', () => {
    const handler = vi.fn();
    render(<WeatherCard result={mockResult} onToggleManual={handler} />);
    fireEvent.click(screen.getByText(/Juster vær manuelt/));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not render toggle button when onToggleManual is not provided', () => {
    render(<WeatherCard result={mockResult} />);
    expect(screen.queryByText(/Juster vær manuelt/)).not.toBeInTheDocument();
  });
});
