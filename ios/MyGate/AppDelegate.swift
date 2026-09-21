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

    // --------------------------------------------------
    // Firebase
    // --------------------------------------------------

    if FirebaseApp.app() == nil {
      FirebaseApp.configure()

      NSLog(
        "[FCM] Firebase configured successfully."
      )
    } else {
      NSLog(
        "[FCM] Firebase was already configured."
      )
    }

    // --------------------------------------------------
    // iOS notification delegate
    // --------------------------------------------------

    UNUserNotificationCenter.current().delegate = self

    // --------------------------------------------------
    // Register application for APNs
    // --------------------------------------------------

    application.registerForRemoteNotifications()

    NSLog(
      "[FCM] Registered application for remote notifications."
    )

    // --------------------------------------------------
    // TTLock
    // --------------------------------------------------

    TTLock.setupBluetooth { state in
      NSLog(
        "[TTLock] Bluetooth state changed: %ld",
        state.rawValue
      )
    }

    // --------------------------------------------------
    // React Native
    // --------------------------------------------------

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

    return true
  }

  // --------------------------------------------------
  // APNs registration success
  // --------------------------------------------------

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken
      deviceToken: Data
  ) {

    NSLog(
      "[FCM] APNs registration succeeded."
    )

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

  // --------------------------------------------------
  // APNs registration failure
  // --------------------------------------------------

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

// ======================================================
// MARK: - UNUserNotificationCenterDelegate
// ======================================================

extension AppDelegate: UNUserNotificationCenterDelegate {

  // --------------------------------------------------
  // Foreground notification
  // --------------------------------------------------

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler:
      @escaping (UNNotificationPresentationOptions) -> Void
  ) {

    let userInfo =
      notification.request.content.userInfo

    NSLog(
      "[FCM] Notification received while app is in foreground."
    )

    NSLog(
      "[FCM] Notification userInfo: %@",
      "\(userInfo)"
    )

    // Show banner, sound and badge while app is
    // in the foreground.
    completionHandler([
      .banner,
      .sound,
      .badge
    ])
  }

  // --------------------------------------------------
  // User tapped notification
  // --------------------------------------------------

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler:
      @escaping () -> Void
  ) {

    let userInfo =
      response.notification.request.content.userInfo

    NSLog(
      "[FCM] User tapped notification."
    )

    NSLog(
      "[FCM] Notification userInfo: %@",
      "\(userInfo)"
    )

    completionHandler()
  }
}

// ======================================================
// MARK: - React Native Delegate
// ======================================================

class ReactNativeDelegate:
  RCTDefaultReactNativeFactoryDelegate {

  override func sourceURL(
    for bridge: RCTBridge
  ) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {

#if DEBUG

    RCTBundleURLProvider.sharedSettings()
      .jsBundleURL(
        forBundleRoot: "index"
      )

#else

    Bundle.main.url(
      forResource: "main",
      withExtension: "jsbundle"
    )

#endif
  }
}