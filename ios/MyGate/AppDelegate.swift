import UIKit
import UserNotifications

import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

import TTLock

import FirebaseCore

@main
class AppDelegate:
    UIResponder,
    UIApplicationDelegate,
    UNUserNotificationCenterDelegate {

    var window: UIWindow?
    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        NSLog("[APP] didFinishLaunching started")

        // MARK: Firebase

        if let plistPath = Bundle.main.path(
            forResource: "GoogleService-Info",
            ofType: "plist"
        ) {

            NSLog("[Firebase] Found plist at %@", plistPath)

            if FirebaseApp.app() == nil {

                if let options = FirebaseOptions(
                    contentsOfFile: plistPath
                ) {

                    FirebaseApp.configure(
                        options: options
                    )

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

        // MARK: Notifications

        UNUserNotificationCenter.current().delegate = self

        NSLog(
            "[APNs] Notification center delegate configured"
        )

        // IMPORTANT:
        // Do NOT directly import FirebaseMessaging here.
        // @react-native-firebase/messaging handles FCM registration.

        // MARK: React Native

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

        NSLog(
            "[APP] React Native started"
        )

        // MARK: TTLock

        TTLock.setupBluetooth { state in

            NSLog(
                "[TTLock] Bluetooth state changed: %ld",
                state.rawValue
            )
        }

        return true
    }

    // MARK: APNs registration

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken
            deviceToken: Data
    ) {

        let apnsToken = deviceToken
            .map {
                String(
                    format: "%02.2hhx",
                    $0
                )
            }
            .joined()

        NSLog(
            "[APNs] Device token received: %@",
            apnsToken
        )

        // Do not manually assign the token to
        // FirebaseMessaging here.
        //
        // RNFirebase Messaging handles the APNs/FCM
        // registration through its native module.
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError
            error: Error
    ) {

        NSLog(
            "[APNs] FAILED to register: %@",
            error.localizedDescription
        )
    }

    // MARK: Foreground notification

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler:
            @escaping (
                UNNotificationPresentationOptions
            ) -> Void
    ) {

        NSLog(
            "[APNs] Notification received in foreground"
        )

        completionHandler([
            .banner,
            .sound,
            .badge
        ])
    }

    // MARK: Notification tap

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler:
            @escaping () -> Void
    ) {

        NSLog(
            "[APNs] Notification tapped"
        )

        completionHandler()
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