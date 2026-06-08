export type ActivityType =
  | 'rusling'
  | 'løping'
  | 'sykling'
  | 'fjelltur'
  | 'langrenn'
  | 'alpint'
  | 'klatring'
  | 'svømming';

export type PrecipitationLevel = 'none' | 'light' | 'moderate' | 'heavy';

export type WarningLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ForecastEntry {
  time: string;
  airTemp: number;
  windSpeed: number;
  precipitation: PrecipitationLevel;
  precipitationProb: number;
}

export type ForecastAlertType = 'regn' | 'temperaturfall' | 'vindøkning';

export interface ForecastAlert {
  type: ForecastAlertType;
  message: string;
  startsInMinutes: number;
  severity: 'info' | 'advarsel';
}

export interface WeatherInput {
  airTemp: number;
  windSpeed: number;
  humidity: number;
  precipitation: PrecipitationLevel;
  precipitationProb: number;
  cloudCover: number; // 0–100 %
  forecastWindow: ForecastEntry[];
}

export interface ActivityInput {
  type: ActivityType;
  intensityLevel?: 'low' | 'medium' | 'high';
  durationMinutes: number;
}

export interface UserInput {
  sensitivity: number; // -2 to +2
}

export interface ZoneRecommendation {
  required: boolean;
  item: string;
  reason?: string;
}

export interface LayerRecommendation {
  item: string;
  required: boolean;
  clo?: number;
  material?: string;
}

export interface BodyZoneRecommendations {
  head: ZoneRecommendation;
  neck: ZoneRecommendation;
  upperBody: {
    baseLayer: LayerRecommendation;
    midLayer: LayerRecommendation | null;
    outerLayer: LayerRecommendation | null;
  };
  lowerBody: {
    baseLayer: LayerRecommendation | null;
    outerLayer: LayerRecommendation;
  };
  hands: ZoneRecommendation;
  feet: LayerRecommendation;
  backpackExtras: string[];
  /** Sikkerhetsutstyr og aktivitetsspesifikt utstyr (hjelm, goggles, sele etc.) */
  mandatoryGear: string[];
}

export interface SafetyWarning {
  level: WarningLevel;
  message: string;
  recommendation: string;
}

export interface RecommendationResult {
  weather: WeatherInput & { location: { lat: number; lon: number } };
  apparentTemp: number;
  effectiveTemp: number;
  targetClo: number;
  garments: BodyZoneRecommendations;
  notes: string[];
  safetyWarnings: SafetyWarning[];
  summary: string;
  forecastAlerts: ForecastAlert[];
}

export interface Location {
  lat: number;
  lon: number;
}
