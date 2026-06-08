import { fetchWeather } from './weather.js';
import { calcApparentTemp, calcActivityOffset, calcEffectiveTemp, getTargetClo } from './algorithm.js';
import { buildRecommendations } from './recommendations.js';
import { generateSafetyWarnings } from './safety.js';
import type {
  ActivityInput,
  Location,
  RecommendationResult,
  UserInput,
  WeatherInput,
} from './types.js';

export * from './types.js';
export { fetchWeather } from './weather.js';
export { MET_VALUES, calcApparentTemp, calcActivityOffset, calcEffectiveTemp, getTargetClo } from './algorithm.js';
export { buildRecommendations } from './recommendations.js';
export { generateSafetyWarnings } from './safety.js';

export async function getRecommendation(
  location: Location,
  activity: ActivityInput,
  user?: UserInput
): Promise<RecommendationResult> {
  const weather = await fetchWeather(location);
  return getRecommendationFromWeather(location, weather, activity, user);
}

export function getRecommendationFromWeather(
  location: Location,
  weather: WeatherInput,
  activity: ActivityInput,
  user?: UserInput
): RecommendationResult {
  const sensitivity = user?.sensitivity ?? 0;

  const apparentTemp = calcApparentTemp(weather.airTemp, weather.windSpeed, weather.humidity);
  const activityOffset = calcActivityOffset(activity.type);
  const effectiveTemp = calcEffectiveTemp(
    apparentTemp,
    activityOffset,
    activity.durationMinutes,
    weather.precipitation,
    sensitivity
  );
  const targetClo = getTargetClo(effectiveTemp);

  const { notes, summary, ...garments } = buildRecommendations(
    effectiveTemp,
    weather.windSpeed,
    weather.precipitation,
    activity.type
  );

  const safetyWarnings = generateSafetyWarnings(
    effectiveTemp,
    weather.windSpeed,
    activity.durationMinutes,
    activity.type
  );

  return {
    weather: { ...weather, location },
    apparentTemp,
    effectiveTemp,
    targetClo,
    garments,
    notes,
    safetyWarnings,
    summary,
  };
}
