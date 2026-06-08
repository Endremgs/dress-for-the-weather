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
                        HStack {
                            Text(activity.icon)
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
                        Text(d < 60 ? "\(d) min" : "\(d / 60) t")
                            .tag(d)
                    }
                }
                .pickerStyle(.wheel)
                .frame(height: 80)

                Button("Kle deg!") {
                    onConfirm()
                }
                .buttonStyle(.borderedProminent)
                .padding(.top, 8)
            }
            .padding()
        }
        .navigationTitle("Kle deg")
    }
}
