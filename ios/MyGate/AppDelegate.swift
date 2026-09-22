import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import TTLock
import FirebaseCore

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

    NSLog("[APP] didFinishLaunching started")

    // =====================================================
    // Firebase
    // =====================================================

    if let plistPath = Bundle.main.path(
      forResource: "GoogleService-Info",
      ofType: "plist"
    ) {

      NSLog("[Firebase] Found plist at %@", plistPath)

      if FirebaseApp.app() == nil {

        if let options = FirebaseOptions(
          contentsOfFile: plistPath
        ) {

          FirebaseApp.configure(options: options)

          NSLog(
            "[Firebase] Firebase configured successfully"
          )

        } else {

          NSLog(
            "[Firebase] Failed to create FirebaseOptions"
          )

        }

      } else {

        NSLog(
          "[Firebase] Firebase already configured"
        )

      }

    } else {

      NSLog(
        "[Firebase] GoogleService-Info.plist NOT FOUND IN APP BUNDLE"
      )

    }

    // =====================================================
    // React Native
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
    // TTLock
    // =====================================================

    TTLock.setupBluetooth { state in

      NSLog(
        "[TTLock] Bluetooth state changed: %ld",
        state.rawValue
      )

    }

    return true
  }
}

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