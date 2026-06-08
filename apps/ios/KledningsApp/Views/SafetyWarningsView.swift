import SwiftUI

struct SafetyWarningsView: View {
    let warnings: [SafetyWarning]

    var body: some View {
        VStack(spacing: 10) {
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
        case .medium:   return Color(red: 0.85, green: 0.65, blue: 0.0)
        case .low:      return .blue
        }
    }

    var body: some View {
        HStack(spacing: 0) {
            // Left accent bar
            Rectangle()
                .fill(levelColor)
                .frame(width: 4)
                .clipShape(
                    UnevenRoundedRectangle(
                        topLeadingRadius: 12,
                        bottomLeadingRadius: 12,
                        bottomTrailingRadius: 0,
                        topTrailingRadius: 0
                    )
                )

            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 8) {
                    Image(systemName: warning.level.icon)
                        .foregroundStyle(levelColor)
                        .font(.subheadline.weight(.semibold))
                    Text(warning.message)
                        .font(.subheadline.weight(.semibold))
                }
                Text(warning.recommendation)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.leading, 24)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(levelColor.opacity(0.07), in: RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(levelColor.opacity(0.25), lineWidth: 1)
        )
        .shadow(color: levelColor.opacity(0.15), radius: 6, y: 2)
    }
}
