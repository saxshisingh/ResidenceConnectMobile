# iOS and TTLock Setup

## What exists today

- Android already includes a custom native `TTLockModule`.
- iOS is now prepared to use TTLock through the `react-native-ttlock` package plus CocoaPods.
- The React Native Smart Access flow is wired to use Android native code on Android and TTLock package APIs on iOS.

## What must be installed on a MacBook

1. Install Xcode from the Mac App Store.
2. Open Xcode once and install the required components.
3. Install Xcode command line tools:

```sh
xcode-select --install
```

4. Install Homebrew if it is not already available.
5. Install Node.js 20 or newer.
6. Install Watchman:

```sh
brew install watchman
```

7. Install Ruby bundler dependencies from the project root:

```sh
bundle install
```

8. Install CocoaPods for the iOS project:

```sh
cd ios
bundle exec pod install
cd ..
```

9. If CocoaPods reports repository or dependency issues, run:

```sh
bundle exec pod repo update
bundle exec pod install
```

## How to run the project on MacBook

```sh
npm install
npm start
```

In a second terminal:

```sh
npx react-native run-ios
```

## Important iOS build note

- iOS does not produce an APK.
- Android output is an APK or AAB.
- iOS output is an `.ipa`, created from Xcode archive/distribution flows.

## TTLock work still required for iOS

To make TTLock work on iPhone, do all of the following on the MacBook after copying the repo:

1. Run `npm install`.
2. Run `cd ios && bundle exec pod install`.
3. Open `ios/MyGate.xcworkspace` in Xcode.
4. Let Xcode finish indexing and package resolution.
5. Build once on a real iPhone.
6. Confirm the `TTLock` pod and `react-native-ttlock` native module are linked successfully.

## Why a real iPhone is required

- TTLock is Bluetooth-based.
- The iOS Simulator does not provide real BLE hardware access for this use case.
- TTLock features should be tested on a physical iPhone, not only in the simulator.

## Suggested MacBook build flow for release

1. Open `ios/MyGate.xcworkspace` in Xcode after `pod install`.
2. Set your Apple Developer team in Signing & Capabilities.
3. Select a real iPhone or a generic iOS device.
4. Use `Product > Archive`.
5. Export/distribute the archive to generate the `.ipa`.

## Recommended first run sequence on MacBook

1. Copy or unzip the project on the MacBook.
2. In Terminal, go to the project root.
3. Run `npm install`.
4. Run `bundle install`.
5. Run `cd ios && bundle exec pod install && cd ..`.
6. Start Metro with `npm start`.
7. In another terminal, run `npx react-native run-ios`.
8. For TTLock BLE testing, switch from simulator to a real iPhone in Xcode.
