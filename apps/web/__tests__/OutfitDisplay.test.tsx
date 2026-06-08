import { render, screen } from '@testing-library/react';
import { OutfitDisplay } from '@/components/OutfitDisplay';
import type { RecommendationResult } from '@kledningsapp/recommendation-engine';

const baseResult: RecommendationResult = {
  weather: {
    airTemp: 5.0,
    windSpeed: 3.0,
    humidity: 65,
    precipitation: 'none',
    precipitationProb: 10,
  },
  apparentTemp: 3.0,
  effectiveTemp: 1.0,
  targetClo: 1.1,
  garments: {
    head: { item: 'Tynn lue', required: true, clo: 0.1 },
    neck: { item: 'Halstørkle', required: false, clo: 0.05 },
    upperBody: {
      baseLayer: { item: 'Ullundertøy', required: true, material: 'Merinould', clo: 0.3 },
      midLayer: { item: 'Fleecegenser', required: true, clo: 0.4 },
      outerLayer: { item: 'Softshell-jakke', required: false, clo: 0.3 },
    },
    lowerBody: {
      baseLayer: { item: 'Kompresjonstights', required: false, clo: 0.2 },
      outerLayer: { item: 'Joggebukse', required: true, clo: 0.3 },
    },
    hands: { item: 'Tynne hansker', required: true, clo: 0.1 },
    feet: { item: 'Ullsokker', required: true, clo: 0.1 },
    backpackExtras: ['Regnjakke', 'Ekstra lag'],
  },
  notes: ['Ta med vann', 'Solfaktor anbefales'],
  summary: 'Kjølig dag — kle deg i lag',
  safetyWarnings: [],
};

describe('OutfitDisplay', () => {
  it('renders the summary', () => {
    render(<OutfitDisplay result={baseResult} />);
    expect(screen.getByText('Kjølig dag — kle deg i lag')).toBeInTheDocument();
  });

  it('renders required garments', () => {
    render(<OutfitDisplay result={baseResult} />);
    expect(screen.getByText('Tynn lue')).toBeInTheDocument();
    expect(screen.getByText('Ullundertøy')).toBeInTheDocument();
    expect(screen.getByText('Fleecegenser')).toBeInTheDocument();
    expect(screen.getByText('Joggebukse')).toBeInTheDocument();
    expect(screen.getByText('Tynne hansker')).toBeInTheDocument();
    expect(screen.getByText('Ullsokker')).toBeInTheDocument();
  });

  it('renders optional garments marked valgfri', () => {
    render(<OutfitDisplay result={baseResult} />);
    const valgfri = screen.getAllByText('valgfri');
    expect(valgfri.length).toBeGreaterThan(0);
  });

  it('renders material info', () => {
    render(<OutfitDisplay result={baseResult} />);
    expect(screen.getByText('(Merinould)')).toBeInTheDocument();
  });

  it('renders backpack extras section', () => {
    render(<OutfitDisplay result={baseResult} />);
    expect(screen.getByText('I sekken / vesken')).toBeInTheDocument();
    expect(screen.getByText('Regnjakke')).toBeInTheDocument();
    expect(screen.getByText('Ekstra lag')).toBeInTheDocument();
  });

  it('hides backpack section when empty', () => {
    const result = { ...baseResult, garments: { ...baseResult.garments, backpackExtras: [] } };
    render(<OutfitDisplay result={result} />);
    expect(screen.queryByText('I sekken / vesken')).not.toBeInTheDocument();
  });

  it('renders notes section', () => {
    render(<OutfitDisplay result={baseResult} />);
    expect(screen.getByText('Merknader')).toBeInTheDocument();
    expect(screen.getByText('Ta med vann')).toBeInTheDocument();
    expect(screen.getByText('Solfaktor anbefales')).toBeInTheDocument();
  });

  it('hides notes section when empty', () => {
    const result = { ...baseResult, notes: [] };
    render(<OutfitDisplay result={result} />);
    expect(screen.queryByText('Merknader')).not.toBeInTheDocument();
  });

  it('renders all section headings', () => {
    render(<OutfitDisplay result={baseResult} />);
    expect(screen.getByText('Hode og hals')).toBeInTheDocument();
    expect(screen.getByText('Overkropp')).toBeInTheDocument();
    expect(screen.getByText('Underkropp')).toBeInTheDocument();
    expect(screen.getByText('Hender og føtter')).toBeInTheDocument();
  });
});
