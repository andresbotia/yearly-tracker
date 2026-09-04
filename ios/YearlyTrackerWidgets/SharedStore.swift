import Foundation
import UIKit
#if canImport(WidgetKit)
import WidgetKit
#endif

enum SharedStore {
    // MUST match your App Group id (exactly)
    static let appGroupId = "group.com.andresbotia.ResolutionTracker.shared"

    static let widgetPayloadKey = "yt_widget_payload_v1"
    static let artworkFilename = "atelier-widget-background.jpg"
    static let artworkIdKey = "yt_widget_artwork_id_v1"
    static let maxArtworkDimension: CGFloat = 900

    static var defaults: UserDefaults? {
        UserDefaults(suiteName: appGroupId)
    }

    static var containerURL: URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId)
    }

    static var artworkFileURL: URL? {
        containerURL?.appendingPathComponent(artworkFilename)
    }

    // What the widget reads / the app writes
    struct WidgetPayload: Codable {
        let yearlyProgress: Double   // 0...1
        let goals: [Goal]
        let habits: [Habit]
        let theme: String?
        let themePrimary: String?
        let themeBg: String?
        let themeText: String?
        let themeKind: String?
        let year: Int?
        let artworkId: String?
        let hasArtwork: Bool?
        let widgetArtworkFilename: String?

        struct Goal: Codable {
            let id: String
            let title: String
            let percent: Double // 0...1
        }

        struct Habit: Codable {
            let id: String
            let title: String
            let todayState: Int // 0 off, 1 good, 2 bad
        }

        enum CodingKeys: String, CodingKey {
            case yearlyProgress, goals, habits, theme
            case themePrimary, themeBg, themeText, themeKind
            case year, artworkId, hasArtwork, widgetArtworkFilename
        }

        init(from decoder: Decoder) throws {
            let c = try decoder.container(keyedBy: CodingKeys.self)
            yearlyProgress = try c.decode(Double.self, forKey: .yearlyProgress)
            goals = try c.decode([Goal].self, forKey: .goals)
            habits = try c.decode([Habit].self, forKey: .habits)
            theme = try? c.decode(String.self, forKey: .theme)
            themePrimary = try? c.decode(String.self, forKey: .themePrimary)
            themeBg = try? c.decode(String.self, forKey: .themeBg)
            themeText = try? c.decode(String.self, forKey: .themeText)
            themeKind = try? c.decode(String.self, forKey: .themeKind)
            if let i = try? c.decode(Int.self, forKey: .year) {
                year = i
            } else if let d = try? c.decode(Double.self, forKey: .year) {
                year = Int(d)
            } else {
                year = nil
            }
            artworkId = try? c.decode(String.self, forKey: .artworkId)
            if let b = try? c.decode(Bool.self, forKey: .hasArtwork) {
                hasArtwork = b
            } else if let i = try? c.decode(Int.self, forKey: .hasArtwork) {
                hasArtwork = i != 0
            } else {
                hasArtwork = nil
            }
            widgetArtworkFilename = try? c.decode(String.self, forKey: .widgetArtworkFilename)
        }
    }

    // Widget side
    static func loadPayload() -> WidgetPayload? {
        guard let data = defaults?.data(forKey: widgetPayloadKey) else { return nil }
        return try? JSONDecoder().decode(WidgetPayload.self, from: data)
    }

    static func saveRawPayload(_ data: Data) {
        defaults?.set(data, forKey: widgetPayloadKey)
        reloadTimelines()
    }

    static func savePayloadJSON(_ json: String) {
        guard let data = json.data(using: .utf8) else { return }
        saveRawPayload(data)
    }

    // App side (legacy struct path — prefer savePayloadJSON so additive fields survive)
    static func savePayload(_ payload: WidgetPayload) {
        guard let data = try? JSONEncoder().encode(payload) else { return }
        saveRawPayload(data)
    }

    static func clearPayload() {
        defaults?.removeObject(forKey: widgetPayloadKey)
        reloadTimelines()
    }

    static func loadRawData() -> Data? {
        defaults?.data(forKey: widgetPayloadKey)
    }

    static func currentArtworkId() -> String? {
        defaults?.string(forKey: artworkIdKey)
    }

    static func writeArtwork(from sourceURI: String, artworkId: String) {
        let id = artworkId.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !id.isEmpty else { return }
        if let existing = currentArtworkId(),
           existing == id,
           let url = artworkFileURL,
           FileManager.default.fileExists(atPath: url.path) {
            return
        }
        guard let image = loadSourceImage(from: sourceURI) else {
            clearArtwork()
            return
        }
        guard let url = artworkFileURL else { return }
        let resized = resize(image, maxDimension: maxArtworkDimension)
        guard let data = resized.jpegData(compressionQuality: 0.82) else { return }
        try? data.write(to: url, options: .atomic)
        defaults?.set(id, forKey: artworkIdKey)
    }

    static func clearArtwork() {
        if let url = artworkFileURL {
            try? FileManager.default.removeItem(at: url)
        }
        defaults?.removeObject(forKey: artworkIdKey)
    }

    static func loadArtworkImage() -> UIImage? {
        guard let url = artworkFileURL,
              FileManager.default.fileExists(atPath: url.path) else { return nil }
        return UIImage(contentsOfFile: url.path)
    }

    static func widgetBackgroundImage(for payload: WidgetPayload?) -> UIImage? {
        guard payload?.hasArtwork == true else { return nil }
        return loadArtworkImage()
    }

    private static func loadSourceImage(from uri: String) -> UIImage? {
        let trimmed = uri.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        if trimmed.hasPrefix("file://"), let url = URL(string: trimmed) {
            return UIImage(contentsOfFile: url.path)
        }
        if trimmed.hasPrefix("/"), !trimmed.hasPrefix("//") {
            return UIImage(contentsOfFile: trimmed)
        }
        if let url = URL(string: trimmed), let data = try? Data(contentsOf: url) {
            return UIImage(data: data)
        }
        return UIImage(contentsOfFile: trimmed)
    }

    private static func resize(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let width = image.size.width
        let height = image.size.height
        let longest = max(width, height)
        guard longest > maxDimension, longest > 0 else { return image }
        let scale = maxDimension / longest
        let size = CGSize(width: width * scale, height: height * scale)
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: size, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }

    static func reloadTimelines() {
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        #endif
    }
}
