import SwiftUI

@MainActor
final class ContentViewModel: ObservableObject {
    @Published var selectedActivity: ActivityType = .rusling
    @Published var durationMinutes: Int = 60
    @Published var sensitivity: Int = 0
    @Published var result: RecommendationResult?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let locationService = LocationService.shared

    func onAppear() {
        locationService.requestLocation()
        observeLocation()
    }

    private func observeLocation() {
        Task {
            for await location in locationService.$location.values {
                guard let loc = location else { continue }
                await fetchRecommendation(lat: loc.coordinate.latitude, lon: loc.coordinate.longitude)
                break
            }
        }
    }

    func fetchRecommendation(lat: Double, lon: Double) async {
        isLoading = true
        errorMessage = nil
        do {
            result = try await APIService.shared.fetchRecommendation(
                lat: lat, lon: lon,
                activity: selectedActivity,
                durationMinutes: durationMinutes,
                sensitivity: sensitivity
            )
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func activityChanged() {
        guard let loc = locationService.location else { return }
        Task {
            await fetchRecommendation(
                lat: loc.coordinate.latitude,
                lon: loc.coordinate.longitude
            )
        }
    }
}

struct ContentView: View {
    @EnvironmentObject private var locationService: LocationService
    @StateObject private var vm = ContentViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    ActivityPickerView(
                        selected: $vm.selectedActivity,
                        duration: $vm.durationMinutes,
                        sensitivity: $vm.sensitivity
                    )
                    .onChange(of: vm.selectedActivity) { _, _ in vm.activityChanged() }
                    .onChange(of: vm.durationMinutes) { _, _ in vm.activityChanged() }
                    .onChange(of: vm.sensitivity) { _, _ in vm.activityChanged() }

                    if vm.isLoading {
                        LoadingView(activity: vm.selectedActivity)
                    } else if let error = vm.errorMessage {
                        ErrorView(message: error) { vm.activityChanged() }
                    } else if let result = vm.result {
                        WeatherHeaderView(result: result, locationName: locationService.locationName)
                            .transition(.opacity.combined(with: .scale(scale: 0.97)))
                        if !result.safetyWarnings.isEmpty {
                            SafetyWarningsView(warnings: result.safetyWarnings)
                                .transition(.opacity)
                        }
                        OutfitView(result: result)
                            .transition(.opacity)
                    }
                }
                .padding()
                .animation(.easeInOut(duration: 0.25), value: vm.isLoading)
                .animation(.easeInOut(duration: 0.25), value: vm.result == nil)
            }
            .navigationTitle("Kle deg riktig")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear { vm.onAppear() }
    }
}

struct LoadingView: View {
    let activity: ActivityType

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
                .tint(.blue)
            VStack(spacing: 4) {
                Text("Henter vær og beregner...")
                    .font(.subheadline.weight(.medium))
                Text(activity.label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity)
        .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 20))
    }
}

struct ErrorView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(.orange.opacity(0.12))
                    .frame(width: 64, height: 64)
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title)
                    .foregroundStyle(.orange)
            }
            VStack(spacing: 6) {
                Text("Noe gikk galt")
                    .font(.headline)
                Text(message)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            Button(action: retry) {
                Label("Prøv igjen", systemImage: "arrow.clockwise")
                    .font(.subheadline.weight(.semibold))
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.regular)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(.background, in: RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(.orange.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: .orange.opacity(0.1), radius: 10, y: 4)
    }
}
