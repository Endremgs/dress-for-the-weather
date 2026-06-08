import Foundation

// MARK: - Input types

enum ActivityType: String, Codable, CaseIterable {
    case rusling, løping, sykling, fjelltur, langrenn, alpint, klatring, svømming

    var label: String {
        switch self {
        case .rusling:  return "Rusling"
        case .løping:   return "Løping"
        case .sykling:  return "Sykling"
        case .fjelltur: return "Fjelltur"
        case .langrenn: return "Langrenn"
        case .alpint:   return "Alpint"
        case .klatring: return "Klatring"
        case .svømming: return "Svømming"
        }
    }

    var icon: String {
        switch self {
        case .rusling:  return "🚶"
        case .løping:   return "🏃"
        case .sykling:  return "🚴"
        case .fjelltur: return "🏔️"
        case .langrenn: return "⛷️"
        case .alpint:   return "🎿"
        case .klatring: return "🧗"
        case .svømming: return "🏊"
        }
    }

    var sfSymbol: String {
        switch self {
        case .rusling:  return "figure.walk"
        case .løping:   return "figure.run"
        case .sykling:  return "figure.outdoor.cycle"
        case .fjelltur: return "mountain.2"
        case .langrenn: return "figure.skiing.crosscountry"
        case .alpint:   return "figure.skiing.downhill"
        case .klatring: return "figure.climbing"
        case .svømming: return "figure.open.water.swim"
        }
    }
}

struct ActivityInput: Codable {
    let type: ActivityType
    let durationMinutes: Int
}

struct UserInput: Codable {
    let sensitivity: Int
}

// MARK: - Output types

struct WeatherData: Codable {
    let airTemp: Double
    let windSpeed: Double
    let humidity: Double
    let precipitation: String
    let precipitationProb: Double
    let cloudCover: Double
}

enum WarningLevel: String, Codable {
    case low, medium, high, critical

    var color: String {
        switch self {
        case .low:      return "blue"
        case .medium:   return "yellow"
        case .high:     return "orange"
        case .critical: return "red"
        }
    }

    var icon: String {
        switch self {
        case .low:      return "info.circle"
        case .medium:   return "exclamationmark.triangle"
        case .high:     return "exclamationmark.triangle.fill"
        case .critical: return "xmark.octagon.fill"
        }
    }
}

struct SafetyWarning: Codable, Identifiable {
    var id: String { message }
    let level: WarningLevel
    let message: String
    let recommendation: String
}

struct ZoneRecommendation: Codable {
    let required: Bool
    let item: String
    let reason: String?
}

struct LayerRecommendation: Codable {
    let required: Bool
    let item: String
    let material: String?
    let clo: Double?
}

struct UpperBody: Codable {
    let baseLayer: LayerRecommendation
    let midLayer: LayerRecommendation?
    let outerLayer: LayerRecommendation?
}

struct LowerBody: Codable {
    let baseLayer: LayerRecommendation?
    let outerLayer: LayerRecommendation
}

struct BodyZoneRecommendations: Codable {
    let head: ZoneRecommendation
    let neck: ZoneRecommendation
    let upperBody: UpperBody
    let lowerBody: LowerBody
    let hands: ZoneRecommendation
    let feet: LayerRecommendation
    let backpackExtras: [String]
}

struct RecommendationResult: Codable {
    let weather: WeatherData
    let apparentTemp: Double
    let effectiveTemp: Double
    let targetClo: Double
    let garments: BodyZoneRecommendations
    let notes: [String]
    let safetyWarnings: [SafetyWarning]
    let summary: String
}

// MARK: - API request

struct RecommendRequest: Encodable {
    let lat: Double
    let lon: Double
    let activity: ActivityInput
    let user: UserInput
}
