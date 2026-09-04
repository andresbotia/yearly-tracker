#import <React/RCTBridgeModule.h>

// Expose Swift module to React Native
@interface RCT_EXTERN_MODULE(WidgetBridge, NSObject)

RCT_EXTERN_METHOD(setWidgetPayload:(NSString *)payloadJson)
RCT_EXTERN_METHOD(clearWidgetPayload)
RCT_EXTERN_METHOD(setWidgetArtwork:(NSString *)sourceUri artworkId:(NSString *)artworkId)
RCT_EXTERN_METHOD(clearWidgetArtwork)

@end
