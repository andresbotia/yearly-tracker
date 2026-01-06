import ExpoModulesCore

public class WidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Function("setWidgetPayload") { (payloadJson: String) in
      guard let data = payloadJson.data(using: .utf8) else { return }
      guard let payload = try? JSONDecoder().decode(SharedStore.WidgetPayload.self, from: data) else { return }
      SharedStore.savePayload(payload)
    }

    Function("clearWidgetPayload") {
      SharedStore.clearPayload()
    }
  }
}
