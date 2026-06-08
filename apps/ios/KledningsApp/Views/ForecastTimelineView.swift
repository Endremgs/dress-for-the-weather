import SwiftUI

struct ForecastTimelineView: View {
    let weather: WeatherData
    let forecastWindow: [ForecastEntryData]
    let durationMinutes: Int

    private var allTemps: [Double] {
        [weather.airTemp] + forecastWindow.map(\.airTemp)
    }
    private var minTemp: Double { allTemps.min() ?? 0 }
    private var maxTemp: Double { allTemps.max() ?? 0 }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Vær under turen")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 4)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    TimelineCell(
                        label: "Nå",
                        icon: conditionIcon(precipitation: weather.precipitation, cloudCover: weather.cloudCover),
                        temp: weather.airTemp,
                        precipProb: weather.precipitationProb,
                        windSpeed: weather.windSpeed,
                        isNow: true,
                        minTemp: minTemp,
                        maxTemp: maxTemp
                    )
                    ForEach(forecastWindow.prefix(hoursNeeded), id: \.time) { entry in
                        TimelineCell(
                            label: formatTime(entry.time),
                            icon: conditionIcon(precipitation: entry.precipitation, cloudCover: entry.cloudCover),
                            temp: entry.airTemp,
                            precipProb: entry.precipitationProb,
                            windSpeed: entry.windSpeed,
                            isNow: false,
                            minTemp: minTemp,
                            maxTemp: maxTemp
                        )
                    }
                }
                .padding(.horizontal, 4)
            }

            Text("% = nedbørssannsynlighet · m/s = vind")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .padding(.horizontal, 4)
        }
        .padding(16)
        .background(.background, in: RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color(.systemGray5), lineWidth: 1)
        )
    }

    private var hoursNeeded: Int {
        Int((Double(durationMinutes) / 60.0).rounded(.up))
    }

    private func formatTime(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var date = formatter.date(from: isoString)
        if date == nil {
            formatter.formatOptions = .withInternetDateTime
            date = formatter.date(from: isoString)
        }
        guard let d = date else { return isoString }
        let out = DateFormatter()
        out.dateFormat = "HH:mm"
        return out.string(from: d)
    }

    private func conditionIcon(precipitation: String, cloudCover: Double) -> String {
        switch precipitation {
        case "heavy":    return "cloud.heavyrain.fill"
        case "moderate": return "cloud.rain.fill"
        case "light":    return "cloud.drizzle.fill"
        default:
            if cloudCover < 25  { return "sun.max.fill" }
            if cloudCover < 60  { return "cloud.sun.fill" }
            if cloudCover < 85  { return "cloud.fill" }
            return "smoke.fill"
        }
    }
}

private struct TimelineCell: View {
    let label: String
    let icon: String
    let temp: Double
    let precipProb: Double
    let windSpeed: Double
    let isNow: Bool
    let minTemp: Double
    let maxTemp: Double

    private var tempFraction: Double {
        let range = maxTemp - minTemp
        guard range > 0 else { return 0.5 }
        return (temp - minTemp) / range
    }

    private var tempColor: Color {
        if temp <= -10 { return Color(red: 0.6, green: 0.2, blue: 0.9) }
        if temp <= 0   { return .blue }
        if temp <= 10  { return .cyan }
        if temp <= 20  { return .green }
        return .orange
    }

    var body: some View {
        VStack(spacing: 5) {
            Text(label)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)

            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.blue)
                .symbolRenderingMode(.hierarchical)
                .frame(width: 28, height: 28)

            Text("\(temp, specifier: "%.0f")°")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(tempColor)
                .monospacedDigit()

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color(.systemGray5))
                        .frame(height: 4)
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.blue.opacity(0.6))
                        .frame(width: max(4, geo.size.width * tempFraction), height: 4)
                }
            }
            .frame(width: 44, height: 4)

            if precipProb > 5 {
                Text("\(precipProb, specifier: "%.0f")%")
                    .font(.caption2)
                    .foregroundStyle(.blue)
                    .monospacedDigit()
            } else {
                Spacer().frame(height: 14)
            }

            Text("\(windSpeed, specifier: "%.0f")m/s")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .monospacedDigit()
        }
        .frame(width: 56)
        .padding(.vertical, 10)
        .padding(.horizontal, 4)
        .background(
            isNow
                ? Color.blue.opacity(0.08)
                : Color(.systemGray6).opacity(0.6),
            in: RoundedRectangle(cornerRadius: 12)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isNow ? Color.blue.opacity(0.3) : Color.clear, lineWidth: 1)
        )
    }
}
