import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import TTLock
import FirebaseCore
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions:
      [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    NSLog("[APP] Application starting")

    // =====================================================
    // FIREBASE
    // =====================================================

    if FirebaseApp.app() == nil {

      FirebaseApp.configure()

      NSLog("[Firebase] Firebase configured successfully")

    } else {

      NSLog("[Firebase] Firebase already configured")

    }

    // =====================================================
    // APNs
    // =====================================================

    UNUserNotificationCenter.current().delegate = self

    application.registerForRemoteNotifications()

    NSLog("[FCM] Registered for remote notifications")

    // =====================================================
    // REACT NATIVE
    // =====================================================

    let delegate = ReactNativeDelegate()

    let factory = RCTReactNativeFactory(
      delegate: delegate
    )

    delegate.dependencyProvider =
      RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(
      frame: UIScreen.main.bounds
    )

    factory.startReactNative(
      withModuleName: "ResidenceConnect",
      in: window,
      launchOptions: launchOptions
    )

    NSLog("[APP] React Native started")

    // =====================================================
    // TTLOCK
    // =====================================================

    TTLock.setupBluetooth { state in

      NSLog(
        "[TTLock] Bluetooth state changed: %ld",
        state.rawValue
      )

    }

    return true
  }


  // =======================================================
  // APNs SUCCESS
  // =======================================================

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken
      deviceToken: Data
  ) {

    let token = deviceToken
      .map {
        String(format: "%02.2hhx", $0)
      }
      .joined()

    NSLog(
      "[FCM] APNs device token: %@",
      token
    )
  }


  // =======================================================
  // APNs FAILURE
  // =======================================================

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError
      error: Error
  ) {

    NSLog(
      "[FCM] APNs registration failed: %@",
      error.localizedDescription
    )
  }
}


// =========================================================
// NOTIFICATION CENTER
// =========================================================

extension AppDelegate: UNUserNotificationCenterDelegate {

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler:
      @escaping (UNNotificationPresentationOptions) -> Void
  ) {

    let userInfo =
      notification.request.content.userInfo

    NSLog(
      "[FCM] Foreground notification: %@",
      "\(userInfo)"
    )

    completionHandler([
      .banner,
      .sound,
      .badge
    ])
  }


  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler:
      @escaping () -> Void
  ) {

    let userInfo =
      response.notification.request.content.userInfo

    NSLog(
      "[FCM] Notification tapped: %@",
      "\(userInfo)"
    )

    completionHandler()
  }
}


// =========================================================
// REACT NATIVE DELEGATE
// =========================================================

class ReactNativeDelegate:
  RCTDefaultReactNativeFactoryDelegate {

  override func sourceURL(
    for bridge: RCTBridge
  ) -> URL? {

    return bundleURL()
  }

  override func bundleURL() -> URL? {

#if DEBUG

    return RCTBundleURLProvider.sharedSettings()
      .jsBundleURL(
        forBundleRoot: "index"
      )

#else

    return Bundle.main.url(
      forResource: "main",
      withExtension: "jsbundle"
    )

#endif
  }
}