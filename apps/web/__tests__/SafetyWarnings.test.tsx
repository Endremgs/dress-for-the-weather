import { render, screen } from '@testing-library/react';
import { SafetyWarnings } from '@/components/SafetyWarnings';
import type { SafetyWarning } from '@kledningsapp/recommendation-engine';

describe('SafetyWarnings', () => {
  it('renders nothing when no warnings', () => {
    const { container } = render(<SafetyWarnings warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a critical warning', () => {
    const warnings: SafetyWarning[] = [
      { level: 'critical', message: 'Hypotermirisiko', recommendation: 'Unngå å gå ut' },
    ];
    render(<SafetyWarnings warnings={warnings} />);
    expect(screen.getByText('Hypotermirisiko')).toBeInTheDocument();
    expect(screen.getByText('Unngå å gå ut')).toBeInTheDocument();
    expect(screen.getByText('🚨')).toBeInTheDocument();
  });

  it('renders a high warning', () => {
    const warnings: SafetyWarning[] = [
      { level: 'high', message: 'Kraftig vind', recommendation: 'Bruk vindtett ytterlag' },
    ];
    render(<SafetyWarnings warnings={warnings} />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Kraftig vind')).toBeInTheDocument();
  });

  it('renders multiple warnings', () => {
    const warnings: SafetyWarning[] = [
      { level: 'high', message: 'Advarsel 1', recommendation: 'Tiltak 1' },
      { level: 'medium', message: 'Advarsel 2', recommendation: 'Tiltak 2' },
      { level: 'low', message: 'Info 3', recommendation: 'Tips 3' },
    ];
    render(<SafetyWarnings warnings={warnings} />);
    expect(screen.getByText('Advarsel 1')).toBeInTheDocument();
    expect(screen.getByText('Advarsel 2')).toBeInTheDocument();
    expect(screen.getByText('Info 3')).toBeInTheDocument();
  });

  it('renders the section heading when warnings exist', () => {
    const warnings: SafetyWarning[] = [
      { level: 'low', message: 'Test', recommendation: 'Rec' },
    ];
    render(<SafetyWarnings warnings={warnings} />);
    expect(screen.getByText('Advarsler')).toBeInTheDocument();
  });
});
