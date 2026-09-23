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


    // MARK: - Debug Alert Helper

    private func showDebugAlert(
        title: String,
        message: String
    ) {

        DispatchQueue.main.async {

            guard let window = self.window else {
                NSLog(
                    "[DEBUG ALERT] Window not available: %@ - %@",
                    title,
                    message
                )
                return
            }

            guard window.rootViewController != nil else {
                NSLog(
                    "[DEBUG ALERT] RootViewController not available: %@ - %@",
                    title,
                    message
                )
                return
            }

            let alert = UIAlertController(
                title: "FCM DEBUG - \(title)",
                message: message,
                preferredStyle: .alert
            )

            alert.addAction(
                UIAlertAction(
                    title: "OK",
                    style: .default
                )
            )

            var presenter = window.rootViewController

            while let presented = presenter?.presentedViewController {
                presenter = presented
            }

            presenter?.present(
                alert,
                animated: true
            )

            NSLog(
                "[DEBUG ALERT] %@ - %@",
                title,
                message
            )
        }
    }


    // MARK: - Application Launch

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        NSLog(
            "[APP] didFinishLaunching started"
        )


        // ============================================================
        // MARK: Firebase Initialization
        // ============================================================

        if let plistPath = Bundle.main.path(
            forResource: "GoogleService-Info",
            ofType: "plist"
        ) {

            NSLog(
                "[Firebase] GoogleService-Info.plist found at: %@",
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

                            Bundle:
                            com.residenceconnect.myapp

                            Project:
                            residenceconnect-b559d
                            """
                    )

                } else {

                    NSLog(
                        "[Firebase] Failed to create FirebaseOptions"
                    )

                    showDebugAlert(
                        title: "FIREBASE ERROR",
                        message:
                            """
                            FirebaseOptions could not be created from GoogleService-Info.plist.
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
                    GoogleService-Info.plist was NOT found inside the application bundle.

                    Expected:
                    GoogleService-Info.plist
                    """
            )
        }


        // ============================================================
        // MARK: Firebase Messaging Delegate
        // ============================================================

        Messaging.messaging().delegate = self

        NSLog(
            "[FCM] Messaging delegate configured"
        )

        showDebugAlert(
            title: "FCM DELEGATE",
            message:
                """
                Firebase Messaging delegate configured successfully.
                """
        )


        // ============================================================
        // MARK: Notification Center
        // ============================================================

        UNUserNotificationCenter.current().delegate = self

        NSLog(
            "[APNs] UNUserNotificationCenter delegate configured"
        )

        showDebugAlert(
            title: "NOTIFICATION CENTER",
            message:
                """
                UNUserNotificationCenter delegate configured.
                """
        )


        // ============================================================
        // MARK: Request Notification Permission
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
                        Notification permission request failed.

                        \(error.localizedDescription)
                        """
                )

                return
            }


            NSLog(
                "[APNs] Notification permission granted: %@",
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

                        Go to:

                        Settings
                        → Notifications
                        → ResidenceConnect
                        → Allow Notifications ON
                        """
                )
            }


            // Register for APNs on the main thread.

            DispatchQueue.main.async {

                NSLog(
                    "[APNs] Calling registerForRemoteNotifications()"
                )

                application.registerForRemoteNotifications()

                self.showDebugAlert(
                    title: "APNs REGISTRATION",
                    message:
                        """
                        iOS registration for remote notifications was requested.

                        Waiting for APNs device token...
                        """
                )
            }
        }


        // ============================================================
        // MARK: React Native
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
        // MARK: TTLock
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


    // ================================================================
    // MARK: APNs Registration SUCCESS
    // ================================================================

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


        // Explicitly associate the APNs token with Firebase Messaging.

        Messaging.messaging().apnsToken = deviceToken


        NSLog(
            "[APNs] APNs token assigned to Firebase Messaging"
        )


        showDebugAlert(
            title: "APNs SUCCESS",
            message:
                """
                APNs device token received successfully.

                Token length:
                \(apnsToken.count)

                APNs → Firebase mapping completed.
                """
        )


        // Ask Firebase for the current FCM token.

        Messaging.messaging().token { token, error in

            if let error = error {

                NSLog(
                    "[FCM] Token retrieval failed: %@",
                    error.localizedDescription
                )

                self.showDebugAlert(
                    title: "FCM TOKEN ERROR",
                    message:
                        """
                        APNs registration succeeded.

                        But Firebase could not retrieve the FCM token.

                        Error:
                        \(error.localizedDescription)
                        """
                )

                return
            }


            guard let token = token,
                  !token.isEmpty else {

                NSLog(
                    "[FCM] FCM token is nil or empty"
                )

                self.showDebugAlert(
                    title: "FCM TOKEN EMPTY",
                    message:
                        """
                        APNs registration succeeded.

                        Firebase returned an empty FCM token.
                        """
                )

                return
            }


            NSLog(
                "[FCM] Current FCM token received. Length: %ld",
                token.count
            )


            self.showDebugAlert(
                title: "FCM TOKEN SUCCESS",
                message:
                    """
                    FCM token generated successfully.

                    Token length:
                    \(token.count)

                    APNs token:
                    PRESENT

                    Firebase Messaging:
                    CONNECTED
                    """
            )
        }
    }


    // ================================================================
    // MARK: APNs Registration FAILURE
    // ================================================================

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError
            error: Error
    ) {

        NSLog(
            "[APNs] FAILED to register: %@",
            error.localizedDescription
        )


        showDebugAlert(
            title: "APNs ERROR",
            message:
                """
                iOS could NOT register this application with APNs.

                Error:
                \(error.localizedDescription)

                This means the problem is before FCM notification delivery.
                """
        )
    }


    // ================================================================
    // MARK: FCM Registration Token
    // ================================================================

    func messaging(
        _ messaging: Messaging,
        didReceiveRegistrationToken fcmToken: String?
    ) {

        guard let fcmToken = fcmToken,
              !fcmToken.isEmpty else {

            NSLog(
                "[FCM] Registration token callback returned NIL"
            )

            showDebugAlert(
                title: "FCM TOKEN ERROR",
                message:
                    """
                    Firebase Messaging callback was triggered,
                    but the FCM registration token is NIL.
                    """
            )

            return
        }


        NSLog(
            "[FCM] Registration token received. Length: %ld",
            fcmToken.count
        )


        showDebugAlert(
            title: "FCM TOKEN CALLBACK",
            message:
                """
                Firebase returned an FCM registration token.

                Token length:
                \(fcmToken.count)

                This confirms Firebase registration succeeded.
                """
        )
    }


    // ================================================================
    // MARK: FOREGROUND Notification
    // ================================================================

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler:
            @escaping (
                UNNotificationPresentationOptions
            ) -> Void
    ) {

        let userInfo =
            notification.request.content.userInfo


        let title =
            notification.request.content.title


        let body =
            notification.request.content.body


        NSLog(
            "[APNs] Notification received in FOREGROUND"
        )


        NSLog(
            "[APNs] Notification title: %@",
            title
        )


        NSLog(
            "[APNs] Notification body: %@",
            body
        )


        // Tell Firebase that a message was received.

        Messaging.messaging().appDidReceiveMessage(
            userInfo
        )


        showDebugAlert(
            title: "NOTIFICATION RECEIVED",
            message:
                """
                APNs/FCM notification reached the application.

                Title:
                \(title)

                Body:
                \(body)

                If you see this alert, APNs delivery is working.
                """
        )


        // Show the actual iOS notification banner.

        completionHandler([
            .banner,
            .sound,
            .badge,
            .list
        ])
    }


    // ================================================================
    // MARK: Notification TAP
    // ================================================================

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler:
            @escaping () -> Void
    ) {

        let notification =
            response.notification


        let title =
            notification.request.content.title


        let body =
            notification.request.content.body


        let userInfo =
            notification.request.content.userInfo


        NSLog(
            "[APNs] Notification tapped"
        )


        NSLog(
            "[APNs] Notification title: %@",
            title
        )


        NSLog(
            "[APNs] Notification body: %@",
            body
        )


        Messaging.messaging().appDidReceiveMessage(
            userInfo
        )


        showDebugAlert(
            title: "NOTIFICATION TAPPED",
            message:
                """
                The user tapped an iOS notification.

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
// MARK: React Native Delegate
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