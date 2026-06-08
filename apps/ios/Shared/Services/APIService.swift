import Foundation

enum APIError: LocalizedError {
    case badURL
    case network(Error)
    case badResponse(Int)
    case decoding(Error)

    var errorDescription: String? {
        switch self {
        case .badURL:            return "Ugyldig URL"
        case .network(let e):   return "Nettverksfeil: \(e.localizedDescription)"
        case .badResponse(let s): return "Server svarte med \(s)"
        case .decoding(let e):  return "Parsing-feil: \(e.localizedDescription)"
        }
    }
}

actor APIService {
    static let shared = APIService()

    // Change to your Vercel URL in production
    private let baseURL = "http://localhost:3000"

    func fetchRecommendation(
        lat: Double,
        lon: Double,
        activity: ActivityType,
        durationMinutes: Int,
        sensitivity: Int = 0
    ) async throws -> RecommendationResult {
        guard let url = URL(string: "\(baseURL)/api/recommend") else {
            throw APIError.badURL
        }

        let body = RecommendRequest(
            lat: lat,
            lon: lon,
            activity: ActivityInput(type: activity, durationMinutes: durationMinutes),
            user: UserInput(sensitivity: sensitivity)
        )

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)
        request.timeoutInterval = 15

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.network(error)
        }

        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badResponse(http.statusCode)
        }

        do {
            return try JSONDecoder().decode(RecommendationResult.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }
}
