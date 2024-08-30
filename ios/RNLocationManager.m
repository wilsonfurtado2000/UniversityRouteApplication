// RNLocationManager.m
#import "RNLocationManager.h"
#import <CoreLocation/CoreLocation.h>
#import <React/RCTLog.h>
#import <React/RCTEventEmitter.h>
#import <CoreMotion/CoreMotion.h>

@interface RNLocationManager () <CLLocationManagerDelegate>
@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong, nonatomic) CMMotionManager *motionManager;
@end

@implementation RNLocationManager

RCT_EXPORT_MODULE();


- (NSArray<NSString *> *)supportedEvents {
    return @[@"LocationUpdated"];
}



- (instancetype)init {
    if (self
     = [super init]) {
        self.locationManager = [[CLLocationManager alloc] init];
        self.locationManager.delegate = self;
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
        self.locationManager.distanceFilter = 10; 
        [self.locationManager requestWhenInUseAuthorization];

        self.motionManager = [[CMMotionManager alloc] init];
        self.motionManager.accelerometerUpdateInterval = 10.0;
        [self setupMotionManager];

        RCTLogInfo(@"RNLocationManager initialized");
    }
    return self;
}

- (void)setupMotionManager {
    [self.motionManager startAccelerometerUpdatesToQueue:[NSOperationQueue mainQueue]
                                             withHandler:^(CMAccelerometerData * _Nullable accelerometerData, NSError * _Nullable error) {
        if (error) {
            RCTLogInfo(@"Accelerometer error: %@",
             error.localizedDescription);
        } else if (accelerometerData) {
            double x = accelerometerData.acceleration.x;
            double y = accelerometerData.acceleration.y;
            double z = accelerometerData.acceleration.z;
            double vectorSum = sqrt(x*x + y*y + z*z);

            RCTLogInfo(@"Accelerometer update: x=%f, y=%f, z=%f, vectorSum=%f", x, y, z, vectorSum);

            if (vectorSum > 1.0) {
                RCTLogInfo(@"Significant movement detected, updating 2location.");
                [self.locationManager startUpdatingLocation];
            }
        }
    }];
}

RCT_EXPORT_METHOD(startUpdatingLocation) {
    [self.locationManager startUpdatingLocation];
    [self sendCurrentLocation];
    RCTLogInfo(@"Started location updates.");
}

RCT_EXPORT_METHOD(stopUpdatingLocation) {
    [self.locationManager stopUpdatingLocation];
    [self.motionManager stopAccelerometerUpdates];
    RCTLogInfo(@"Stopped location and accelerometer updates.");
}

- (void)sendCurrentLocation {
    CLLocation *currentLocation = self.locationManager.location;
    if (currentLocation) {
        RCTLogInfo(@"Sending current location: Latitude=%f, Longitude=%f", currentLocation.coordinate.latitude, currentLocation.coordinate.longitude);
        [self sendEventWithName:@"LocationUpdated" body:@{@"latitude": @(currentLocation.coordinate.latitude), @"longitude": @(currentLocation.coordinate.longitude)}];
    } else {
        RCTLogInfo(@"Current location is not available.");
    }
}


- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
    CLLocation *location = [locations lastObject];
    RCTLogInfo(@"Location updated: Latitude=%f, Longitude=%f", location.coordinate.latitude, location.coordinate.longitude);
    [self sendEventWithName:@"LocationUpdated" body:@{@"latitude": @(location.coordinate.latitude), @"longitude": @(location.coordinate.longitude)}];
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    RCTLogInfo(@"Failed to find user's location: %@", error.localizedDescription);
}
- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    RCTLogInfo(@"Location authorization status changed to %d", status);
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        RCTLogInfo(@"Location authorization denied or restricted.");
    } else if (status == kCLAuthorizationStatusAuthorizedWhenInUse || status == kCLAuthorizationStatusAuthorizedAlways) {
        [self.locationManager startUpdatingLocation];
    }
}
@end
