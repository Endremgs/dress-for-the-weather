import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { WeatherOverridePanel } from '@/components/WeatherOverridePanel';
import type { WeatherOverride } from '@/components/WeatherOverridePanel';

vi.useFakeTimers();

const initial: WeatherOverride = {
  airTemp: 5,
  windSpeed: 3,
  humidity: 70,
  precipitation: 'none',
  precipitationProb: 10,
};

describe('WeatherOverridePanel', () => {
  it('renders all slider labels', () => {
    render(<WeatherOverridePanel initial={initial} onChange={vi.fn()} />);
    expect(screen.getByText('Temperatur')).toBeInTheDocument();
    expect(screen.getByText('Vind')).toBeInTheDocument();
    expect(screen.getByText('Fuktighet')).toBeInTheDocument();
    expect(screen.getByText('Nedbørssjanse')).toBeInTheDocument();
  });

  it('renders all precipitation buttons', () => {
    render(<WeatherOverridePanel initial={initial} onChange={vi.fn()} />);
    expect(screen.getByText('Ingen')).toBeInTheDocument();
    expect(screen.getByText('Lett')).toBeInTheDocument();
    expect(screen.getByText('Moderat')).toBeInTheDocument();
    expect(screen.getByText('Kraftig')).toBeInTheDocument();
  });

  it('shows initial temperature value', () => {
    render(<WeatherOverridePanel initial={initial} onChange={vi.fn()} />);
    expect(screen.getByText('+5.0°C')).toBeInTheDocument();
  });

  it('calls onChange with updated precipitation after clicking a button', () => {
    const onChange = vi.fn();
    render(<WeatherOverridePanel initial={initial} onChange={onChange} />);
    fireEvent.click(screen.getByText('Lett'));
    act(() => { vi.runAllTimers(); });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ precipitation: 'light' }));
  });

  it('calls onChange debounced after slider change', () => {
    const onChange = vi.fn();
    render(<WeatherOverridePanel initial={initial} onChange={onChange} />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '10' } });
    expect(onChange).not.toHaveBeenCalled();
    act(() => { vi.runAllTimers(); });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ airTemp: 10 }));
  });
});
