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

    // MARK: - Debug Alert

    private func showDebugAlert(
        title: String,
        message: String
    ) {
        // DispatchQueue.main.async {
        //     guard let window = self.window,
        //           let rootViewController = window.rootViewController else {
        //         NSLog(
        //             "[DEBUG ALERT] %@ - %@",
        //             title,
        //             message
        //         )
        //         return
        //     }

        //     var presenter = rootViewController

        //     while let presented = presenter.presentedViewController {
        //         presenter = presented
        //     }

        //     let alert = UIAlertController(
        //         title: "FCM DEBUG - \(title)",
        //         message: message,
        //         preferredStyle: .alert
        //     )

        //     alert.addAction(
        //         UIAlertAction(
        //             title: "OK",
        //             style: .default
        //         )
        //     )

        //     presenter.present(
        //         alert,
        //         animated: true
        //     )
        // }
    }

    // MARK: - Application Launch

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        NSLog("[APP] didFinishLaunching started")

        // ============================================================
        // Firebase
        // ============================================================

        if let plistPath = Bundle.main.path(
            forResource: "GoogleService-Info",
            ofType: "plist"
        ) {

            NSLog(
                "[Firebase] GoogleService-Info.plist found: %@",
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

                    showDebugAlert(
                        title: "FIREBASE OK",
                        message:
                            """
                            Firebase initialized successfully.

                            Bundle ID:
                            com.residenceconnect.myapp

                            Project:
                            residenceconnect-b559d
                            """
                    )

                } else {

                    NSLog(
                        "[Firebase] Could not create FirebaseOptions"
                    )

                    showDebugAlert(
                        title: "FIREBASE ERROR",
                        message:
                            """
                            FirebaseOptions could not be created.

                            Check GoogleService-Info.plist.
                            """
                    )
                }

            } else {

                NSLog(
                    "[Firebase] Firebase already configured"
                )

                showDebugAlert(
                    title: "FIREBASE OK",
                    message:
                        """
                        Firebase was already configured.
                        """
                )
            }

        } else {

            NSLog(
                "[Firebase] GoogleService-Info.plist NOT FOUND"
            )

            showDebugAlert(
                title: "FIREBASE ERROR",
                message:
                    """
                    GoogleService-Info.plist was NOT found
                    inside the application bundle.
                    """
            )
        }

        // ============================================================
        // Notification Center
        // ============================================================

        UNUserNotificationCenter.current().delegate = self

        NSLog(
            "[APNs] Notification center delegate configured"
        )

        showDebugAlert(
            title: "NOTIFICATION CENTER",
            message:
                """
                UNUserNotificationCenter delegate configured successfully.
                """
        )

        // ============================================================
        // Notification Permission
        // ============================================================

        let authorizationOptions:
            UNAuthorizationOptions = [
                .alert,
                .badge,
                .sound
            ]

        UNUserNotificationCenter.current().requestAuthorization(
            options: authorizationOptions
        ) { granted, error in

            if let error = error {

                NSLog(
                    "[APNs] Permission error: %@",
                    error.localizedDescription
                )

                self.showDebugAlert(
                    title: "PERMISSION ERROR",
                    message:
                        """
                        Notification permission failed.

                        Error:
                        \(error.localizedDescription)
                        """
                )

                return
            }

            NSLog(
                "[APNs] Permission granted: %@",
                granted ? "YES" : "NO"
            )

            if granted {

                self.showDebugAlert(
                    title: "PERMISSION SUCCESS",
                    message:
                        """
                        Notification permission is GRANTED.

                        Alert: ON
                        Sound: ON
                        Badge: ON
                        """
                )

            } else {

                self.showDebugAlert(
                    title: "PERMISSION DENIED",
                    message:
                        """
                        Notification permission is DENIED.

                        Check:

                        Settings
                        → Notifications
                        → ResidenceConnect
                        → Allow Notifications
                        """
                )
            }

            // ========================================================
            // Register with APNs
            // ========================================================

            DispatchQueue.main.async {

                NSLog(
                    "[APNs] Calling registerForRemoteNotifications()"
                )

                application.registerForRemoteNotifications()

                self.showDebugAlert(
                    title: "APNs REGISTRATION",
                    message:
                        """
                        APNs registration requested.

                        Waiting for the Apple device token...
                        """
                )
            }
        }

        // ============================================================
        // React Native
        // ============================================================

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

        // ============================================================
        // TTLock
        // ============================================================

        TTLock.setupBluetooth { state in

            NSLog(
                "[TTLock] Bluetooth state changed: %ld",
                state.rawValue
            )
        }

        NSLog(
            "[APP] didFinishLaunching completed"
        )

        return true
    }

    // MARK: - APNs Registration Success

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

        showDebugAlert(
            title: "APNs SUCCESS",
            message:
                """
                Apple APNs device token received.

                Token length:
                \(apnsToken.count)

                APNs registration is working.

                RNFirebase Messaging should now associate
                this APNs token with FCM.
                """
        )
    }

    // MARK: - APNs Registration Failure

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError
            error: Error
    ) {

        NSLog(
            "[APNs] Registration FAILED: %@",
            error.localizedDescription
        )

        showDebugAlert(
            title: "APNs ERROR",
            message:
                """
                iOS failed to register with APNs.

                Error:
                \(error.localizedDescription)
                """
        )
    }

    // MARK: - Foreground Notification

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler:
            @escaping (
                UNNotificationPresentationOptions
            ) -> Void
    ) {

        let title =
            notification.request.content.title

        let body =
            notification.request.content.body

        NSLog(
            "[APNs] Notification received in foreground"
        )

        NSLog(
            "[APNs] Title: %@",
            title
        )

        NSLog(
            "[APNs] Body: %@",
            body
        )

        showDebugAlert(
            title: "NOTIFICATION RECEIVED",
            message:
                """
                APNs notification reached the application.

                Title:
                \(title)

                Body:
                \(body)

                APNs delivery is working.
                """
        )

        completionHandler([
            .banner,
            .sound,
            .badge,
            .list
        ])
    }

    // MARK: - Notification Tap

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler:
            @escaping () -> Void
    ) {

        let title =
            response.notification.request.content.title

        let body =
            response.notification.request.content.body

        NSLog(
            "[APNs] Notification tapped"
        )

        showDebugAlert(
            title: "NOTIFICATION TAPPED",
            message:
                """
                Notification was delivered and tapped.

                Title:
                \(title)

                Body:
                \(body)
                """
        )

        completionHandler()
    }
}


// ====================================================================
// React Native Delegate
// ====================================================================

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