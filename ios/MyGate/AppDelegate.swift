import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import TTLock

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

    // -----------------------------------------
    // TTLock
    // -----------------------------------------

    TTLock.setupBluetooth { state in
      NSLog(
        "[TTLock] Bluetooth state changed: %ld",
        state.rawValue
      )
    }

    // -----------------------------------------
    // React Native
    // -----------------------------------------

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