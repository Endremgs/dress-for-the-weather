import SwiftUI

struct WeatherHeaderView: View {
    let result: RecommendationResult
    let locationName: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let name = locationName {
                Text(name)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
            }

            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(result.weather.airTemp, specifier: "%.1f")°")
                        .font(.system(size: 56, weight: .bold, design: .rounded))
                    Text("Føles som \(result.apparentTemp, specifier: "%.1f")°C")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.8))
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 6) {
                    WeatherStatRow(icon: precipIcon, text: precipLabel)
                    WeatherStatRow(icon: "wind", text: "\(result.weather.windSpeed, specifier: "%.1f") m/s")
                    WeatherStatRow(icon: "humidity", text: "\(result.weather.humidity, specifier: "%.0f")%")
                }
            }

            Divider().overlay(.white.opacity(0.4))

            HStack {
                VStack(alignment: .leading) {
                    Text("Effektiv komforttemp")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.7))
                    Text("\(result.effectiveTemp, specifier: "%.1f")°C")
                        .font(.subheadline.weight(.semibold))
                }
                Spacer()
                VStack(alignment: .trailing) {
                    Text("Isolasjonsmål")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.7))
                    Text("\(result.targetClo, specifier: "%.2f") CLO")
                        .font(.subheadline.weight(.semibold))
                }
            }
        }
        .foregroundStyle(.white)
        .padding()
        .background(
            LinearGradient(colors: [.blue, .indigo], startPoint: .topLeading, endPoint: .bottomTrailing),
            in: RoundedRectangle(cornerRadius: 20)
        )
        .shadow(color: .blue.opacity(0.3), radius: 12, y: 4)
    }

    private var precipIcon: String {
        switch result.weather.precipitation {
        case "none":     return "sun.max"
        case "light":    return "cloud.drizzle"
        case "moderate": return "cloud.rain"
        default:         return "cloud.heavyrain"
        }
    }

    private var precipLabel: String {
        switch result.weather.precipitation {
        case "none":     return "Ingen nedbør"
        case "light":    return "Lett nedbør"
        case "moderate": return "Moderat nedbør"
        default:         return "Kraftig nedbør"
        }
    }
}

struct WeatherStatRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))
            Text(text)
                .font(.caption)
        }
    }
}
