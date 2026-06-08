import SwiftUI

struct WatchActivityPickerView: View {
    @Binding var selectedActivity: ActivityType
    @Binding var durationMinutes: Int
    let onConfirm: () -> Void

    private let durations = [15, 30, 45, 60, 90, 120, 180, 240]

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Text("Aktivitet")
                    .font(.headline)
                    .padding(.top, 4)

                ForEach(ActivityType.allCases, id: \.self) { activity in
                    Button {
                        selectedActivity = activity
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: activity.sfSymbol)
                                .font(.body)
                                .foregroundStyle(.blue)
                                .frame(width: 20)
                            Text(activity.label)
                                .font(.body)
                            Spacer()
                            if selectedActivity == activity {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.blue)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    .buttonStyle(.plain)
                }

                Divider()

                Text("Varighet")
                    .font(.headline)

                Picker("Varighet", selection: $durationMinutes) {
                    ForEach(durations, id: \.self) { d in
                        Text(durationLabel(d)).tag(d)
                    }
                }
                .pickerStyle(.wheel)
                .frame(height: 80)

                Button("Kle deg!") {
                    onConfirm()
                }
                .buttonStyle(.borderedProminent)
                .tint(.blue)
                .padding(.top, 8)
            }
            .padding()
        }
        .navigationTitle("Kle deg")
    }

    private func durationLabel(_ minutes: Int) -> String {
        if minutes < 60 { return "\(minutes) min" }
        let hours = minutes / 60
        let rem = minutes % 60
        return rem == 0 ? "\(hours) t" : "\(hours)t \(rem)m"
    }
}
