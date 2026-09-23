import UIKit
import UserNotifications

import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

import TTLock

import FirebaseCore
import FirebaseMessaging


@main
class AppDelegate:
    UIResponder,
    UIApplicationDelegate,
    UNUserNotificationCenterDelegate,
    MessagingDelegate {

    var window: UIWindow?
    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?


    // =========================================================
    // APP LAUNCH
    // =========================================================

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        NSLog("[APP] didFinishLaunching started")


        // =====================================================
        // FIREBASE CONFIGURATION
        // =====================================================

        if let plistPath = Bundle.main.path(
            forResource: "GoogleService-Info",
            ofType: "plist"
        ) {

            NSLog(
                "[Firebase] Found plist at %@",
                plistPath
            )

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


        // =====================================================
        // PUSH NOTIFICATION DELEGATES
        // =====================================================

        UNUserNotificationCenter
            .current()
            .delegate = self

        Messaging
            .messaging()
            .delegate = self

        NSLog(
            "[FCM] Notification center delegate configured"
        )

        NSLog(
            "[FCM] Firebase Messaging delegate configured"
        )


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

        NSLog(
            "[APP] React Native started"
        )


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


    // =========================================================
    // APNs SUCCESS
    // =========================================================

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


        // IMPORTANT:
        // Connect Apple's APNs token to Firebase Messaging.

        Messaging
            .messaging()
            .apnsToken = deviceToken

        NSLog(
            "[FCM] APNs token assigned to Firebase Messaging"
        )
    }


    // =========================================================
    // APNs FAILURE
    // =========================================================

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


    // =========================================================
    // FCM TOKEN CALLBACK
    // =========================================================

    func messaging(
        _ messaging: Messaging,
        didReceiveRegistrationToken fcmToken: String?
    ) {

        guard let fcmToken = fcmToken,
              !fcmToken.isEmpty
        else {

            NSLog(
                "[FCM] FCM registration token is NIL"
            )

            return
        }

        NSLog(
            "[FCM] FCM registration token received: %@",
            fcmToken
        )
    }


    // =========================================================
    // FOREGROUND NOTIFICATION
    // =========================================================

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


    // =========================================================
    // NOTIFICATION TAP
    // =========================================================

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


// =============================================================
// REACT NATIVE DELEGATE
// =============================================================

class ReactNativeDelegate:
    RCTDefaultReactNativeFactoryDelegate {

    override func sourceURL(
        for bridge: RCTBridge
    ) -> URL? {

        return bundleURL()
    }


    override func bundleURL() -> URL? {

#if DEBUG

        return RCTBundleURLProvider
            .sharedSettings()
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