import Foundation

@objc(WidgetBridge)
class WidgetBridge: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(setWidgetPayload:)
  func setWidgetPayload(_ payloadJson: NSString) {
    guard let data = (payloadJson as String).data(using: .utf8) else { return }
    guard let payload = try? JSONDecoder().decode(SharedStore.WidgetPayload.self, from: data) else { return }
    SharedStore.savePayload(payload)
  }

  @objc
  func clearWidgetPayload() {
    SharedStore.clearPayload()
  }
}
