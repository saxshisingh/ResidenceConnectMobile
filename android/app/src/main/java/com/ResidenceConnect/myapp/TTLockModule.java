package com.ResidenceConnect.myapp;

import android.app.Activity;
import android.content.Intent;
import android.location.LocationManager;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.ttlock.bl.sdk.api.ExtendedBluetoothDevice;
import com.ttlock.bl.sdk.api.TTLockClient;
import com.ttlock.bl.sdk.callback.ControlLockCallback;
import com.ttlock.bl.sdk.callback.CreateCustomPasscodeCallback;
import com.ttlock.bl.sdk.callback.GetLockMuteModeStateCallback;
import com.ttlock.bl.sdk.callback.GetBatteryLevelCallback;
import com.ttlock.bl.sdk.callback.GetLockTimeCallback;
import com.ttlock.bl.sdk.callback.InitLockCallback;
import com.ttlock.bl.sdk.callback.ResetLockCallback;
import com.ttlock.bl.sdk.callback.ScanLockCallback;
import com.ttlock.bl.sdk.callback.SetAutoLockingPeriodCallback;
import com.ttlock.bl.sdk.callback.SetLockMuteModeCallback;
import com.ttlock.bl.sdk.callback.SetLockTimeCallback;
import com.ttlock.bl.sdk.callback.AddICCardCallback;
import com.ttlock.bl.sdk.callback.AddFingerprintCallback;
import com.ttlock.bl.sdk.constant.ControlAction;
import com.ttlock.bl.sdk.entity.ControlLockResult;
import com.ttlock.bl.sdk.entity.LockError;

import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.LinkedHashMap;
import java.util.Map;

public class TTLockModule extends ReactContextBaseJavaModule {

    private static final String TAG = "TTLockModule";
    private static final long SCAN_DURATION_MS = 15000L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Map<String, ExtendedBluetoothDevice> scannedDevices = new LinkedHashMap<>();
    private boolean scanInProgress = false;
    private Runnable scanTimeoutRunnable;

    /*
     * ====================================================================
     * TTLock SDK BLE service lifecycle — READ THIS
     * ====================================================================
     *
     * prepareBTService() MUST be called exactly ONCE per app process.
     * It is called in MainApplication.onCreate() before React Native boots.
     *
     * DO NOT call prepareBTService() here — not in the constructor, not in
     * controlLock(), not anywhere. Re-initializing the SDK tears down its
     * internal BluetoothAdapter and puts the service into a "not-ready"
     * state. The next controlLock() then fails with the misleading error
     * "bluetooth is disable" even though the OS Bluetooth is ON.
     *
     * Similarly, stopBTService() must NEVER be called from this module.
     * ====================================================================
     */

    public TTLockModule(ReactApplicationContext reactContext) {
        super(reactContext);
        // Do NOT call prepareBTService() here. MainApplication owns it.
        logAdapterState("module constructor");
    }

    @NonNull
    @Override
    public String getName() {
        return "TTLockModule";
    }

    // ====================================================================
    // Diagnostics
    // ====================================================================

    /**
     * Logs the TTLock SDK's internal BluetoothAdapter state.
     *
     * If this prints NULL, the SDK is uninitialized — either
     * MainApplication.prepareBTService() never ran, or something called
     * stopBTService(). The SDK will then report "bluetooth is disable"
     * on every controlLock, regardless of the OS Bluetooth toggle.
     */
        /**
     * Logs Bluetooth state from BOTH sources:
     *   - OS-level BluetoothAdapter (via BluetoothManager)
     *   - TTLock SDK's public isBLEEnabled() API
     *
     * If OS says enabled=true but TTLock says enabled=false, the SDK's
     * internal service is uninitialized — prepareBTService() didn't run,
     * or stopBTService() was called somewhere.
     */
    private void logAdapterState(String stage) {
        try {
            android.bluetooth.BluetoothManager btManager =
                    (android.bluetooth.BluetoothManager)
                            getReactApplicationContext()
                                    .getSystemService(android.content.Context.BLUETOOTH_SERVICE);
            android.bluetooth.BluetoothAdapter osAdapter =
                    btManager != null ? btManager.getAdapter() : null;
            boolean osEnabled = osAdapter != null && osAdapter.isEnabled();

            boolean sdkEnabled = false;
            try {
                sdkEnabled = TTLockClient.getDefault()
                        .isBLEEnabled(getReactApplicationContext());
            } catch (Throwable t) {
                Log.e(TAG, "TTLock isBLEEnabled() threw", t);
            }

            Log.i(TAG, "BT state [" + stage + "]  "
                    + "osAdapter=" + (osAdapter == null ? "NULL" : "present") + "  "
                    + "osEnabled=" + osEnabled + "  "
                    + "sdkEnabled=" + sdkEnabled);

            if (osEnabled && !sdkEnabled) {
                Log.e(TAG, "BT state [" + stage + "] MISMATCH: OS Bluetooth is ON "
                        + "but TTLock SDK reports disabled. The SDK's internal "
                        + "service is uninitialized. Check for a stopBTService() "
                        + "call elsewhere in the app.");
            }
        } catch (Throwable t) {
            Log.e(TAG, "BT state [" + stage + "] check failed", t);
        }
    }

    /**
     * Exposed to JS for diagnostics. Call from JS to confirm the SDK
     * is alive before triggering a control operation.
     */
    @ReactMethod
    public void checkAdapterState(Promise promise) {
        try {
            android.bluetooth.BluetoothManager btManager =
                    (android.bluetooth.BluetoothManager)
                            getReactApplicationContext()
                                    .getSystemService(android.content.Context.BLUETOOTH_SERVICE);
            android.bluetooth.BluetoothAdapter osAdapter =
                    btManager != null ? btManager.getAdapter() : null;

            boolean osEnabled = osAdapter != null && osAdapter.isEnabled();
            boolean sdkEnabled = TTLockClient.getDefault()
                    .isBLEEnabled(getReactApplicationContext());

            WritableMap map = Arguments.createMap();
            map.putBoolean("osAdapterPresent", osAdapter != null);
            map.putBoolean("osBluetoothEnabled", osEnabled);
            map.putBoolean("sdkBluetoothEnabled", sdkEnabled);
            map.putBoolean("healthy", osEnabled && sdkEnabled);
            promise.resolve(map);
        } catch (Throwable t) {
            promise.reject("ADAPTER_CHECK_FAILED", t);
        }
    }

    // ====================================================================
    // Bluetooth enable helpers
    // ====================================================================

    @ReactMethod
    public void isBluetoothEnabled(Promise promise) {
        promise.resolve(
                TTLockClient.getDefault().isBLEEnabled(getReactApplicationContext())
        );
    }

    @ReactMethod
    public void requestBluetoothEnable(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is not available.");
            return;
        }
        TTLockClient.getDefault().requestBleEnable(activity);
        promise.resolve(true);
    }

    @ReactMethod
    public void isLocationEnabled(Promise promise) {
        try {
            LocationManager locationManager = (LocationManager)
                    getReactApplicationContext().getSystemService(ReactApplicationContext.LOCATION_SERVICE);
            boolean enabled;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                enabled = locationManager != null && locationManager.isLocationEnabled();
            } else {
                enabled = locationManager != null && (
                        locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
                                || locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER));
            }
            promise.resolve(enabled);
        } catch (Exception error) {
            promise.reject("LOCATION_CHECK_FAILED", "Unable to check Location services.", error);
        }
    }

    @ReactMethod
    public void openLocationSettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
        } catch (Exception error) {
            promise.reject("LOCATION_SETTINGS_FAILED", "Unable to open Location settings.", error);
        }
    }

    // ====================================================================
    // Scanning
    // ====================================================================

    @ReactMethod
    public void scanLocks(Promise promise) {
        if (scanInProgress) {
            promise.reject("SCAN_IN_PROGRESS", "A TTLock scan is already in progress.");
            return;
        }

        logAdapterState("before scanLocks");

        Log.i(TAG, "Starting TTLock BLE scan for " + SCAN_DURATION_MS + "ms");

        TTLockClient.getDefault().stopScanLock();
        scannedDevices.clear();
        scanInProgress = true;

        scanTimeoutRunnable = () -> finishScan(promise);
        handler.postDelayed(scanTimeoutRunnable, SCAN_DURATION_MS);

        try {
            TTLockClient.getDefault().startScanLock(new ScanLockCallback() {
            @Override
            public void onScanLockSuccess(ExtendedBluetoothDevice device) {
                if (device == null || device.getAddress() == null) return;
                Log.d(TAG, "Scanned lock mac=" + device.getAddress()
                        + ", name=" + device.getName()
                        + ", isSettingMode=" + device.isSettingMode());
                scannedDevices.put(device.getAddress(), device);
            }

            @Override
            public void onFail(LockError error) {
                Log.e(TAG, "TTLock BLE scan failed: "
                        + (error != null ? error.getDescription() : "unknown error"));
                cancelScanTimeout();
                scanInProgress = false;
                TTLockClient.getDefault().stopScanLock();
                promise.reject("SCAN_FAILED",
                        error != null ? error.getDescription() : "Scan failed.");
            }
            });
        } catch (Throwable error) {
            cancelScanTimeout();
            scanInProgress = false;
            TTLockClient.getDefault().stopScanLock();
            Log.e(TAG, "Unable to start TTLock BLE scan", error);
            promise.reject("SCAN_START_FAILED", "Unable to start TTLock BLE scan.", error);
        }
    }

    @ReactMethod
    public void stopScan(Promise promise) {
        cancelScanTimeout();
        scanInProgress = false;
        TTLockClient.getDefault().stopScanLock();
        promise.resolve(true);
    }

    // ====================================================================
    // Lock init
    // ====================================================================

    @ReactMethod
    public void initLock(String macAddress, Promise promise) {
        ExtendedBluetoothDevice device = scannedDevices.get(macAddress);
        if (device == null) {
            promise.reject("DEVICE_NOT_FOUND",
                    "Lock device not found in scan cache. Please scan again with the lock nearby.");
            return;
        }

        logAdapterState("before initLock");

        TTLockClient.getDefault().initLock(device, new InitLockCallback() {
            @Override
            public void onInitLockSuccess(String lockData) {
                Log.d(TAG, "initLock success mac=" + device.getAddress()
                        + ", name=" + device.getName()
                        + ", lockDataLength=" + (lockData != null ? lockData.length() : 0));
                WritableMap map = Arguments.createMap();
                map.putString("name", device.getName());
                map.putString("mac", device.getAddress());
                map.putString("lockData", lockData);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("INIT_LOCK_FAILED",
                        error != null ? error.getDescription() : "Lock initialization failed.");
            }
        });
    }

    // ====================================================================
    // Control lock — THE CRITICAL FIX
    // ====================================================================

    @ReactMethod
    public void controlLock(String lockData, String macAddress, String action, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to control the lock over BLE.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to control the lock over BLE.");
            return;
        }

        final int controlAction;
        if ("unlock".equalsIgnoreCase(action)) {
            controlAction = ControlAction.UNLOCK;
        } else if ("lock".equalsIgnoreCase(action)) {
            controlAction = ControlAction.LOCK;
        } else {
            promise.reject("INVALID_ACTION", "Unsupported action. Use lock or unlock.");
            return;
        }

        /*
         * CRITICAL FIX:
         * The original code called prepareBTService() here, immediately
         * before controlLock(). That re-initializes the SDK's internal
         * BluetoothAdapter, which puts the service into a "not-ready"
         * state and causes controlLock() to fail with the misleading
         * error "bluetooth is disable".
         *
         * prepareBTService() is now called exactly once in
         * MainApplication.onCreate(). Do NOT call it here.
         */
        logAdapterState("before controlLock");

        Log.d(TAG, "controlLock action=" + action
                + ", mac=" + macAddress
                + ", lockDataLength=" + lockData.length());

        boolean sdkBleEnabled = false;

        try {
            sdkBleEnabled =
                    TTLockClient.getDefault().isBLEEnabled(getReactApplicationContext());

            Log.e(
                    TAG,
                    "[TTLOCK][CONTROL] SDK BLE state immediately before controlLock = "
                            + sdkBleEnabled
            );
        } catch (Throwable t) {
            Log.e(
                    TAG,
                    "[TTLOCK][CONTROL] isBLEEnabled() failed",
                    t
            );
        }

        Log.e(
                TAG,
                "[TTLOCK][CONTROL] Starting controlLock: "
                        + "sdkBleEnabled=" + sdkBleEnabled
                        + ", mac=" + macAddress
                        + ", lockDataLength=" + lockData.length()
        );

        TTLockClient.getDefault().controlLock(
                controlAction,
                lockData,
                macAddress,
                new ControlLockCallback() {
                    @Override
                    public void onControlLockSuccess(ControlLockResult controlLockResult) {
                        Log.d(TAG, "controlLock success action=" + action
                                + ", mac=" + macAddress
                                + ", result=" + String.valueOf(controlLockResult));
                        WritableMap map = Arguments.createMap();
                        map.putString("action", action.toLowerCase());
                        if (controlLockResult != null) {
                            map.putInt("controlAction", controlLockResult.getControlAction());
                            map.putInt("battery", controlLockResult.getBattery());
                            map.putDouble("lockTime", (double) controlLockResult.getLockTime());
                            map.putInt("uniqueId", controlLockResult.getUniqueid());
                        }
                        promise.resolve(map);
                    }

                    @Override
                    public void onFail(LockError error) {
                        Log.e(TAG, "controlLock failed action=" + action
                                + ", mac=" + macAddress
                                + ", error=" + String.valueOf(error)
                                + ", description=" + (error != null ? error.getDescription() : "null"));
                        promise.reject("CONTROL_LOCK_FAILED",
                                error != null ? error.getDescription() : "BLE lock control failed.");
                    }
                }
        );
    }

    // ====================================================================
    // Lock time
    // ====================================================================

    @ReactMethod
    public void getLockTime(String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to read the lock time.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to read the lock time.");
            return;
        }

        logAdapterState("before getLockTime");
        Log.d(TAG, "getLockTime mac=" + macAddress + ", lockDataLength=" + lockData.length());

        TTLockClient.getDefault().getLockTime(lockData, macAddress, new GetLockTimeCallback() {
            @Override
            public void onGetLockTimeSuccess(long lockTimestamp) {
                Log.d(TAG, "getLockTime success mac=" + macAddress + ", lockTimestamp=" + lockTimestamp);
                WritableMap map = Arguments.createMap();
                map.putDouble("lockTimestamp", (double) lockTimestamp);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                Log.e(TAG, "getLockTime failed mac=" + macAddress
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null"));
                promise.reject("GET_LOCK_TIME_FAILED",
                        error != null ? error.getDescription() : "Unable to read lock time.");
            }
        });
    }

    @ReactMethod
    public void setLockTime(double timestamp, String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to set the lock time.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to set the lock time.");
            return;
        }

        final long lockTimestamp = (long) timestamp;
        logAdapterState("before setLockTime");
        Log.d(TAG, "setLockTime mac=" + macAddress
                + ", lockDataLength=" + lockData.length()
                + ", timestamp=" + lockTimestamp);

        TTLockClient.getDefault().setLockTime(lockTimestamp, lockData, macAddress, new SetLockTimeCallback() {
            @Override
            public void onSetTimeSuccess() {
                Log.d(TAG, "setLockTime success mac=" + macAddress + ", timestamp=" + lockTimestamp);
                WritableMap map = Arguments.createMap();
                map.putDouble("timestamp", (double) lockTimestamp);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                Log.e(TAG, "setLockTime failed mac=" + macAddress
                        + ", timestamp=" + lockTimestamp
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null"));
                promise.reject("SET_LOCK_TIME_FAILED",
                        error != null ? error.getDescription() : "Unable to set lock time.");
            }
        });
    }

    // ====================================================================
    // Battery
    // ====================================================================

    @ReactMethod
    public void getBatteryLevel(String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to read battery level.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to read battery level.");
            return;
        }

        logAdapterState("before getBatteryLevel");

        TTLockClient.getDefault().getBatteryLevel(lockData, macAddress, new GetBatteryLevelCallback() {
            @Override
            public void onGetBatteryLevelSuccess(int electricQuantity) {
                WritableMap map = Arguments.createMap();
                map.putInt("battery", electricQuantity);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("GET_BATTERY_FAILED",
                        error != null ? error.getDescription() : "Unable to read battery level.");
            }
        });
    }

    // ====================================================================
    // Reset lock
    // ====================================================================

    @ReactMethod
    public void resetLock(String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to reset the lock.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to reset the lock.");
            return;
        }

        logAdapterState("before resetLock");
        Log.d(TAG, "resetLock mac=" + macAddress + ", lockDataLength=" + lockData.length());

        TTLockClient.getDefault().resetLock(lockData, macAddress, new ResetLockCallback() {
            @Override
            public void onResetLockSuccess() {
                Log.d(TAG, "resetLock success mac=" + macAddress);
                promise.resolve(true);
            }

            @Override
            public void onFail(LockError error) {
                Log.e(TAG, "resetLock failed mac=" + macAddress
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null"));
                promise.reject("RESET_LOCK_FAILED",
                        error != null ? error.getDescription() : "Unable to reset lock.");
            }
        });
    }

    // ====================================================================
    // Auto-lock period
    // ====================================================================

    @ReactMethod
    public void setAutomaticLockingPeriod(double seconds, String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to set auto lock.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to set auto lock.");
            return;
        }

        logAdapterState("before setAutomaticLockingPeriod");

        TTLockClient.getDefault().setAutomaticLockingPeriod(
                (int) seconds,
                lockData,
                macAddress,
                new SetAutoLockingPeriodCallback() {
                    @Override
                    public void onSetAutoLockingPeriodSuccess() {
                        Log.d(TAG, "setAutomaticLockingPeriod success mac=" + macAddress
                                + ", seconds=" + (int) seconds);
                        WritableMap map = Arguments.createMap();
                        map.putInt("seconds", (int) seconds);
                        promise.resolve(map);
                    }

                    @Override
                    public void onFail(LockError error) {
                        Log.e(TAG, "setAutomaticLockingPeriod failed mac=" + macAddress
                                + ", error=" + String.valueOf(error)
                                + ", description=" + (error != null ? error.getDescription() : "null"));
                        promise.reject("SET_AUTO_LOCK_FAILED",
                                error != null ? error.getDescription() : "Unable to set auto lock.");
                    }
                }
        );
    }

    // ====================================================================
    // Mute mode
    // ====================================================================

    @ReactMethod
    public void setMuteMode(boolean enable, String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to set mute mode.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to set mute mode.");
            return;
        }

        logAdapterState("before setMuteMode");

        TTLockClient.getDefault().setMuteMode(
                enable,
                lockData,
                macAddress,
                new SetLockMuteModeCallback() {
                    @Override
                    public void onSetMuteModeSuccess(boolean muteModeEnabled) {
                        Log.d(TAG, "setMuteMode success mac=" + macAddress
                                + ", enabled=" + muteModeEnabled);
                        WritableMap map = Arguments.createMap();
                        map.putBoolean("enabled", muteModeEnabled);
                        promise.resolve(map);
                    }

                    @Override
                    public void onFail(LockError error) {
                        Log.e(TAG, "setMuteMode failed mac=" + macAddress
                                + ", error=" + String.valueOf(error)
                                + ", description=" + (error != null ? error.getDescription() : "null"));
                        promise.reject("SET_MUTE_MODE_FAILED",
                                error != null ? error.getDescription() : "Unable to set mute mode.");
                    }
                }
        );
    }

    @ReactMethod
    public void getMuteModeState(String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to read mute mode.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to read mute mode.");
            return;
        }

        logAdapterState("before getMuteModeState");

        TTLockClient.getDefault().getMuteModeState(
                lockData,
                macAddress,
                new GetLockMuteModeStateCallback() {
                    @Override
                    public void onGetMuteModeStateSuccess(boolean muteModeEnabled) {
                        Log.d(TAG, "getMuteModeState success mac=" + macAddress
                                + ", enabled=" + muteModeEnabled);
                        WritableMap map = Arguments.createMap();
                        map.putBoolean("enabled", muteModeEnabled);
                        promise.resolve(map);
                    }

                    @Override
                    public void onFail(LockError error) {
                        Log.e(TAG, "getMuteModeState failed mac=" + macAddress
                                + ", error=" + String.valueOf(error)
                                + ", description=" + (error != null ? error.getDescription() : "null"));
                        promise.reject("GET_MUTE_MODE_FAILED",
                                error != null ? error.getDescription() : "Unable to read mute mode.");
                    }
                }
        );
    }

    // ====================================================================
    // Custom passcode
    // ====================================================================

    @ReactMethod
    public void createCustomPasscode(
            String passcode,
            double startDate,
            double endDate,
            String lockData,
            String macAddress,
            Promise promise
    ) {
        if (passcode == null || passcode.trim().isEmpty()) {
            promise.reject("PASSCODE_REQUIRED", "passcode is required.");
            return;
        }
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to create a passcode.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to create a passcode.");
            return;
        }

        logAdapterState("before createCustomPasscode");

        TTLockClient.getDefault().createCustomPasscode(
                passcode,
                (long) startDate,
                (long) endDate,
                lockData,
                macAddress,
                new CreateCustomPasscodeCallback() {
                    @Override
                    public void onCreateCustomPasscodeSuccess(String createdPasscode) {
                        Log.d(TAG, "createCustomPasscode success mac=" + macAddress
                                + ", passcode=" + createdPasscode);
                        WritableMap map = Arguments.createMap();
                        map.putString("passcode", createdPasscode);
                        promise.resolve(map);
                    }

                    @Override
                    public void onFail(LockError error) {
                        Log.e(TAG, "createCustomPasscode failed mac=" + macAddress
                                + ", error=" + String.valueOf(error)
                                + ", description=" + (error != null ? error.getDescription() : "null"));
                        promise.reject("CREATE_PASSCODE_FAILED",
                                error != null ? error.getDescription() : "Unable to create passcode.");
                    }
                }
        );
    }

    // ====================================================================
    // IC card enrollment
    // ====================================================================

    @ReactMethod
    public void addICCard(
            double startDate,
            double endDate,
            String lockData,
            String macAddress,
            Promise promise
    ) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to add a card.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to add a card.");
            return;
        }

        logAdapterState("before addICCard");

        AddICCardCallback callback = (AddICCardCallback) Proxy.newProxyInstance(
                AddICCardCallback.class.getClassLoader(),
                new Class[]{AddICCardCallback.class},
                (proxy, method, args) -> handleEnrollmentCallback(
                        method,
                        args,
                        promise,
                        "cardNumber",
                        "ADD_IC_CARD_FAILED"
                )
        );

        TTLockClient.getDefault().addICCard(
                (long) startDate,
                (long) endDate,
                lockData,
                macAddress,
                callback
        );
    }

    // ====================================================================
    // Fingerprint enrollment
    // ====================================================================

    @ReactMethod
    public void addFingerprint(
            double startDate,
            double endDate,
            String lockData,
            String macAddress,
            Promise promise
    ) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to add a fingerprint.");
            return;
        }
        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to add a fingerprint.");
            return;
        }

        logAdapterState("before addFingerprint");

        AddFingerprintCallback callback = (AddFingerprintCallback) Proxy.newProxyInstance(
                AddFingerprintCallback.class.getClassLoader(),
                new Class[]{AddFingerprintCallback.class},
                (proxy, method, args) -> handleEnrollmentCallback(
                        method,
                        args,
                        promise,
                        "fingerprintNumber",
                        "ADD_FINGERPRINT_FAILED"
                )
        );

        TTLockClient.getDefault().addFingerprint(
                (long) startDate,
                (long) endDate,
                lockData,
                macAddress,
                callback
        );
    }

    // ====================================================================
    // Enrollment callback dispatcher (reflection-based)
    // ====================================================================

    private Object handleEnrollmentCallback(
            Method method,
            Object[] args,
            Promise promise,
            String successKey,
            String errorCode
    ) {
        String methodName = method.getName();

        if (methodName.toLowerCase().contains("success")) {
            WritableMap map = Arguments.createMap();
            if (args != null && args.length > 0 && args[0] != null) {
                map.putString(successKey, String.valueOf(args[0]));
            }
            promise.resolve(map);
            return null;
        }

        if (methodName.toLowerCase().contains("fail")) {
            LockError error = null;
            if (args != null && args.length > 0 && args[0] instanceof LockError) {
                error = (LockError) args[0];
            }
            promise.reject(errorCode,
                    error != null ? error.getDescription() : "TTLock enrollment failed.");
            return null;
        }

        return null;
    }

    // ====================================================================
    // Scan helpers
    // ====================================================================

    private void finishScan(Promise promise) {
        if (!scanInProgress) {
            return;
        }

        scanInProgress = false;
        TTLockClient.getDefault().stopScanLock();

        Log.i(TAG, "TTLock BLE scan finished; devices found=" + scannedDevices.size());

        WritableArray devicesArray = Arguments.createArray();

        for (ExtendedBluetoothDevice device : scannedDevices.values()) {
            WritableMap map = Arguments.createMap();
            map.putString("name", device.getName());
            map.putString("mac", device.getAddress());
            map.putBoolean("isSettingMode", device.isSettingMode());
            devicesArray.pushMap(map);
        }

        promise.resolve(devicesArray);
    }

    private void cancelScanTimeout() {
        if (scanTimeoutRunnable != null) {
            handler.removeCallbacks(scanTimeoutRunnable);
            scanTimeoutRunnable = null;
        }
    }
}
