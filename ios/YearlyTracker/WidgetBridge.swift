import Foundation

@objc(WidgetBridge)
class WidgetBridge: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(setWidgetPayload:)
  func setWidgetPayload(_ payloadJson: NSString) {
    SharedStore.savePayloadJSON(payloadJson as String)
  }

  @objc
  func clearWidgetPayload() {
    SharedStore.clearPayload()
  }

  @objc(setWidgetArtwork:artworkId:)
  func setWidgetArtwork(_ sourceUri: NSString, artworkId: NSString) {
    SharedStore.writeArtwork(from: sourceUri as String, artworkId: artworkId as String)
  }

  @objc
  func clearWidgetArtwork() {
    SharedStore.clearArtwork()
  }
}
