#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CoreLocation/CoreLocation.h>

@interface RNLocationManager : RCTEventEmitter <RCTBridgeModule, CLLocationManagerDelegate>

@end
