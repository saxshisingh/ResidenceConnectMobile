import {NativeModules, Platform} from 'react-native';

type ControlAction = 'unlock' | 'lock';
type IOSSoundVolume = 'on' | 'off';

type AndroidTTLockNativeModule = {
  isBluetoothEnabled: () => Promise<boolean>;
  requestBluetoothEnable: () => Promise<boolean>;
  scanLocks: () => Promise<Array<{name?: string; mac: string; isSettingMode?: boolean}>>;
  stopScan: () => Promise<boolean>;
  initLock: (macAddress: string) => Promise<{name?: string; mac: string; lockData: string}>;
  getLockTime: (
    lockData: string,
    macAddress: string,
  ) => Promise<{lockTimestamp?: number}>;
  setLockTime: (
    timestamp: number,
    lockData: string,
    macAddress: string,
  ) => Promise<{timestamp?: number}>;
  controlLock: (
    lockData: string,
    macAddress: string,
    action: ControlAction,
  ) => Promise<{battery?: number; uniqueId?: number; action?: string}>;
  getBatteryLevel: (
    lockData: string,
    macAddress: string,
  ) => Promise<{battery?: number}>;
  setAutomaticLockingPeriod: (
    seconds: number,
    lockData: string,
    macAddress: string,
  ) => Promise<{seconds?: number}>;
  setMuteMode: (
    enable: boolean,
    lockData: string,
    macAddress: string,
  ) => Promise<{enabled?: boolean}>;
  getMuteModeState: (
    lockData: string,
    macAddress: string,
  ) => Promise<{enabled?: boolean}>;
  createCustomPasscode: (
    passcode: string,
    startDate: number,
    endDate: number,
    lockData: string,
    macAddress: string,
  ) => Promise<{passcode?: string}>;
  addICCard: (
    startDate: number,
    endDate: number,
    lockData: string,
    macAddress: string,
  ) => Promise<{cardNumber?: string}>;
  addFingerprint: (
    startDate: number,
    endDate: number,
    lockData: string,
    macAddress: string,
  ) => Promise<{fingerprintNumber?: string}>;
  resetLock: (
    lockData: string,
    macAddress: string,
  ) => Promise<boolean>;
};

type IOSScanLock = {
  lockMac?: string;
  lockName?: string;
  lockVersion?: string;
  isInited?: boolean;
};

type IOSTTLockApi = {
  getBluetoothState?: (success: (state: unknown) => void) => void;
  startScan?: (
    success: (scanLock: IOSScanLock) => void,
    failure?: (error: unknown) => void,
  ) => void;
  stopScan?: () => void;
  initLock?: (
    params: {lockMac: string; lockVersion?: string},
    success: (lockData: string) => void,
    failure?: (error: unknown) => void,
  ) => void;
  controlLock?: (
    action: unknown,
    lockData: string,
    success: (lockTime?: number, electricQuantity?: number, uniqueId?: number) => void,
    failure?: (error: unknown) => void,
  ) => void;
  getLockTime?: (
    lockData: string,
    success: (lockTimestamp: number) => void,
    failure?: (error: unknown) => void,
  ) => void;
  setLockTime?: (
    timestamp: number,
    lockData: string,
    success: () => void,
    failure?: (error: unknown) => void,
  ) => void;
  getLockElectricQuantity?: (
    lockData: string,
    success: (electricQuantity: number) => void,
    failure?: (error: unknown) => void,
  ) => void;
  setLockAutomaticLockingPeriodicTime?: (
    seconds: number,
    lockData: string,
    success: () => void,
    failure?: (error: unknown) => void,
  ) => void;
  getLockSoundVolume?: (
    lockData: string,
    success: (soundVolume: unknown) => void,
    failure?: (error: unknown) => void,
  ) => void;
  setLockSoundVolume?: (
    soundVolume: unknown,
    lockData: string,
    success: () => void,
    failure?: (error: unknown) => void,
  ) => void;
  createCustomPasscode?: (
    passcode: string,
    startDate: number,
    endDate: number,
    lockData: string,
    success: () => void,
    failure?: (error: unknown) => void,
  ) => void;
  addCard?: (
    cycleList: unknown[],
    startDate: number,
    endDate: number,
    lockData: string,
    progress: (() => void) | null,
    success: (cardNumber: string) => void,
    failure?: (error: unknown) => void,
  ) => void;
  addFingerprint?: (
    cycleList: unknown[],
    startDate: number,
    endDate: number,
    lockData: string,
    progress: ((currentCount: number, totalCount: number) => void) | null,
    success: (fingerprintNumber: string) => void,
    failure?: (error: unknown) => void,
  ) => void;
  resetLock?: (
    lockData: string,
    success: () => void,
    failure?: (error: unknown) => void,
  ) => void;
};

type IOSTTLockLibrary = {
  Ttlock?: IOSTTLockApi;
  LockControlType?: Record<string, unknown>;
  LockSoundVolume?: Record<string, unknown>;
};

type ScannedLock = {
  name?: string;
  mac: string;
  isSettingMode?: boolean;
};

const androidTTLockModule = NativeModules.TTLockModule as
  | AndroidTTLockNativeModule
  | undefined;

const resolveIosttlockModule = (): IOSTTLockLibrary | null => {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const required = require('react-native-ttlock');
    return (required?.default || required) as IOSTTLockLibrary;
  } catch {
    return null;
  }
};

const iosTTLockLibrary = resolveIosttlockModule();
const iosTTLockModule = iosTTLockLibrary?.Ttlock || null;
const iosScanCache = new Map<string, IOSScanLock>();
const IOS_SCAN_DURATION_MS = 8000;
const COMMAND_IN_PROGRESS_MESSAGE =
  'Please try again in a moment.';
const DEVICE_NOT_NEARBY_MESSAGE =
  'The smart lock is not nearby or the Bluetooth connection was lost. Move closer to the lock and try again.';
const BLUETOOTH_DISABLED_MESSAGE =
  'Bluetooth is off. Turn it on and try again.';
const BLUETOOTH_PERMISSION_MESSAGE =
  'Bluetooth permission is required to use this smart lock action. Please allow Bluetooth permission and try again.';
let bleCommandInFlight = false;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as {message?: unknown}).message || '').trim();
    if (message) {
      return message;
    }
  }

  return fallback;
};

const isBusyCommandError = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('one command at a time') ||
    normalized.includes('command at a time') ||
    normalized.includes('command is ongoing') ||
    normalized.includes('command in progress') ||
    normalized.includes('busy') ||
    normalized.includes('in progress')
  );
};

export const isTTLockCommandInProgressError = (error: unknown) =>
  isBusyCommandError(getErrorMessage(error, ''));

export const isTTLockNearbyError = (error: unknown) =>
  isNearbyCommandError(getErrorMessage(error, ''));

export const isTTLockBluetoothDisabledError = (error: unknown) =>
  isBluetoothDisabledError(getErrorMessage(error, ''));

const isNearbyCommandError = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('not nearby') ||
    normalized.includes('out of range') ||
    normalized.includes('too far') ||
    normalized.includes('connection timed out') ||
    normalized.includes('connect timeout') ||
    normalized.includes('timeout') ||
    normalized.includes('failed to connect') ||
    normalized.includes('fail to connect') ||
    normalized.includes('disconnected') ||
    normalized.includes('not connected') ||
    normalized.includes('connection lost')
  );
};

const isBluetoothDisabledError = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes('bluetooth') && (
    normalized.includes('off') ||
    normalized.includes('disabled') ||
    normalized.includes('not enable') ||
    normalized.includes('not enabled')
  );
};

const isBluetoothPermissionError = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('bluetooth_connect') ||
    normalized.includes('android.permission.bluetooth') ||
    normalized.includes('need android.permission') ||
    normalized.includes('requires bluetooth') ||
    normalized.includes('missing bluetooth permission')
  );
};

export const getTTLockUserFacingErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  const message = getErrorMessage(error, fallback);

  if (isBusyCommandError(message)) {
    return COMMAND_IN_PROGRESS_MESSAGE;
  }

  if (isNearbyCommandError(message)) {
    return DEVICE_NOT_NEARBY_MESSAGE;
  }

  if (isBluetoothDisabledError(message)) {
    return BLUETOOTH_DISABLED_MESSAGE;
  }

  if (isBluetoothPermissionError(message)) {
    return BLUETOOTH_PERMISSION_MESSAGE;
  }

  return message;
};

const withExclusiveBleCommand = async <T>(command: () => Promise<T>) => {
  if (bleCommandInFlight) {
    throw new Error(COMMAND_IN_PROGRESS_MESSAGE);
  }

  bleCommandInFlight = true;
  try {
    return await command();
  } catch (error) {
    throw new Error(getTTLockUserFacingErrorMessage(error, 'Unable to complete the smart lock command.'));
  } finally {
    bleCommandInFlight = false;
  }
};

const normalizeBluetoothState = (state: unknown) => {
  if (typeof state === 'boolean') {
    return state;
  }

  if (typeof state === 'number') {
    return state === 1 || state === 5;
  }

  const value = String(state || '').trim().toLowerCase();
  return (
    value === '1' ||
    value === '5' ||
    value.includes('poweredon') ||
    value.includes('powered_on') ||
    value.includes('enabled') ||
    value.includes('on')
  );
};

const getIOSControlAction = (action: ControlAction) => {
  const controlTypes = iosTTLockLibrary?.LockControlType || {};

  if (action === 'unlock') {
    return (
      controlTypes.Unlock ??
      controlTypes.UNLOCK ??
      controlTypes.unlock ??
      0
    );
  }

  return (
    controlTypes.Lock ??
    controlTypes.LOCK ??
    controlTypes.lock ??
    1
  );
};

const getIOSSoundVolume = (sound: IOSSoundVolume) => {
  const soundVolumes = iosTTLockLibrary?.LockSoundVolume || {};

  if (sound === 'off') {
    return (
      soundVolumes.Level_0 ??
      soundVolumes.level_0 ??
      soundVolumes.Off ??
      soundVolumes.off ??
      0
    );
  }

  return (
    soundVolumes.Level_3 ??
    soundVolumes.level_3 ??
    soundVolumes.On ??
    soundVolumes.on ??
    3
  );
};

const ensureAndroidModule = () => {
  if (!androidTTLockModule) {
    throw new Error('Native TTLock module is not registered on Android.');
  }

  return androidTTLockModule;
};

const ensureAndroidMethod = <T extends keyof AndroidTTLockNativeModule>(
  methodName: T,
) => {
  const module = ensureAndroidModule();
  const method = module[methodName];

  if (typeof method !== 'function') {
    throw new Error(
      `TTLock native method "${String(
        methodName,
      )}" is unavailable. Rebuild and reinstall the Android app to use the latest TTLock native changes.`,
    );
  }

  return method.bind(module) as AndroidTTLockNativeModule[T];
};

const ensureIOSModule = () => {
  if (!iosTTLockModule) {
    throw new Error(
      'react-native-ttlock is not installed or not linked on iOS. Run npm install and pod install on your MacBook.',
    );
  }

  return iosTTLockModule;
};

export const isBluetoothEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return ensureAndroidModule().isBluetoothEnabled();
  }

  const iosModule = ensureIOSModule();
  const getBluetoothState = iosModule.getBluetoothState;
  if (!getBluetoothState) {
    throw new Error('getBluetoothState is not available on the iOS TTLock module.');
  }

  return new Promise((resolve, reject) => {
    try {
      getBluetoothState(state => resolve(normalizeBluetoothState(state)));
    } catch (error) {
      reject(new Error(getErrorMessage(error, 'Unable to read Bluetooth state.')));
    }
  });
};

export const requestBluetoothEnable = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return ensureAndroidModule().requestBluetoothEnable();
  }

  return false;
};

export const scanLocks = async (): Promise<ScannedLock[]> => {
  if (Platform.OS === 'android') {
    return ensureAndroidModule().scanLocks();
  }

  const iosModule = ensureIOSModule();
  iosScanCache.clear();

  const startScan = iosModule.startScan;
  if (!startScan) {
    throw new Error('startScan is not available on the iOS TTLock module.');
  }

  return new Promise((resolve, reject) => {
    let finished = false;

    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      iosModule.stopScan?.();

      const devices = Array.from(iosScanCache.values()).map(device => ({
        name: device.lockName,
        mac: String(device.lockMac || ''),
        isSettingMode: !Boolean(device.isInited),
      }));

      resolve(devices.filter(device => device.mac));
    };

    const timer = setTimeout(finish, IOS_SCAN_DURATION_MS);

    try {
      startScan(
        device => {
          const mac = String(device?.lockMac || '');
          if (!mac) {
            return;
          }
          iosScanCache.set(mac, device);
        },
        error => {
          if (finished) {
            return;
          }
          finished = true;
          clearTimeout(timer);
          iosModule.stopScan?.();
          reject(new Error(getErrorMessage(error, 'Unable to scan TTLock devices on iOS.')));
        },
      );
    } catch (error) {
      clearTimeout(timer);
      reject(new Error(getErrorMessage(error, 'Unable to start TTLock scan on iOS.')));
    }
  });
};

export const stopScan = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return ensureAndroidModule().stopScan();
  }

  ensureIOSModule().stopScan?.();
  return true;
};

export const initLock = async (macAddress: string) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().initLock(macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const device = iosScanCache.get(macAddress);

  if (!device) {
    throw new Error('Lock device not found in scan cache. Please scan again with the lock nearby.');
  }

  const initLockNative = iosModule.initLock;
  if (!initLockNative) {
    throw new Error('initLock is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{name?: string; mac: string; lockData: string}>((resolve, reject) => {
        initLockNative(
          {
            lockMac: macAddress,
            lockVersion: device.lockVersion,
          },
          lockData =>
            resolve({
              name: device.lockName,
              mac: macAddress,
              lockData,
            }),
          error => reject(new Error(getErrorMessage(error, 'Lock initialization failed on iOS.'))),
        );
      }),
  );
};

export const controlLock = async (
  lockData: string,
  macAddress: string,
  action: ControlAction,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().controlLock(lockData, macAddress, action),
    );
  }

  const iosModule = ensureIOSModule();
  const controlLockNative = iosModule.controlLock;
  if (!controlLockNative) {
    throw new Error('controlLock is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{battery?: number; uniqueId?: number; action?: string}>((resolve, reject) => {
        controlLockNative(
          getIOSControlAction(action),
          lockData,
          (_lockTime, electricQuantity, uniqueId) =>
            resolve({
              action,
              battery: electricQuantity,
              uniqueId,
            }),
          error => reject(new Error(getErrorMessage(error, 'BLE lock control failed on iOS.'))),
        );
      }),
  );
};

export const getLockTime = async (lockData: string, macAddress: string) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().getLockTime(lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const getLockTimeNative = iosModule.getLockTime;
  if (!getLockTimeNative) {
    throw new Error('getLockTime is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{lockTimestamp?: number}>((resolve, reject) => {
        getLockTimeNative(
          lockData,
          lockTimestamp => resolve({lockTimestamp}),
          error => reject(new Error(getErrorMessage(error, 'Unable to read lock time on iOS.'))),
        );
      }),
  );
};

export const setLockTime = async (
  timestamp: number,
  lockData: string,
  macAddress: string,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().setLockTime(timestamp, lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const setLockTimeNative = iosModule.setLockTime;
  if (!setLockTimeNative) {
    throw new Error('setLockTime is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{timestamp?: number}>((resolve, reject) => {
        setLockTimeNative(
          timestamp,
          lockData,
          () => resolve({timestamp}),
          error => reject(new Error(getErrorMessage(error, 'Unable to set lock time on iOS.'))),
        );
      }),
  );
};

export const getBatteryLevel = async (lockData: string, macAddress: string) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().getBatteryLevel(lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const getBatteryLevelNative = iosModule.getLockElectricQuantity;
  if (!getBatteryLevelNative) {
    throw new Error('Battery level is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{battery?: number}>((resolve, reject) => {
        getBatteryLevelNative(
          lockData,
          electricQuantity => resolve({battery: electricQuantity}),
          error => reject(new Error(getErrorMessage(error, 'Unable to read battery level on iOS.'))),
        );
      }),
  );
};

export const setAutomaticLockingPeriod = async (
  seconds: number,
  lockData: string,
  macAddress: string,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().setAutomaticLockingPeriod(
        seconds,
        lockData,
        macAddress,
      ),
    );
  }

  const iosModule = ensureIOSModule();
  const setAutomaticLockingPeriodNative = iosModule.setLockAutomaticLockingPeriodicTime;
  if (!setAutomaticLockingPeriodNative) {
    throw new Error('Automatic locking period is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{seconds?: number}>((resolve, reject) => {
        setAutomaticLockingPeriodNative(
          seconds,
          lockData,
          () => resolve({seconds}),
          error =>
            reject(
              new Error(getErrorMessage(error, 'Unable to set automatic locking period on iOS.')),
            ),
        );
      }),
  );
};

export const setMuteMode = async (
  enable: boolean,
  lockData: string,
  macAddress: string,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().setMuteMode(enable, lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const setLockSoundVolumeNative = iosModule.setLockSoundVolume;
  if (!setLockSoundVolumeNative) {
    throw new Error('Mute mode is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{enabled?: boolean}>((resolve, reject) => {
        setLockSoundVolumeNative(
          getIOSSoundVolume(enable ? 'off' : 'on'),
          lockData,
          () => resolve({enabled: enable}),
          error => reject(new Error(getErrorMessage(error, 'Unable to update lock sound on iOS.'))),
        );
      }),
  );
};

export const getMuteModeState = async (lockData: string, macAddress: string) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().getMuteModeState(lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const getLockSoundVolumeNative = iosModule.getLockSoundVolume;
  if (!getLockSoundVolumeNative) {
    throw new Error('Mute mode state is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{enabled?: boolean}>((resolve, reject) => {
        getLockSoundVolumeNative(
          lockData,
          soundVolume => resolve({enabled: Number(soundVolume) <= 0}),
          error => reject(new Error(getErrorMessage(error, 'Unable to read lock sound state on iOS.'))),
        );
      }),
  );
};

export const createCustomPasscode = async (
  passcode: string,
  startDate: number,
  endDate: number,
  lockData: string,
  macAddress: string,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().createCustomPasscode(
        passcode,
        startDate,
        endDate,
        lockData,
        macAddress,
      ),
    );
  }

  const iosModule = ensureIOSModule();
  const createCustomPasscodeNative = iosModule.createCustomPasscode;
  if (!createCustomPasscodeNative) {
    throw new Error('Custom BLE passcodes are not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{passcode?: string}>((resolve, reject) => {
        createCustomPasscodeNative(
          passcode,
          startDate,
          endDate,
          lockData,
          () => resolve({passcode}),
          error => reject(new Error(getErrorMessage(error, 'Unable to create passcode on iOS.'))),
        );
      }),
  );
};

export const addICCard = async (
  startDate: number,
  endDate: number,
  lockData: string,
  macAddress: string,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().addICCard(startDate, endDate, lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const addCardNative = iosModule.addCard;
  if (!addCardNative) {
    throw new Error('IC card enrollment is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{cardNumber?: string}>((resolve, reject) => {
        addCardNative(
          [],
          startDate,
          endDate,
          lockData,
          null,
          cardNumber => resolve({cardNumber}),
          error => reject(new Error(getErrorMessage(error, 'Unable to enroll card on iOS.'))),
        );
      }),
  );
};

export const addFingerprint = async (
  startDate: number,
  endDate: number,
  lockData: string,
  macAddress: string,
) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidModule().addFingerprint(
        startDate,
        endDate,
        lockData,
        macAddress,
      ),
    );
  }

  const iosModule = ensureIOSModule();
  const addFingerprintNative = iosModule.addFingerprint;
  if (!addFingerprintNative) {
    throw new Error('Fingerprint enrollment is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<{fingerprintNumber?: string}>((resolve, reject) => {
        addFingerprintNative(
          [],
          startDate,
          endDate,
          lockData,
          null,
          fingerprintNumber => resolve({fingerprintNumber}),
          error => reject(new Error(getErrorMessage(error, 'Unable to enroll fingerprint on iOS.'))),
        );
      }),
  );
};

export const resetLock = async (lockData: string, macAddress: string) => {
  if (Platform.OS === 'android') {
    return withExclusiveBleCommand(() =>
      ensureAndroidMethod('resetLock')(lockData, macAddress),
    );
  }

  const iosModule = ensureIOSModule();
  const resetLockNative = iosModule.resetLock;
  if (!resetLockNative) {
    throw new Error('resetLock is not available on the iOS TTLock module.');
  }

  return withExclusiveBleCommand(
    () =>
      new Promise<boolean>((resolve, reject) => {
        resetLockNative(
          lockData,
          () => resolve(true),
          error => reject(new Error(getErrorMessage(error, 'Unable to reset lock on iOS.'))),
        );
      }),
  );
};
