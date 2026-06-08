import SwiftUI

struct WatchOverrideView: View {
    @Binding var tempOverride: Double
    let onApply: () -> Void
    let onReset: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                Text("Temperatur")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 12) {
                    Button {
                        tempOverride = max(-20, tempOverride - 1)
                    } label: {
                        Image(systemName: "minus.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.blue)
                    }
                    .buttonStyle(.plain)

                    Text("\(tempOverride, specifier: "%.0f")°")
                        .font(.title.weight(.bold).monospacedDigit())
                        .frame(minWidth: 56)

                    Button {
                        tempOverride = min(40, tempOverride + 1)
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.blue)
                    }
                    .buttonStyle(.plain)
                }

                Button("Beregn") {
                    onApply()
                }
                .buttonStyle(.borderedProminent)
                .tint(.blue)
                .font(.caption.weight(.semibold))

                Button("Tilbakestill") {
                    onReset()
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }
            .padding()
        }
        .navigationTitle("Juster temp")
    }
}
