import SwiftUI

struct ActivityPickerView: View {
    @Binding var selected: ActivityType
    @Binding var duration: Int
    @Binding var sensitivity: Int

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 10), count: 4)
    private let durations = [15, 30, 45, 60, 90, 120, 180, 240, 360, 480]

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Activity grid
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "Aktivitet", systemImage: "figure.walk")
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(ActivityType.allCases, id: \.self) { activity in
                        ActivityCell(activity: activity, isSelected: selected == activity)
                            .onTapGesture { selected = activity }
                    }
                }
            }

            Divider()

            // Duration picker
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "Varighet", systemImage: "clock")
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(durations, id: \.self) { d in
                            DurationChip(minutes: d, isSelected: duration == d)
                                .onTapGesture { duration = d }
                        }
                    }
                    .padding(.horizontal, 2)
                }
            }

            Divider()

            // Sensitivity slider
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "Kulde-sensitivitet", systemImage: "thermometer.medium")
                VStack(spacing: 6) {
                    Slider(value: Binding(
                        get: { Double(sensitivity) },
                        set: { sensitivity = Int($0.rounded()) }
                    ), in: -2...2, step: 1)
                    .tint(.blue)
                    HStack {
                        Text("Fryser lett")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text(sensitivityLabel)
                            .font(.caption.weight(.medium))
                            .foregroundStyle(sensitivityColor)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(sensitivityColor.opacity(0.12), in: Capsule())
                        Spacer()
                        Text("Tåler kulde")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.07), radius: 10, y: 3)
    }

    private var sensitivityLabel: String {
        switch sensitivity {
        case ..<0: return "\(sensitivity)°C"
        case 1...: return "+\(sensitivity)°C"
        default:   return "Normal"
        }
    }

    private var sensitivityColor: Color {
        switch sensitivity {
        case ..<0: return .blue
        case 1...: return .orange
        default:   return .secondary
        }
    }
}

struct SectionHeader: View {
    let title: String
    let systemImage: String

    var body: some View {
        Label(title, systemImage: systemImage)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.primary)
    }
}

struct ActivityCell: View {
    let activity: ActivityType
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: activity.sfSymbol)
                .font(.system(size: 22, weight: .medium))
                .foregroundStyle(isSelected ? .white : .blue)
                .frame(height: 26)
            Text(activity.label)
                .font(.system(size: 10, weight: .semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .foregroundStyle(isSelected ? .white : .primary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(
            isSelected
                ? AnyShapeStyle(LinearGradient(colors: [.blue, .indigo], startPoint: .top, endPoint: .bottom))
                : AnyShapeStyle(Color(.systemGray6)),
            in: RoundedRectangle(cornerRadius: 14)
        )
        .shadow(color: isSelected ? .blue.opacity(0.35) : .clear, radius: 6, y: 3)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}

struct DurationChip: View {
    let minutes: Int
    let isSelected: Bool

    var label: String {
        if minutes < 60 { return "\(minutes) min" }
        let hours = minutes / 60
        let rem = minutes % 60
        return rem == 0 ? "\(hours)t" : "\(hours)t\(rem)m"
    }

    var body: some View {
        Text(label)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 16)
            .padding(.vertical, 9)
            .background(
                isSelected
                    ? AnyShapeStyle(LinearGradient(colors: [.blue, .indigo], startPoint: .leading, endPoint: .trailing))
                    : AnyShapeStyle(Color(.systemGray6)),
                in: Capsule()
            )
            .foregroundStyle(isSelected ? .white : .primary)
            .shadow(color: isSelected ? .blue.opacity(0.3) : .clear, radius: 4, y: 2)
            .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}
