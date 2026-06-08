import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityPicker } from '@/components/ActivityPicker';
import type { ActivityType } from '@kledningsapp/recommendation-engine';

describe('ActivityPicker', () => {
  const defaultProps = {
    selectedActivity: 'rusling' as ActivityType,
    durationMinutes: 60,
    sensitivity: 0,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onChange.mockClear();
  });

  it('renders all 8 activities', () => {
    render(<ActivityPicker {...defaultProps} />);
    expect(screen.getByText('Rusling')).toBeInTheDocument();
    expect(screen.getByText('Løping')).toBeInTheDocument();
    expect(screen.getByText('Sykling')).toBeInTheDocument();
    expect(screen.getByText('Fjelltur')).toBeInTheDocument();
    expect(screen.getByText('Langrenn')).toBeInTheDocument();
    expect(screen.getByText('Alpint')).toBeInTheDocument();
    expect(screen.getByText('Klatring')).toBeInTheDocument();
    expect(screen.getByText('Svømming')).toBeInTheDocument();
  });

  it('calls onChange with new activity when clicked', () => {
    render(<ActivityPicker {...defaultProps} />);
    fireEvent.click(screen.getByText('Løping'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('løping', 60, 0);
  });

  it('calls onChange with new duration when duration button clicked', () => {
    render(<ActivityPicker {...defaultProps} />);
    fireEvent.click(screen.getByText('30 min'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('rusling', 30, 0);
  });

  it('renders duration buttons in minutes for < 60 min', () => {
    render(<ActivityPicker {...defaultProps} />);
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('renders duration buttons in hours for >= 60 min', () => {
    render(<ActivityPicker {...defaultProps} />);
    expect(screen.getByText('1 t')).toBeInTheDocument();
    expect(screen.getByText('2 t')).toBeInTheDocument();
  });

  it('shows sensitivity label as Normal at 0', () => {
    render(<ActivityPicker {...defaultProps} />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('calls onChange when sensitivity slider changes', () => {
    render(<ActivityPicker {...defaultProps} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '-1' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('rusling', 60, -1);
  });

  it('shows positive sensitivity label', () => {
    render(<ActivityPicker {...defaultProps} sensitivity={2} />);
    expect(screen.getByText('+2°C (varmetolerant)')).toBeInTheDocument();
  });

  it('shows negative sensitivity label', () => {
    render(<ActivityPicker {...defaultProps} sensitivity={-1} />);
    expect(screen.getByText('-1°C (kuldesensitiv)')).toBeInTheDocument();
  });
});
