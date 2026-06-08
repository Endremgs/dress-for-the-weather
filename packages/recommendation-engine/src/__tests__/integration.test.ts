import { getRecommendationFromWeather } from '../index.js';
import type { WeatherInput, ActivityInput, UserInput } from '../types.js';

// Tests for the full recommendation pipeline.
// When adding new fields to RecommendationResult, add assertions here.

const OSLO_LOCATION = { lat: 59.9139, lon: 10.7522 };

const coldWinterWeather: WeatherInput = {
  airTemp: -5,
  windSpeed: 5,
  humidity: 70,
  precipitation: 'none',
  precipitationProb: 10,
  cloudCover: 40,
};

const warmSummerWeather: WeatherInput = {
  airTemp: 22,
  windSpeed: 2,
  humidity: 55,
  precipitation: 'none',
  precipitationProb: 0,
  cloudCover: 10,
};

const rainyWeather: WeatherInput = {
  airTemp: 8,
  windSpeed: 4,
  humidity: 90,
  precipitation: 'moderate',
  precipitationProb: 80,
  cloudCover: 85,
};

describe('getRecommendationFromWeather - result shape', () => {
  test('returnerer alle påkrevde felt', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 45 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);

    expect(result).toHaveProperty('weather');
    expect(result).toHaveProperty('apparentTemp');
    expect(result).toHaveProperty('effectiveTemp');
    expect(result).toHaveProperty('targetClo');
    expect(result).toHaveProperty('garments');
    expect(result).toHaveProperty('notes');
    expect(result).toHaveProperty('safetyWarnings');
    expect(result).toHaveProperty('summary');
  });

  test('weather-felt inkluderer location', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 30 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);
    expect(result.weather.location).toEqual(OSLO_LOCATION);
    expect(result.weather.airTemp).toBe(22);
  });

  test('garments inneholder alle soner', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 30 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);

    expect(result.garments).toHaveProperty('head');
    expect(result.garments).toHaveProperty('neck');
    expect(result.garments).toHaveProperty('upperBody');
    expect(result.garments).toHaveProperty('lowerBody');
    expect(result.garments).toHaveProperty('hands');
    expect(result.garments).toHaveProperty('feet');
    expect(result.garments).toHaveProperty('backpackExtras');
  });
});

describe('getRecommendationFromWeather - beregninger', () => {
  test('standard bruker-sensitivitet er 0 når user er undefined', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 60 };
    const resultNoUser = getRecommendationFromWeather(OSLO_LOCATION, coldWinterWeather, activity);
    const resultZeroSensitivity = getRecommendationFromWeather(
      OSLO_LOCATION,
      coldWinterWeather,
      activity,
      { sensitivity: 0 }
    );
    expect(resultNoUser.effectiveTemp).toBeCloseTo(resultZeroSensitivity.effectiveTemp, 10);
  });

  test('sensitivitet +2 gir høyere effectiveTemp enn -2', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 60 };
    const warm = getRecommendationFromWeather(OSLO_LOCATION, coldWinterWeather, activity, {
      sensitivity: 2,
    });
    const cold = getRecommendationFromWeather(OSLO_LOCATION, coldWinterWeather, activity, {
      sensitivity: -2,
    });
    expect(warm.effectiveTemp - cold.effectiveTemp).toBeCloseTo(4, 5);
  });

  test('kald vinterdag med løping: effectiveTemp bør ligge under 0 (vind+aktivitet)', () => {
    // -5°C, 5 m/s wind, løping 45 min:
    // apparentTemp ≈ -11.2 (wind chill), activity offset +5.6, duration factor ~1.0375
    // effectiveTemp ≈ -11.2 + 5.6 - 1.56 ≈ -7.2
    const activity: ActivityInput = { type: 'løping', durationMinutes: 45 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, coldWinterWeather, activity);
    expect(result.effectiveTemp).toBeLessThan(0);
    expect(result.apparentTemp).toBeLessThan(-5);
  });

  test('varm sommerdag med rusling: effectiveTemp over 10', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 60 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);
    expect(result.effectiveTemp).toBeGreaterThan(10);
    expect(result.targetClo).toBeLessThanOrEqual(0.55);
  });

  test('targetClo øker jo kaldere effectiveTemp er', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 60 };
    const summer = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);
    const winter = getRecommendationFromWeather(OSLO_LOCATION, coldWinterWeather, activity);
    expect(winter.targetClo).toBeGreaterThan(summer.targetClo);
  });
});

describe('getRecommendationFromWeather - sikkerhetsvarsler', () => {
  test('ingen advarsler på varm dag uten vind', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 45 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);
    expect(result.safetyWarnings).toHaveLength(0);
  });

  test('kald dag + løping → minst én advarsel', () => {
    const activity: ActivityInput = { type: 'løping', durationMinutes: 45 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, coldWinterWeather, activity);
    expect(result.safetyWarnings.length).toBeGreaterThan(0);
  });
});

describe('getRecommendationFromWeather - regn-scenario', () => {
  test('moderate nedbør → hardshell regnjakke anbefalt', () => {
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 60 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, rainyWeather, activity);
    expect(result.garments.upperBody.outerLayer?.item).toBe('Hardshell regnjakke');
  });

  test('moderate nedbør → lavere effectiveTemp enn tørt vær ellers likt', () => {
    const dryWeather: WeatherInput = { ...rainyWeather, precipitation: 'none' };
    const activity: ActivityInput = { type: 'rusling', durationMinutes: 60 };
    const wet = getRecommendationFromWeather(OSLO_LOCATION, rainyWeather, activity);
    const dry = getRecommendationFromWeather(OSLO_LOCATION, dryWeather, activity);
    expect(dry.effectiveTemp).toBeGreaterThan(wet.effectiveTemp);
  });
});

describe('getRecommendationFromWeather - fjelltur domeneregel', () => {
  test('fjelltur alltid regntøy i sekken uansett vær', () => {
    const activity: ActivityInput = { type: 'fjelltur', durationMinutes: 180 };
    const result = getRecommendationFromWeather(OSLO_LOCATION, warmSummerWeather, activity);
    expect(result.garments.backpackExtras).toContain('Regntøy i sekken (alltid i Norge)');
  });
});
