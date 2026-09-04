import ExpoModulesCore

public class WidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Function("setWidgetPayload") { (payloadJson: String) in
      SharedStore.savePayloadJSON(payloadJson)
    }

    Function("clearWidgetPayload") {
      SharedStore.clearPayload()
    }

    AsyncFunction("setWidgetArtwork") { (sourceUri: String, artworkId: String) in
      SharedStore.writeArtwork(from: sourceUri, artworkId: artworkId)
      return true
    }

    AsyncFunction("clearWidgetArtwork") {
      SharedStore.clearArtwork()
      return true
    }
  }
}
