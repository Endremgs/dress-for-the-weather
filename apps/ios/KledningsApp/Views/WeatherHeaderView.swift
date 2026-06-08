import SwiftUI

struct WeatherHeaderView: View {
    let result: RecommendationResult
    let locationName: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    if let name = locationName {
                        Label(name, systemImage: "location.fill")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.85))
                    }
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(result.weather.airTemp, specifier: "%.0f")")
                            .font(.system(size: 72, weight: .bold, design: .rounded))
                        Text("°")
                            .font(.system(size: 42, weight: .light, design: .rounded))
                            .offset(y: -6)
                    }
                    .foregroundStyle(.white)
                    Text("Føles som \(result.apparentTemp, specifier: "%.1f")°C")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.75))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 8) {
                    Image(systemName: conditionIcon)
                        .font(.system(size: 48))
                        .foregroundStyle(.white.opacity(0.9))
                        .symbolRenderingMode(.hierarchical)
                    Text(conditionLabel)
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(.white.opacity(0.2), in: Capsule())
                        .foregroundStyle(.white)
                }
            }

            Divider().overlay(.white.opacity(0.25))

            HStack(spacing: 0) {
                WeatherStatCell(
                    icon: "wind",
                    value: String(format: "%.1f m/s", result.weather.windSpeed),
                    label: "Vind"
                )
                Spacer()
                WeatherStatCell(
                    icon: "humidity.fill",
                    value: String(format: "%.0f%%", result.weather.humidity),
                    label: "Fukt"
                )
                Spacer()
                WeatherStatCell(
                    icon: "thermometer.medium",
                    value: "\(result.effectiveTemp, specifier: "%.1f")°",
                    label: "Effektiv"
                )
                Spacer()
                WeatherStatCell(
                    icon: "tshirt.fill",
                    value: "\(result.targetClo, specifier: "%.2f")",
                    label: "CLO"
                )
            }
        }
        .foregroundStyle(.white)
        .padding(20)
        .background(backgroundGradient, in: RoundedRectangle(cornerRadius: 24))
        .shadow(color: gradientTop.opacity(0.45), radius: 18, y: 8)
    }

    private var conditionIcon: String {
        switch result.weather.precipitation {
        case "none":
            if result.weather.airTemp < 0 { return "snowflake" }
            return result.weather.airTemp < 12 ? "cloud.sun.fill" : "sun.max.fill"
        case "light":    return "cloud.drizzle.fill"
        case "moderate": return "cloud.rain.fill"
        default:         return "cloud.heavyrain.fill"
        }
    }

    private var conditionLabel: String {
        switch result.weather.precipitation {
        case "none":
            return result.weather.airTemp < 0 ? "Frost" : "Klarvær"
        case "light":    return "Lett nedbør"
        case "moderate": return "Moderat nedbør"
        default:         return "Kraftig nedbør"
        }
    }

    private var gradientTop: Color {
        switch result.weather.precipitation {
        case "none":
            return result.weather.airTemp < 0
                ? Color(red: 0.25, green: 0.4, blue: 0.75)
                : Color(red: 0.15, green: 0.45, blue: 0.85)
        case "light":    return Color(red: 0.3, green: 0.35, blue: 0.75)
        case "moderate": return Color(red: 0.2, green: 0.25, blue: 0.65)
        default:         return Color(red: 0.15, green: 0.2, blue: 0.55)
        }
    }

    private var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [gradientTop, gradientTop.opacity(0.65)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

struct WeatherStatCell: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.65))
            Text(value)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.55))
        }
    }
}
