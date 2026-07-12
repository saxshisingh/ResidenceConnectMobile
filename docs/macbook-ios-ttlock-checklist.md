# MacBook iOS + TTLock Checklist

Follow these steps in the same order.

## 1. Install required software on the MacBook

Install these first:

1. Xcode from the Mac App Store
2. Homebrew
3. Node.js 20 or newer
4. Ruby and Bundler
5. Watchman

Run these commands after installing Xcode:

```sh
xcode-select --install
sudo gem install bundler
brew install watchman
```

## 2. Copy the project to the MacBook

1. Copy the zip file to the MacBook.
2. Extract it.
3. Open Terminal.
4. Go to the project folder.

Example:

```sh
cd /path/to/MyGate
```

## 3. Install JavaScript dependencies

Run:

```sh
npm install
```

## 4. Install Ruby and CocoaPods dependencies

From the project root, run:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
```

If `pod install` fails, run:

```sh
cd ios
bundle exec pod repo update
bundle exec pod install
cd ..
```

## 5. Start the React Native app on iOS

Open terminal 1:

```sh
cd /path/to/MyGate
npm start
```

Open terminal 2:

```sh
cd /path/to/MyGate
npx react-native run-ios
```

## 6. If iOS build does not start from CLI

Open the Xcode workspace:

```sh
open ios/MyGate.xcworkspace
```

Then in Xcode:

1. Select the `MyGate` project
2. Open `Signing & Capabilities`
3. Select your Apple Developer Team
4. Choose an iPhone or simulator
5. Press Run

## 7. TTLock testing steps

Important:

- TTLock BLE should be tested on a real iPhone
- iOS Simulator is not reliable for TTLock Bluetooth features

For TTLock testing:

1. Connect a real iPhone to the MacBook
2. Open `ios/MyGate.xcworkspace` in Xcode
3. Select the iPhone as target device
4. Build and run from Xcode
5. Accept Bluetooth permission when the app asks
6. Keep the TTLock device nearby
7. Open the Smart Access / TTLock screen
8. Enable Bluetooth if needed
9. Scan for locks
10. Initialize the lock if it is in setting mode
11. Test unlock and lock actions

## 8. If TTLock does not work on iPhone

Check these one by one:

1. `react-native-ttlock` was installed by `npm install`
2. CocoaPods finished successfully
3. Bluetooth permission popup appeared and was allowed
4. You are testing on a real iPhone
5. The lock is awake and nearby
6. The lock is in setting mode if you are initializing it

## 9. Create iOS release build

Important:

- iOS does not create an APK
- iOS release output is an `.ipa`

To create the `.ipa`:

1. Open the workspace:

```sh
open ios/MyGate.xcworkspace
```

2. In Xcode:
   Select `Any iOS Device` or a real iPhone
3. Go to `Product > Archive`
4. Wait for archive to finish
5. In Organizer, click `Distribute App`
6. Choose the required export option
7. Export the `.ipa`

## 10. Exact command order summary

Run these commands in this order on the MacBook:

```sh
cd /path/to/MyGate
xcode-select --install
sudo gem install bundler
brew install watchman
npm install
bundle install
cd ios
bundle exec pod install
cd ..
npm start
```

Then in a new terminal:

```sh
cd /path/to/MyGate
npx react-native run-ios
```

If you want to open Xcode manually:

```sh
cd /path/to/MyGate
open ios/MyGate.xcworkspace
```

## 11. Final note

Most of the project should run after these steps.

TTLock on iOS is prepared in this repo, but the final proof happens only after:

1. `npm install`
2. `pod install`
3. Xcode build on macOS
4. Real iPhone BLE test

If any iOS or TTLock error appears on the MacBook, copy the full error and we can fix the remaining part quickly.
