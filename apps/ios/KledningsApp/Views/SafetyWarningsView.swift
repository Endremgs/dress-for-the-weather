import SwiftUI

struct SafetyWarningsView: View {
    let warnings: [SafetyWarning]

    var body: some View {
        VStack(spacing: 8) {
            ForEach(warnings) { warning in
                WarningCard(warning: warning)
            }
        }
    }
}

struct WarningCard: View {
    let warning: SafetyWarning

    var levelColor: Color {
        switch warning.level {
        case .critical: return .red
        case .high:     return .orange
        case .medium:   return .yellow
        case .low:      return .blue
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Image(systemName: warning.level.icon)
                    .foregroundStyle(levelColor)
                Text(warning.message)
                    .font(.subheadline.weight(.semibold))
            }
            Text(warning.recommendation)
                .font(.caption)
                .foregroundStyle(.secondary)
                .padding(.leading, 28)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(levelColor.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(levelColor.opacity(0.4), lineWidth: 1)
        )
    }
}
