import SwiftUI

struct ActivityPickerView: View {
    @Binding var selected: ActivityType
    @Binding var duration: Int
    @Binding var sensitivity: Int

    private let columns = Array(repeating: GridItem(.flexible()), count: 4)
    private let durations = [15, 30, 45, 60, 90, 120, 180, 240, 360, 480]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Activity grid
            VStack(alignment: .leading, spacing: 8) {
                Label("Aktivitet", systemImage: "figure.walk")
                    .font(.headline)
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(ActivityType.allCases, id: \.self) { activity in
                        ActivityCell(activity: activity, isSelected: selected == activity)
                            .onTapGesture { selected = activity }
                    }
                }
            }

            // Duration picker
            VStack(alignment: .leading, spacing: 8) {
                Label("Varighet", systemImage: "clock")
                    .font(.headline)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(durations, id: \.self) { d in
                            DurationChip(minutes: d, isSelected: duration == d)
                                .onTapGesture { duration = d }
                        }
                    }
                    .padding(.horizontal, 1)
                }
            }

            // Sensitivity slider
            VStack(alignment: .leading, spacing: 8) {
                Label("Kulde-sensitivitet", systemImage: "thermometer.medium")
                    .font(.headline)
                HStack {
                    Text("Fryser lett").font(.caption).foregroundStyle(.secondary)
                    Slider(value: Binding(
                        get: { Double(sensitivity) },
                        set: { sensitivity = Int($0.rounded()) }
                    ), in: -2...2, step: 1)
                    .accentColor(.blue)
                    Text("Tåler kulde").font(.caption).foregroundStyle(.secondary)
                }
                Text(sensitivityLabel)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.06), radius: 8, y: 2)
    }

    private var sensitivityLabel: String {
        switch sensitivity {
        case ..<0: return "\(sensitivity)°C (kuldesensitiv)"
        case 1...: return "+\(sensitivity)°C (varmetolerant)"
        default:   return "Normal"
        }
    }
}

struct ActivityCell: View {
    let activity: ActivityType
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 4) {
            Text(activity.icon)
                .font(.title2)
            Text(activity.label)
                .font(.system(size: 10, weight: .medium))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(isSelected ? Color.blue.opacity(0.15) : Color(.systemGray6), in: RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
        )
    }
}

struct DurationChip: View {
    let minutes: Int
    let isSelected: Bool

    var label: String {
        minutes < 60 ? "\(minutes) min" : "\(minutes / 60) t"
    }

    var body: some View {
        Text(label)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? Color.blue : Color(.systemGray6), in: Capsule())
            .foregroundStyle(isSelected ? .white : .primary)
    }
}
