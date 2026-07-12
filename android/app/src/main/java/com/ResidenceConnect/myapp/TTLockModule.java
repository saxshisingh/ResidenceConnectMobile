package com.ResidenceConnect.myapp;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
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
    private static final long SCAN_DURATION_MS = 8000L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Map<String, ExtendedBluetoothDevice> scannedDevices = new LinkedHashMap<>();

    private boolean scanInProgress = false;
    private Runnable scanTimeoutRunnable;

    public TTLockModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "TTLockModule";
    }

    @ReactMethod
    public void isBluetoothEnabled(Promise promise) {
        promise.resolve(TTLockClient.getDefault().isBLEEnabled(getReactApplicationContext()));
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
    public void scanLocks(Promise promise) {
        if (scanInProgress) {
            promise.reject("SCAN_IN_PROGRESS", "A TTLock scan is already in progress.");
            return;
        }

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().stopScanLock();
        scannedDevices.clear();
        scanInProgress = true;

        scanTimeoutRunnable = () -> finishScan(promise);
        handler.postDelayed(scanTimeoutRunnable, SCAN_DURATION_MS);

        TTLockClient.getDefault().startScanLock(new ScanLockCallback() {
            @Override
            public void onScanLockSuccess(ExtendedBluetoothDevice device) {
                if (device == null || device.getAddress() == null) {
                    return;
                }

                Log.d(
                    TAG,
                    "Scanned lock mac=" + device.getAddress()
                        + ", name=" + device.getName()
                        + ", isSettingMode=" + device.isSettingMode()
                );
                scannedDevices.put(device.getAddress(), device);
            }

            @Override
            public void onFail(LockError error) {
                cancelScanTimeout();
                scanInProgress = false;
                TTLockClient.getDefault().stopScanLock();
                promise.reject("SCAN_FAILED", error != null ? error.getDescription() : "Scan failed.");
            }
        });
    }

    @ReactMethod
    public void stopScan(Promise promise) {
        cancelScanTimeout();
        scanInProgress = false;
        TTLockClient.getDefault().stopScanLock();
        promise.resolve(true);
    }

    @ReactMethod
    public void initLock(String macAddress, Promise promise) {
        ExtendedBluetoothDevice device = scannedDevices.get(macAddress);

        if (device == null) {
            promise.reject(
                "DEVICE_NOT_FOUND",
                "Lock device not found in scan cache. Please scan again with the lock nearby."
            );
            return;
        }

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().initLock(device, new InitLockCallback() {
            @Override
            public void onInitLockSuccess(String lockData) {
                Log.d(
                    TAG,
                    "initLock success mac=" + device.getAddress()
                        + ", name=" + device.getName()
                        + ", lockDataLength=" + (lockData != null ? lockData.length() : 0)
                );
                WritableMap map = Arguments.createMap();
                map.putString("name", device.getName());
                map.putString("mac", device.getAddress());
                map.putString("lockData", lockData);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("INIT_LOCK_FAILED", error != null ? error.getDescription() : "Lock initialization failed.");
            }
        });
    }

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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        Log.d(
            TAG,
            "controlLock action=" + action
                + ", mac=" + macAddress
                + ", lockDataLength=" + lockData.length()
        );

        TTLockClient.getDefault().controlLock(controlAction, lockData, macAddress, new ControlLockCallback() {
            @Override
            public void onControlLockSuccess(ControlLockResult controlLockResult) {
                Log.d(
                    TAG,
                    "controlLock success action=" + action
                        + ", mac=" + macAddress
                        + ", result=" + String.valueOf(controlLockResult)
                );
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
                Log.e(
                    TAG,
                    "controlLock failed action=" + action
                        + ", mac=" + macAddress
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null")
                );
                promise.reject("CONTROL_LOCK_FAILED", error != null ? error.getDescription() : "BLE lock control failed.");
            }
        });
    }

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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
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
                Log.e(
                    TAG,
                    "getLockTime failed mac=" + macAddress
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null")
                );
                promise.reject("GET_LOCK_TIME_FAILED", error != null ? error.getDescription() : "Unable to read lock time.");
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
        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        Log.d(
            TAG,
            "setLockTime mac=" + macAddress
                + ", lockDataLength=" + lockData.length()
                + ", timestamp=" + lockTimestamp
        );

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
                Log.e(
                    TAG,
                    "setLockTime failed mac=" + macAddress
                        + ", timestamp=" + lockTimestamp
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null")
                );
                promise.reject("SET_LOCK_TIME_FAILED", error != null ? error.getDescription() : "Unable to set lock time.");
            }
        });
    }

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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().getBatteryLevel(lockData, macAddress, new GetBatteryLevelCallback() {
            @Override
            public void onGetBatteryLevelSuccess(int electricQuantity) {
                WritableMap map = Arguments.createMap();
                map.putInt("battery", electricQuantity);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("GET_BATTERY_FAILED", error != null ? error.getDescription() : "Unable to read battery level.");
            }
        });
    }

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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        Log.d(
            TAG,
            "resetLock mac=" + macAddress
                + ", lockDataLength=" + lockData.length()
        );

        TTLockClient.getDefault().resetLock(lockData, macAddress, new ResetLockCallback() {
            @Override
            public void onResetLockSuccess() {
                Log.d(TAG, "resetLock success mac=" + macAddress);
                promise.resolve(true);
            }

            @Override
            public void onFail(LockError error) {
                Log.e(
                    TAG,
                    "resetLock failed mac=" + macAddress
                        + ", error=" + String.valueOf(error)
                        + ", description=" + (error != null ? error.getDescription() : "null")
                );
                promise.reject("RESET_LOCK_FAILED", error != null ? error.getDescription() : "Unable to reset lock.");
            }
        });
    }

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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().setAutomaticLockingPeriod((int) seconds, lockData, macAddress, new SetAutoLockingPeriodCallback() {
            @Override
            public void onSetAutoLockingPeriodSuccess() {
                WritableMap map = Arguments.createMap();
                map.putInt("seconds", (int) seconds);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("SET_AUTO_LOCK_FAILED", error != null ? error.getDescription() : "Unable to set auto lock.");
            }
        });
    }

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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().setMuteMode(enable, lockData, macAddress, new SetLockMuteModeCallback() {
            @Override
            public void onSetMuteModeSuccess(boolean muteModeEnabled) {
                WritableMap map = Arguments.createMap();
                map.putBoolean("enabled", muteModeEnabled);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("SET_MUTE_MODE_FAILED", error != null ? error.getDescription() : "Unable to set mute mode.");
            }
        });
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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().getMuteModeState(lockData, macAddress, new GetLockMuteModeStateCallback() {
            @Override
            public void onGetMuteModeStateSuccess(boolean muteModeEnabled) {
                WritableMap map = Arguments.createMap();
                map.putBoolean("enabled", muteModeEnabled);
                promise.resolve(map);
            }

            @Override
            public void onFail(LockError error) {
                promise.reject("GET_MUTE_MODE_FAILED", error != null ? error.getDescription() : "Unable to read mute mode.");
            }
        });
    }

    @ReactMethod
    public void createCustomPasscode(String passcode, double startDate, double endDate, String lockData, String macAddress, Promise promise) {
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

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        TTLockClient.getDefault().createCustomPasscode(
            passcode,
            (long) startDate,
            (long) endDate,
            lockData,
            macAddress,
            new CreateCustomPasscodeCallback() {
                @Override
                public void onCreateCustomPasscodeSuccess(String createdPasscode) {
                    WritableMap map = Arguments.createMap();
                    map.putString("passcode", createdPasscode);
                    promise.resolve(map);
                }

                @Override
                public void onFail(LockError error) {
                    promise.reject("CREATE_PASSCODE_FAILED", error != null ? error.getDescription() : "Unable to create passcode.");
                }
            }
        );
    }

    @ReactMethod
    public void addICCard(double startDate, double endDate, String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to add a card.");
            return;
        }

        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to add a card.");
            return;
        }

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        AddICCardCallback callback = (AddICCardCallback) Proxy.newProxyInstance(
            AddICCardCallback.class.getClassLoader(),
            new Class[]{AddICCardCallback.class},
            (proxy, method, args) -> handleEnrollmentCallback(method, args, promise, "cardNumber", "ADD_IC_CARD_FAILED")
        );
        TTLockClient.getDefault().addICCard((long) startDate, (long) endDate, lockData, macAddress, callback);
    }

    @ReactMethod
    public void addFingerprint(double startDate, double endDate, String lockData, String macAddress, Promise promise) {
        if (lockData == null || lockData.trim().isEmpty()) {
            promise.reject("LOCK_DATA_REQUIRED", "lockData is required to add a fingerprint.");
            return;
        }

        if (macAddress == null || macAddress.trim().isEmpty()) {
            promise.reject("MAC_REQUIRED", "Lock mac address is required to add a fingerprint.");
            return;
        }

        TTLockClient.getDefault().prepareBTService(getReactApplicationContext());
        AddFingerprintCallback callback = (AddFingerprintCallback) Proxy.newProxyInstance(
            AddFingerprintCallback.class.getClassLoader(),
            new Class[]{AddFingerprintCallback.class},
            (proxy, method, args) -> handleEnrollmentCallback(method, args, promise, "fingerprintNumber", "ADD_FINGERPRINT_FAILED")
        );
        TTLockClient.getDefault().addFingerprint((long) startDate, (long) endDate, lockData, macAddress, callback);
    }

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
            promise.reject(errorCode, error != null ? error.getDescription() : "TTLock enrollment failed.");
            return null;
        }

        return null;
    }

    private void finishScan(Promise promise) {
        if (!scanInProgress) {
            return;
        }

        scanInProgress = false;
        TTLockClient.getDefault().stopScanLock();

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
