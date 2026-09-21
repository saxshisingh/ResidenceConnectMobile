/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Linking,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import Logger from '../../../../services/logger/logger';

import DoorFrontIcon from '../../../../assets/Icons/door_front.svg';
import DoorSlidingIcon from '../../../../assets/Icons/door_sliding.svg';
import NoCrashIcon from '../../../../assets/Icons/no_crash.svg';
import MapsHomeWorkIcon from '../../../../assets/Icons/maps_home_work.svg';
import AccessFallbackIcon from '../../../../assets/Icons/image 88.svg';
import BackButton from '../../../../components/BackButton';
import {useI18n} from '../../../../i18n';
import {useAppSelector} from '../../../../redux/hooks';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import type {ThemeColors} from '../../../../theme/colors';
import SmartLockHeroCard from '../../components/SmartLockHeroCard';
import {
  getDeviceBleAccess,
  getResidentAccessDevices,
  saveTTLockOperationLog,
  type ResidentAccessDevice,
} from '../../services/accessDeviceService';
import * as ttlockNative from '../../native/ttlockNative';

type AccessIconComponent = React.ComponentType<any>;
type ControlAction = 'unlock' | 'lock';

type CachedBleAccess = {
  lockData: string;
  lockMac: string;
  deviceName?: string;
};

const ACCESS_ICON_MAP: Record<string, AccessIconComponent> = {
  main: DoorFrontIcon,
  entrance: DoorFrontIcon,
  door: DoorFrontIcon,
  gate: DoorSlidingIcon,
  parking: NoCrashIcon,
  lobby: MapsHomeWorkIcon,
  lift: MapsHomeWorkIcon,
  elevator: MapsHomeWorkIcon,
};

const getAccessIcon = (
  deviceName: string,
): AccessIconComponent => {
  const normalized = String(deviceName || '').toLowerCase();

  const matchedKey = Object.keys(ACCESS_ICON_MAP).find(key =>
    normalized.includes(key),
  );

  return matchedKey
    ? ACCESS_ICON_MAP[matchedKey]
    : AccessFallbackIcon;
};

const requestBluetoothPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissions =
    Platform.Version >= 31
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]
      : [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

  const result = await PermissionsAndroid.requestMultiple(
    permissions,
  );

  return permissions.every(
    permission =>
      result[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

const isEffectiveTimeError = (message?: string) =>
  String(message || '')
    .toLowerCase()
    .includes('effective');

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

const getBluetoothEnableMessage = (
  t: (key: string, fallback?: string) => string,
) =>
  Platform.OS === 'ios'
    ? t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Turn on Bluetooth in iPhone Settings, then try again.',
      )
    : t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Enable Bluetooth, then try again.',
      );

const RefreshActionIcon = ({
  color,
  size = 16,
}: {
  color: string;
  size?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none">
    <Path
      d="M20 11a8 8 0 10-2.34 5.66M20 11V4m0 7h-7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function UnlockDoorScreen() {
  const navigation = useNavigation<any>();

  const {language, t} = useI18n();

  const {colors, resolvedTheme} = useAppTheme();

  const smartAccessCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        commandInProgressTitle: 'يرجى الانتظار',
        commandInProgressMessage:
          'يرجى المحاولة مرة أخرى بعد لحظة.',
      };
    }

    if (language === 'fr') {
      return {
        commandInProgressTitle: 'Veuillez patienter',
        commandInProgressMessage:
          'Veuillez reessayer dans un instant.',
      };
    }

    return null;
  }, [language]);

  const styles = useMemo(
    () => createStyles(colors),
    [colors],
  );

  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const contentWidth = Math.min(width - 32, 520);

  const user = useAppSelector(state => state.auth.user);
  const userData = user?.data ?? user ?? null;

const residentId = userData?.residentId ?? null;

  /**
   * ============================================================
   * PERFORMANCE / ANDROID CACHE
   * ============================================================
   *
   * These caches are intentionally used for Android only.
   *
   * iOS behaviour remains unchanged.
   */

  const androidBluetoothReadyRef = useRef(false);

  const androidPermissionsGrantedRef = useRef(false);

  const androidBleAccessCache =
    useRef<Record<string, CachedBleAccess>>({});

  /**
   * Prevents Android battery BLE operation from starting while
   * a control command is already running.
   */
  const androidControlInProgressRef = useRef(false);

  /**
   * Prevent multiple Android Bluetooth readiness checks from
   * running simultaneously.
   */
  const androidBluetoothCheckPromiseRef =
    useRef<Promise<boolean> | null>(null);

  const batteryRequestInProgress = useRef(false);

  const [devices, setDevices] = useState<
    ResidentAccessDevice[]
  >([]);

  const [loadingDevices, setLoadingDevices] =
    useState(false);

  const [devicesError, setDevicesError] =
    useState<string | null>(null);

  const [activeControlId, setActiveControlId] =
    useState<string | null>(null);

  const [selectedDevice, setSelectedDevice] =
    useState<ResidentAccessDevice | null>(null);

  const [
    isSelectedDeviceModalVisible,
    setIsSelectedDeviceModalVisible,
  ] = useState(false);

  const [deviceLockStates, setDeviceLockStates] =
    useState<Record<string, boolean>>({});

  const [deviceBatteryLevels, setDeviceBatteryLevels] =
    useState<Record<string, number>>({});

  const [checkingNearbyDeviceId, setCheckingNearbyDeviceId] =
    useState<string | null>(null);

  /**
   * ============================================================
   * CONTROL ERROR
   * ============================================================
   */

  const getControlErrorMessage = (
    error: unknown,
    fallback: string,
  ) => {
    if (
      ttlockNative.isTTLockCommandInProgressError(error)
    ) {
      return (
        smartAccessCopy?.commandInProgressMessage ||
        fallback
      );
    }

    if (ttlockNative.isTTLockNearbyError(error)) {
      return t(
        'mobile.ttlock.lockUnavailableMessage',
        'This lock is not connected nearby right now. Move closer to the lock and try again.',
      );
    }

    if (
      ttlockNative.isTTLockBluetoothDisabledError(error)
    ) {
      return t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Enable Bluetooth, then try again.',
      );
    }

    return ttlockNative.getTTLockUserFacingErrorMessage(
      error,
      fallback,
    );
  };

  /**
   * ============================================================
   * ANDROID BLE ACCESS CACHE
   * ============================================================
   */

  const getCachedBleAccess = async (
    deviceId: string,
    residentIdValue: string,
    forceRefresh = false,
  ): Promise<CachedBleAccess> => {
    /**
     * iOS:
     *
     * DO NOT change the existing behaviour.
     */
    if (Platform.OS === 'ios') {
      return await getDeviceBleAccess(
        deviceId,
        residentIdValue,
      );
    }

    /**
     * Android:
     *
     * Reuse BLE access whenever possible.
     */
    if (!forceRefresh) {
      const cached =
        androidBleAccessCache.current[deviceId];

      if (cached) {
        Logger.info('[TTLock][ANDROID] Using cached BLE access', {
          deviceId,
          lockMac: cached.lockMac,
        });

        return cached;
      }
    }

    Logger.info(
      '[TTLock][ANDROID] Fetching BLE access from backend',
      {
        deviceId,
        forceRefresh,
      },
    );

    const start = Date.now();

    const access = await getDeviceBleAccess(
      deviceId,
      residentIdValue,
    );

    androidBleAccessCache.current[deviceId] = {
      lockData: access.lockData,
      lockMac: access.lockMac,
      deviceName: access.deviceName,
    };

    Logger.info(
      '[TTLock][ANDROID][PERF] BLE access received',
      {
        deviceId,
        durationMs: Date.now() - start,
        lockMac: access.lockMac,
        hasLockData: !!access.lockData,
      },
    );

    return access;
  };

  /**
   * ============================================================
   * BLUETOOTH READY
   * ============================================================
   */

  const ensureBluetoothReady = async () => {
    /**
     * ============================================================
     * ANDROID
     * ============================================================
     */

    if (Platform.OS === 'android') {
      /**
       * Fast path:
       * Bluetooth and permissions were already verified.
       */
      if (
        androidPermissionsGrantedRef.current &&
        androidBluetoothReadyRef.current
      ) {
        Logger.info(
          '[TTLock][ANDROID] Bluetooth already ready',
        );

        return true;
      }

      /**
       * Prevent multiple simultaneous readiness checks.
       */
      if (androidBluetoothCheckPromiseRef.current) {
        Logger.info(
          '[TTLock][ANDROID] Waiting for existing Bluetooth check',
        );

        return await androidBluetoothCheckPromiseRef.current;
      }

      const checkPromise = (async () => {
        const start = Date.now();

        try {
          /**
           * Request permissions only when we don't already
           * know that they were granted.
           */
          if (!androidPermissionsGrantedRef.current) {
            Logger.info(
              '[TTLock][ANDROID] Requesting Bluetooth permissions',
            );

            const permissionsGranted =
              await requestBluetoothPermissions();

            if (!permissionsGranted) {
              Alert.alert(
                t(
                  'mobile.smartAccess.devices.permissionTitle',
                  'Permission required',
                ),
                t(
                  'mobile.smartAccess.devices.permissionMessage',
                  'Bluetooth and location permissions are required for BLE access.',
                ),
              );

              androidPermissionsGrantedRef.current =
                false;

              return false;
            }

            androidPermissionsGrantedRef.current =
              true;
          }

          /**
           * Check Bluetooth only if it hasn't already been
           * verified.
           */
          if (!androidBluetoothReadyRef.current) {
            Logger.info(
              '[TTLock][ANDROID] Checking Bluetooth state',
            );

            let enabled =
              await ttlockNative.isBluetoothEnabled();

            if (!enabled) {
              Logger.info(
                '[TTLock][ANDROID] Bluetooth disabled. Requesting enable.',
              );

              await ttlockNative.requestBluetoothEnable();

              enabled =
                await ttlockNative.isBluetoothEnabled();
            }

            if (!enabled) {
              Alert.alert(
                t(
                  'mobile.smartAccess.devices.bluetoothRequiredTitle',
                  'Bluetooth Required',
                ),
                t(
                  'mobile.smartAccess.devices.bluetoothRequiredMessage',
                  'Enable Bluetooth, then try again.',
                ),
              );

              androidBluetoothReadyRef.current =
                false;

              return false;
            }

            androidBluetoothReadyRef.current = true;
          }

          Logger.info(
            '[TTLock][ANDROID][PERF] Bluetooth ready',
            {
              durationMs: Date.now() - start,
            },
          );

          return true;
        } finally {
          androidBluetoothCheckPromiseRef.current =
            null;
        }
      })();

      androidBluetoothCheckPromiseRef.current =
        checkPromise;

      return await checkPromise;
    }

    /**
     * ============================================================
     * iOS — EXISTING FLOW
     * ============================================================
     */

    const permissionsGranted =
      await requestBluetoothPermissions();

    if (!permissionsGranted) {
      Alert.alert(
        t(
          'mobile.smartAccess.devices.permissionTitle',
          'Permission required',
        ),
        t(
          'mobile.smartAccess.devices.permissionMessage',
          'Bluetooth and location permissions are required for BLE access.',
        ),
      );

      return false;
    }

    const enabled =
      await ttlockNative.isBluetoothEnabled();

    if (enabled) {
      return true;
    }

    Alert.alert(
      t(
        'mobile.smartAccess.devices.bluetoothRequiredTitle',
        'Bluetooth Required',
      ),
      getBluetoothEnableMessage(t),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.settings', 'Settings'),
          onPress: () => Linking.openSettings(),
        },
      ],
    );

    return false;
  };

  /**
   * ============================================================
   * LOAD DEVICES
   * ============================================================
   */

  const loadDevices = async (
    showErrorAlert = false,
  ) => {
    if (!residentId) {
      const message = t(
        'mobile.smartAccess.devices.missingResident',
        'Resident ID is missing for this account.',
      );

      setDevices([]);
      setDevicesError(message);

      if (showErrorAlert) {
        Alert.alert(
          t(
            'mobile.smartAccess.devices.loadErrorTitle',
            'Unable to load devices',
          ),
          message,
        );
      }

      return;
    }

    try {
      setLoadingDevices(true);
      setDevicesError(null);

      const permissionDevices =
        await getResidentAccessDevices(
          String(residentId),
        );

      setDevices(permissionDevices);

      if (
        selectedDevice &&
        isSelectedDeviceModalVisible
      ) {
        const nextSelected =
          permissionDevices.find(
            item => item.id === selectedDevice.id,
          ) || null;

        setSelectedDevice(nextSelected);
      }
    } catch (error: any) {
      const message =
        error?.message ||
        t(
          'mobile.smartAccess.devices.loadError',
          'Unable to load your access devices.',
        );

      setDevicesError(message);

      if (showErrorAlert) {
        Alert.alert(
          t(
            'mobile.smartAccess.devices.loadErrorTitle',
            'Unable to load devices',
          ),
          message,
        );
      }
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    loadDevices().catch(() => null);
  }, [residentId]);

  /**
   * ============================================================
   * SCREEN LOGGING
   * ============================================================
   */

  useEffect(() => {
    Logger.info('UnlockDoorScreen Mounted');

    return () => {
      Logger.info('UnlockDoorScreen Unmounted');
    };
  }, []);

  useEffect(() => {
    Logger.info('Modal Visibility Changed', {
      visible: isSelectedDeviceModalVisible,
      selectedDevice: selectedDevice?.id,
    });
  }, [isSelectedDeviceModalVisible]);

  useEffect(() => {
    Logger.info('Selected Device Changed', {
      deviceId: selectedDevice?.id,
      deviceName: selectedDevice?.name,
    });
  }, [selectedDevice]);

  /**
   * ============================================================
   * BATTERY
   * ============================================================
   *
   * iOS behaviour is unchanged.
   *
   * Android uses cached BLE access and avoids another backend
   * BLE-access request.
   *
   * IMPORTANT:
   * Android battery BLE operation will not start while a control
   * operation is already active.
   */

  useEffect(() => {
    if (
      !selectedDevice ||
      !residentId ||
      !isSelectedDeviceModalVisible
    ) {
      return;
    }

    let cancelled = false;

    const loadBatteryLevel = async () => {
      if (batteryRequestInProgress.current) {
        Logger.warn(
          '[Battery] Battery request already running. Skipping.',
        );
        return;
      }

      /**
       * Android:
       *
       * If unlock is already running, don't start another BLE
       * operation.
       */
      if (
        Platform.OS === 'android' &&
        androidControlInProgressRef.current
      ) {
        Logger.info(
          '[Battery][ANDROID] Control already running. Skipping battery request.',
        );

        return;
      }

      batteryRequestInProgress.current = true;

      Logger.info('[Battery] loadBatteryLevel START', {
        deviceId: selectedDevice?.id,
        deviceName: selectedDevice?.name,
        platform: Platform.OS,
        cancelled,
      });

      try {
        /**
         * iOS — unchanged.
         */
        if (Platform.OS === 'ios') {
          await wait(200);

          if (cancelled) {
            return;
          }
        }

        const fallbackBattery =
          typeof selectedDevice?.raw
            ?.electricQuantity === 'number'
            ? selectedDevice.raw.electricQuantity
            : typeof selectedDevice?.raw
                ?.ElectricQuantity === 'number'
            ? selectedDevice.raw.ElectricQuantity
            : typeof selectedDevice?.raw?.battery ===
              'number'
            ? selectedDevice.raw.battery
            : null;

        Logger.info('[Battery] Fallback battery', {
          fallbackBattery,
        });

        /**
         * ========================================================
         * ANDROID
         * ========================================================
         *
         * Don't aggressively start battery BLE while the modal
         * is opening. Give the modal and nearby scan time to settle.
         */
        if (Platform.OS === 'android') {
          await wait(500);

          if (
            cancelled ||
            androidControlInProgressRef.current
          ) {
            Logger.info(
              '[Battery][ANDROID] Skipping battery BLE operation',
              {
                cancelled,
                controlInProgress:
                  androidControlInProgressRef.current,
              },
            );

            if (
              !cancelled &&
              typeof fallbackBattery === 'number'
            ) {
              setDeviceBatteryLevels(prev => ({
                ...prev,
                [selectedDevice!.id]: fallbackBattery,
              }));
            }

            return;
          }
        }

        Logger.info(
          '[Battery] Checking Bluetooth readiness',
        );

        const ready = await ensureBluetoothReady();

        if (!ready || cancelled) {
          return;
        }

        Logger.info('[Battery] Fetching BLE access');

        let bleAccess: CachedBleAccess;

        if (Platform.OS === 'android') {
          bleAccess = await getCachedBleAccess(
            selectedDevice.id,
            String(residentId),
          );
        } else {
          /**
           * iOS — unchanged.
           */
          bleAccess = await getDeviceBleAccess(
            selectedDevice.id,
            String(residentId),
          );
        }

        if (cancelled) {
          return;
        }

        Logger.info('[Battery] BLE access received', {
          deviceName: bleAccess.deviceName,
          lockMac: bleAccess.lockMac,
          hasLockData: !!bleAccess.lockData,
        });

        Logger.info(
          '[Battery] Calling ttlockNative.getBatteryLevel',
        );

        Logger.info('BLE Access', {
          lockMac: bleAccess.lockMac,
          lockDataLength: bleAccess.lockData?.length,
          lockDataPrefix:
            bleAccess.lockData?.substring(0, 20),
          deviceName: bleAccess.deviceName,
        });

        const batteryStart = Date.now();

        const result =
          await ttlockNative.getBatteryLevel(
            bleAccess.lockData,
            bleAccess.lockMac,
          );

        Logger.info(
          '[Battery][PERF] getBatteryLevel completed',
          {
            durationMs: Date.now() - batteryStart,
            platform: Platform.OS,
          },
        );

        if (cancelled) {
          return;
        }

        Logger.info(
          '[Battery] getBatteryLevel SUCCESS',
          result,
        );

        const battery = result?.battery;

        if (typeof battery === 'number') {
          setDeviceBatteryLevels(prev => ({
            ...prev,
            [selectedDevice!.id]: battery,
          }));
        } else if (
          typeof fallbackBattery === 'number'
        ) {
          setDeviceBatteryLevels(prev => ({
            ...prev,
            [selectedDevice!.id]: fallbackBattery,
          }));
        }
      } catch (error: any) {
        Logger.exception(error);

        Logger.error(
          '[Battery] loadBatteryLevel FAILED',
          {
            message: error?.message,
            error,
          },
        );

        const fallbackBattery =
          typeof selectedDevice?.raw
            ?.electricQuantity === 'number'
            ? selectedDevice.raw.electricQuantity
            : typeof selectedDevice?.raw
                ?.ElectricQuantity === 'number'
            ? selectedDevice.raw.ElectricQuantity
            : typeof selectedDevice?.raw?.battery ===
              'number'
            ? selectedDevice.raw.battery
            : null;

        if (
          !cancelled &&
          typeof fallbackBattery === 'number'
        ) {
          setDeviceBatteryLevels(prev => ({
            ...prev,
            [selectedDevice!.id]: fallbackBattery,
          }));
        }
      } finally {
        batteryRequestInProgress.current = false;

        Logger.info(
          '[Battery] loadBatteryLevel FINISH',
          {
            deviceId: selectedDevice?.id,
            cancelled,
          },
        );
      }
    };

    /**
     * iOS — unchanged.
     */
    if (Platform.OS === 'ios') {
      InteractionManager.runAfterInteractions(() => {
        if (!cancelled) {
          loadBatteryLevel();
        }
      });
    } else {
      /**
       * Android.
       */
      loadBatteryLevel();
    }

    return () => {
      cancelled = true;
    };
  }, [
    isSelectedDeviceModalVisible,
    selectedDevice,
    residentId,
  ]);

  /**
   * ============================================================
   * OPEN DEVICE MODAL
   * ============================================================
   *
   * This remains the place where we verify that the lock is
   * actually nearby.
   *
   * Android:
   * - permissions are cached
   * - BLE access is cached
   * - scan happens ONCE here
   *
   * iOS:
   * - existing behaviour remains.
   */

  const openSelectedDeviceModal = async (
    device: ResidentAccessDevice,
  ) => {
    try {
      setCheckingNearbyDeviceId(device.id);

      const permissionsGranted =
        await requestBluetoothPermissions();

      if (!permissionsGranted) {
        return;
      }

      const bluetoothEnabled =
        await ttlockNative.isBluetoothEnabled();

      if (!bluetoothEnabled) {
        Alert.alert(
          'Bluetooth Required',
          'Please turn on Bluetooth to access this smart lock.',
        );

        if (Platform.OS === 'android') {
          androidBluetoothReadyRef.current = false;
        }

        return;
      }

      /**
       * ========================================================
       * GET BLE ACCESS
       * ========================================================
       */

      const accessStart = Date.now();

      const bleAccess =
        Platform.OS === 'android'
          ? await getCachedBleAccess(
              device.id,
              String(residentId),
            )
          : await getDeviceBleAccess(
              device.id,
              String(residentId),
            );

      Logger.info(
        '[TTLock][PERF] Modal BLE access ready',
        {
          durationMs: Date.now() - accessStart,
          platform: Platform.OS,
          deviceId: device.id,
          lockMac: bleAccess.lockMac,
        },
      );

      /**
       * ========================================================
       * NEARBY SCAN
       * ========================================================
       *
       * This is the ONLY scan required before opening the
       * modal.
       */

      const scanStart = Date.now();

      Logger.info(
        '[TTLock] Checking nearby lock',
        {
          platform: Platform.OS,
          lockMac: bleAccess.lockMac,
        },
      );

      const nearbyDevices =
        await ttlockNative.scanLocks(
          bleAccess.lockMac,
        );

      Logger.info(
        '[TTLock][PERF] Nearby scan completed',
        {
          durationMs: Date.now() - scanStart,
          platform: Platform.OS,
          expectedMac: bleAccess.lockMac,
          count: nearbyDevices.length,
        },
      );

      const nearby = nearbyDevices.some(
        d =>
          d.mac?.trim().toUpperCase() ===
          bleAccess.lockMac.trim().toUpperCase(),
      );

      if (!nearby) {
        Alert.alert(
          'Lock Not Found',
          'The lock is not nearby. Please move closer to the door and try again.',
        );

        return;
      }

      /**
       * Lock is confirmed nearby.
       *
       * Android will now use the cached BLE access and will NOT
       * scan again when Unlock is pressed.
       */
      setSelectedDevice(device);
      setIsSelectedDeviceModalVisible(true);
    } catch (error) {
      Logger.exception(error);

      Logger.error(
        '[TTLock] Nearby device check failed',
        {
          platform: Platform.OS,
          deviceId: device.id,
          error,
        },
      );

      Alert.alert(
        'Error',
        'Unable to check nearby lock.',
      );
    } finally {
      setCheckingNearbyDeviceId(null);
    }
  };

  /**
   * ============================================================
   * CLOSE MODAL
   * ============================================================
   */

  const closeSelectedDeviceModal = () => {
    Logger.info('Close Modal Pressed');

    Logger.info('Current State', {
      selectedDeviceId: selectedDevice?.id,
      activeControlId,
      modalVisible: isSelectedDeviceModalVisible,
    });

    InteractionManager.runAfterInteractions(() => {
      Logger.info(
        'Closing modal after interactions',
      );

      setIsSelectedDeviceModalVisible(false);

      Logger.info(
        'setIsSelectedDeviceModalVisible(false) completed',
      );
    });

    setTimeout(() => {
      Logger.info('500ms after modal close');
    }, 500);

    setTimeout(() => {
      Logger.info('1000ms after modal close');
    }, 1000);

    setTimeout(() => {
      Logger.info('2000ms after modal close');
    }, 2000);
  };

  /**
   * ============================================================
   * CONTROL DEVICE
   * ============================================================
   */

  const handleControlDevice = async (
    device: ResidentAccessDevice,
    action: ControlAction,
  ) => {
    if (activeControlId) {
      Alert.alert(
        smartAccessCopy?.commandInProgressTitle ||
          t(
            'mobile.smartAccess.devices.commandInProgressTitle',
            'Please wait',
          ),
        smartAccessCopy?.commandInProgressMessage ||
          'Please try again in a moment.',
        [
          {
            text: t(
              'common.mobile.common.ok',
              'OK',
            ),
          },
        ],
      );

      return;
    }

    if (!residentId) {
      Alert.alert(
        t(
          'mobile.smartAccess.devices.missingResidentTitle',
          'Resident missing',
        ),
        t(
          'mobile.smartAccess.devices.missingResidentBeforeControl',
          'Resident ID is required before controlling a lock.',
        ),
      );

      return;
    }

    const totalStart = Date.now();

    try {
      setActiveControlId(device.id);

      /**
       * Android:
       * mark control as active immediately so the battery effect
       * cannot start another BLE operation.
       */
      if (Platform.OS === 'android') {
        androidControlInProgressRef.current = true;
      }

      /**
       * ========================================================
       * BLUETOOTH READY
       * ========================================================
       */

      const bluetoothStart = Date.now();

      const ready = await ensureBluetoothReady();

      Logger.info(
        '[TTLock][PERF] Bluetooth ready check',
        {
          platform: Platform.OS,
          durationMs: Date.now() - bluetoothStart,
          ready,
        },
      );

      if (!ready) {
        Logger.warn(
          '[TTLock] Bluetooth not ready',
        );

        if (Platform.OS === 'android') {
          androidBluetoothReadyRef.current = false;
        }

        setTimeout(() => {
          Alert.alert(
            'Bluetooth Off',
            'Please turn on Bluetooth.',
          );
        }, 0);

        return;
      }

      /**
       * ========================================================
       * CONTROL FUNCTION
       * ========================================================
       */

      const performControlWithAccess = async (
        lockData: string,
        lockMac: string,
      ) => {
        Logger.info(
          '[TTLock] Preparing controlLock',
          {
            platform: Platform.OS,
            action,
            lockMac,
            lockDataLength: lockData?.length,
            lockDataPrefix:
              lockData?.substring(0, 20),
          },
        );

        /**
         * ======================================================
         * ANDROID
         * ======================================================
         *
         * IMPORTANT:
         *
         * We already verified the lock was nearby when the
         * modal opened.
         *
         * DO NOT scan again here.
         *
         * This removes one potentially expensive BLE scan from
         * every unlock/lock operation.
         */

        if (Platform.OS === 'android') {
          const controlStart = Date.now();

          Logger.info(
            '[TTLock][ANDROID] Calling controlLock directly',
            {
              action,
              lockMac,
            },
          );

          const result =
            await ttlockNative.controlLock(
              lockData,
              lockMac,
              action,
            );

          Logger.info(
            '[TTLock][ANDROID][PERF] controlLock completed',
            {
              durationMs:
                Date.now() - controlStart,
              action,
              lockMac,
              result,
            },
          );

          return result;
        }

        /**
         * ======================================================
         * iOS — EXISTING FLOW
         * ======================================================
         *
         * DO NOT CHANGE THIS.
         */

        const scanStart = Date.now();

        const nearbyDevices =
          await ttlockNative.scanLocks(lockMac);

        Logger.info(
          '[TTLock][IOS][PERF] Scan completed',
          {
            durationMs:
              Date.now() - scanStart,
            expectedMac: lockMac,
            count: nearbyDevices.length,
          },
        );

        const nearby = nearbyDevices.some(
          d =>
            d.mac?.trim().toUpperCase() ===
            lockMac.trim().toUpperCase(),
        );

        Logger.info(
          '[TTLock][IOS] Nearby check',
          {
            nearby,
            expectedMac: lockMac,
            devices: nearbyDevices,
          },
        );

        if (!nearby) {
          Alert.alert(
            'Lock Not Found',
            'The lock is not nearby. Please move closer to the door and try again.',
          );

          return;
        }

        const controlStart = Date.now();

        const result =
          await ttlockNative.controlLock(
            lockData,
            lockMac,
            action,
          );

        Logger.info(
          '[TTLock][IOS][PERF] controlLock completed',
          {
            durationMs:
              Date.now() - controlStart,
            action,
            lockMac,
          },
        );

        return result;
      };

      /**
       * ========================================================
       * GET BLE ACCESS
       * ========================================================
       */

      const accessStart = Date.now();

      let bleAccess: CachedBleAccess;

      if (Platform.OS === 'android') {
        /**
         * Android:
         * use cached access.
         */
        bleAccess = await getCachedBleAccess(
          device.id,
          String(residentId),
        );
      } else {
        /**
         * iOS:
         * existing behaviour unchanged.
         */
        bleAccess = await getDeviceBleAccess(
          device.id,
          String(residentId),
        );
      }

      Logger.info(
        '[TTLock][PERF] Control BLE access ready',
        {
          platform: Platform.OS,
          durationMs:
            Date.now() - accessStart,
          deviceId: device.id,
          lockMac: bleAccess.lockMac,
        },
      );

      /**
       * ========================================================
       * CONTROL
       * ========================================================
       */

      let result;

      try {
        result =
          await performControlWithAccess(
            bleAccess.lockData,
            bleAccess.lockMac,
          );
      } catch (error: any) {
        /**
         * ======================================================
         * NEARBY ERROR RETRY
         * ======================================================
         */

        if (
          !ttlockNative.isTTLockNearbyError(error)
        ) {
          throw error;
        }

        Logger.warn(
          '[TTLock] Nearby error during control. Refreshing BLE access.',
          {
            platform: Platform.OS,
            deviceId: device.id,
            action,
          },
        );

        /**
         * Keep the original retry delay.
         */
        await wait(350);

        /**
         * Android:
         * force refresh BLE access because the cached data
         * may have expired.
         *
         * iOS:
         * existing behaviour remains.
         */
        if (Platform.OS === 'android') {
          bleAccess =
            await getCachedBleAccess(
              device.id,
              String(residentId),
              true,
            );
        } else {
          bleAccess =
            await getDeviceBleAccess(
              device.id,
              String(residentId),
            );
        }

        result =
          await performControlWithAccess(
            bleAccess.lockData,
            bleAccess.lockMac,
          );
      }

      /**
       * ========================================================
       * SAVE OPERATION LOG
       * ========================================================
       */

      try {
        await saveTTLockOperationLog({
          deviceId: device.id,
          residentId: String(residentId),
          action: action.toUpperCase(),
          mode: 'BLE',
        });
      } catch (logError: any) {
        console.log(
          'Operation log failed:',
          logError,
        );
      }

      /**
       * ========================================================
       * UPDATE UI
       * ========================================================
       */

      const actionLabel =
        action === 'unlock'
          ? t(
              'mobile.smartAccess.devices.unlocked',
              'Unlocked',
            )
          : t(
              'mobile.smartAccess.devices.locked',
              'Locked',
            );

      const batterySuffix =
        typeof result?.battery === 'number'
          ? `\n${t(
              'common.mobile.ttlock.battery',
              'Battery',
            )}: ${result.battery}%`
          : '';

      Logger.info(
        '[TTLock] Control Success',
        {
          platform: Platform.OS,
          action,
          actionLabel,
          deviceId: device.id,
          deviceName:
            bleAccess.deviceName ||
            device.name,
          battery: result?.battery,
          batterySuffix,
          lockMac: bleAccess.lockMac,
          totalDurationMs:
            Date.now() - totalStart,
          timestamp:
            new Date().toISOString(),
        },
      );

      setDeviceLockStates(prev => ({
        ...prev,
        [device.id]:
          action === 'unlock',
      }));

      const batteryLevel = result?.battery;

      if (typeof batteryLevel === 'number') {
        setDeviceBatteryLevels(prev => ({
          ...prev,
          [device.id]: batteryLevel,
        }));
      }
    } catch (error: any) {
      const errorMessage =
        getControlErrorMessage(
          error,
          t(
            'mobile.smartAccess.devices.controlFailed',
            'Unable to control this lock over BLE.',
          ),
        );

      Logger.error(
        '[TTLock] Control Failed',
        {
          platform: Platform.OS,
          action,
          deviceId: device.id,
          deviceName: device.name,
          message: errorMessage,
          rawError: error,
          totalDurationMs:
            Date.now() - totalStart,
          timestamp:
            new Date().toISOString(),
        },
      );

      /**
       * Important:
       * Don't swallow the actual error silently.
       *
       * Your previous code generated the error message but did
       * not display it.
       */
      Alert.alert(
        t(
          'mobile.smartAccess.devices.controlFailedTitle',
          'Unable to control lock',
        ),
        errorMessage,
      );
    } finally {
      /**
       * Android:
       * release control state.
       */
      if (Platform.OS === 'android') {
        androidControlInProgressRef.current =
          false;
      }

      setActiveControlId(null);
    }
  };

  /**
   * ============================================================
   * SELECTED DEVICE MODAL
   * ============================================================
   */

  const renderSelectedDeviceModal = () => {
    if (!selectedDevice) {
      return null;
    }

    const isBusy =
      activeControlId === selectedDevice.id;

    const isUnlocked = Boolean(
      deviceLockStates[selectedDevice.id],
    );

    return (
      <Modal
        transparent
        presentationStyle="overFullScreen"
        animationType="none"
        visible={isSelectedDeviceModalVisible}
        onShow={() => {
          Logger.info('Modal onShow');
        }}
        onRequestClose={() => {
          Logger.info(
            'Modal onRequestClose',
          );

          closeSelectedDeviceModal();
        }}
        onDismiss={() => {
          Logger.info('Modal onDismiss');

          setSelectedDevice(null);
        }}>
        <View
          style={styles.modalOverlay}
          onTouchStart={() => {
            Logger.info(
              'MODAL OVERLAY TOUCH',
            );
          }}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              Logger.info(
                'Modal Backdrop Pressed',
              );

              InteractionManager.runAfterInteractions(
                () => {
                  closeSelectedDeviceModal();
                },
              );
            }}
          />

          <View
            style={styles.modalSheet}
            onTouchStart={() => {
              Logger.info(
                'MODAL SHEET TOUCH',
              );
            }}>
            <View
              style={styles.modalHandle}
            />

            <SmartLockHeroCard
              colors={colors}
              isDark={
                resolvedTheme === 'dark'
              }
              title={selectedDevice.name}
              subtitle={
                selectedDevice.lockId
                  ? `Lock #${selectedDevice.lockId}`
                  : selectedDevice.subtitle
              }
              infoText={
                selectedDevice.deviceType
              }
              battery={
                deviceBatteryLevels[
                  selectedDevice.id
                ]
              }
              isUnlocked={isUnlocked}
              isBusy={isBusy}
              lockedHint={t(
                'mobile.smartAccess.unlockDoor',
                'Tap lock to unlock',
              )}
              unlockedHint={t(
                'mobile.smartAccess.devices.lock',
                'Tap lock to lock',
              )}
              onToggleLock={() =>
                handleControlDevice(
                  selectedDevice,
                  isUnlocked
                    ? 'lock'
                    : 'unlock',
                )
              }
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Logger.info(
                  'Cancel Button Pressed',
                );

                InteractionManager.runAfterInteractions(
                  () => {
                    closeSelectedDeviceModal();
                  },
                );
              }}>
              <Text
                style={
                  styles.cancelButtonText
                }>
                {t(
                  'common.cancel',
                  'Cancel',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  /**
   * ============================================================
   * UI
   * ============================================================
   */

  const showCenteredState =
    loadingDevices ||
    !!devicesError ||
    devices.length === 0;

  return (
    <View
      style={styles.container}
      onTouchStart={() => {
        Logger.info('ROOT TOUCH');
      }}
      onTouchEnd={() => {
        Logger.info('ROOT TOUCH END');
      }}>
      <Svg
        height="100%"
        width="100%"
        style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient
            id="unlockDoorBg"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%">
            <Stop
              offset="0%"
              stopColor={colors.gradientTop}
            />
            <Stop
              offset="100%"
              stopColor={
                colors.gradientBottom
              }
            />
          </LinearGradient>
        </Defs>

        <Rect
          width="100%"
          height="100%"
          fill="url(#unlockDoorBg)"
        />
      </Svg>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          showCenteredState &&
            styles.scrollContentCentered,
          {
            paddingBottom:
              Math.max(
                insets.bottom,
                16,
              ) + 24,
          },
        ]}
        onTouchStart={() => {
          Logger.info('SCROLLVIEW TOUCH');
        }}
        onScrollBeginDrag={() => {
          Logger.info('SCROLL START');
        }}
        onMomentumScrollBegin={() => {
          Logger.info(
            'MOMENTUM START',
          );
        }}
        onMomentumScrollEnd={() => {
          Logger.info(
            'MOMENTUM END',
          );
        }}
        scrollEventThrottle={16}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton
              onPress={() =>
                navigation.goBack()
              }
              color={
                colors.textPrimary
              }
            />

            <Text
              style={
                styles.headerTitle
              }>
              {t(
                'mobile.smartAccess.title',
                'Smart Access',
              )}
            </Text>
          </View>

          <View
            style={
              styles.headerActions
            }>
            <TouchableOpacity
              style={[
                styles.headerActionButton,
                styles.headerTextButton,
              ]}
              onPress={() =>
                navigation.navigate(
                  'SmartAccessHistory',
                )
              }>
              <Text
                style={
                  styles.headerActionText
                }>
                {t(
                  'mobile.smartAccess.history.title',
                  'History',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.refreshBtn,
                loadingDevices &&
                  styles.refreshBtnDisabled,
              ]}
              disabled={
                loadingDevices
              }
              onPress={() =>
                loadDevices(true)
              }>
              {loadingDevices ? (
                <ActivityIndicator
                  size="small"
                  color="#3A8F86"
                />
              ) : (
                <RefreshActionIcon
                  color="#3A8F86"
                  size={16}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loadingDevices &&
        devices.length === 0 ? (
          <View
            style={styles.stateCard}>
            <View
              style={
                styles.loaderRing
              }>
              <ActivityIndicator
                size="large"
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={
                styles.stateTitle
              }>
              {t(
                'mobile.smartAccess.devices.loadingTitle',
                'Loading devices',
              )}
            </Text>

            <Text
              style={
                styles.stateSubtitle
              }>
              {t(
                'mobile.smartAccess.devices.loadingDescription',
                "We're fetching your smart access devices now.",
              )}
            </Text>
          </View>
        ) : null}

        {!loadingDevices &&
        devicesError ? (
          <View
            style={styles.stateCard}>
            <View
              style={
                styles.stateIconWrap
              }>
              <Text
                style={
                  styles.stateIconText
                }>
                !
              </Text>
            </View>

            <Text
              style={
                styles.stateTitle
              }>
              {t(
                'mobile.smartAccess.devices.loadErrorTitle',
                'Unable to load devices',
              )}
            </Text>

            <Text
              style={
                styles.stateSubtitle
              }>
              {devicesError}
            </Text>

            <TouchableOpacity
              style={
                styles.retryButton
              }
              onPress={() =>
                loadDevices(true)
              }>
              <Text
                style={
                  styles.retryButtonText
                }>
                {t(
                  'common.mobile.common.retry',
                  'Retry',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loadingDevices &&
        !devicesError &&
        devices.length === 0 ? (
          <View
            style={styles.stateCard}>
            <View
              style={
                styles.stateIconWrap
              }>
              <Text
                style={
                  styles.stateIconText
                }>
                +
              </Text>
            </View>

            <Text
              style={
                styles.stateTitle
              }>
              {t(
                'mobile.smartAccess.devices.emptyTitle',
                'No access devices available',
              )}
            </Text>

            <Text
              style={
                styles.stateSubtitle
              }>
              {t(
                'mobile.smartAccess.devices.emptyDescription',
                'Contact your building manager to get access permissions.',
              )}
            </Text>
          </View>
        ) : null}

        {devices.length > 0 ? (
          <>
            <View
              style={
                styles.sectionHeaderRow
              }>
              <Text
                style={
                  styles.sectionLabel
                }>
                {t(
                  devices.length === 1
                    ? 'mobile.smartAccess.devices.availableSingle'
                    : 'mobile.smartAccess.devices.availablePlural',
                  devices.length === 1
                    ? '1 Device Available'
                    : '{{count}} Devices Available',
                ).replace(
                  '{{count}}',
                  String(
                    devices.length,
                  ),
                )}
              </Text>
            </View>

            <View
              style={[
                styles.devicesGrid,
                {
                  width:
                    contentWidth,
                  alignSelf:
                    'center',
                },
              ]}>
              {devices.map(device => {
                const IconComponent =
                  getAccessIcon(
                    device.name,
                  );

                const isBusy =
                  activeControlId ===
                    device.id ||
                  checkingNearbyDeviceId ===
                    device.id;

                return (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceCard,
                      isBusy &&
                        styles.deviceCardBusy,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      openSelectedDeviceModal(
                        device,
                      )
                    }
                    disabled={isBusy}>
                    <View
                      style={
                        styles.deviceIconCircle
                      }>
                      <IconComponent
                        width={34}
                        height={34}
                      />
                    </View>

                    {isBusy ? (
                      <View
                        style={
                          styles.busyIndicator
                        }>
                        <ActivityIndicator
                          size="small"
                          color={
                            colors.onPrimary
                          }
                        />
                      </View>
                    ) : null}

                    <Text
                      style={
                        styles.deviceName
                      }
                      numberOfLines={2}>
                      {device.name}
                    </Text>

                    {device.subtitle ? (
                      <Text
                        style={
                          styles.deviceSubtitle
                        }
                        numberOfLines={1}>
                        {
                          device.subtitle
                        }
                      </Text>
                    ) : null}

                    <View
                      style={
                        styles.statusPill
                      }>
                      <View
                        style={[
                          styles.statusDot,
                          isBusy &&
                            styles.statusDotBusy,
                        ]}
                      />

                      <Text
                        style={
                          styles.statusText
                        }>
                        {isBusy
                          ? t(
                              'mobile.smartAccess.devices.working',
                              'Working...',
                            )
                          : t(
                              'mobile.smartAccess.devices.ready',
                              'Ready',
                            )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>

      {renderSelectedDeviceModal()}
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 58,
      paddingBottom: 40,
      gap: 20,
      flexGrow: 1,
    },

    scrollContentCentered: {
      justifyContent: 'flex-start',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      flexShrink: 1,
      flexGrow: 1,
      minWidth: 170,
    },

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: 8,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      marginLeft: -2,
      flexShrink: 1,
    },

    headerActionButton: {
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },

    headerTextButton: {
      minWidth: 76,
    },

    headerActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },

    refreshText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },

    stateCard: {
      flex: 1,
      minHeight: 280,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loaderRing: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor:
        colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    stateIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor:
        colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    stateIconText: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },

    stateTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
      textAlign: 'center',
    },

    stateSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 16,
      minWidth: 120,
      borderRadius: 999,
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    retryButtonText: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: '700',
    },

    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },

    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    refreshButton: {
      minWidth: 82,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },

    refreshButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },

    refreshBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        'rgba(93,175,164,0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(93,175,164,0.32)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    refreshBtnDisabled: {
      opacity: 0.7,
    },

    devicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      justifyContent: 'space-between',
    },

    deviceCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 18,
      alignItems: 'center',
      position: 'relative',
      minHeight: 190,
    },

    deviceCardBusy: {
      opacity: 0.8,
    },

    deviceIconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor:
        colors.backgroundAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    busyIndicator: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deviceName: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      minHeight: 36,
      marginBottom: 4,
    },

    deviceSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 12,
    },

    statusPill: {
      marginTop: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      gap: 6,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#22C55E',
    },

    statusDotBusy: {
      backgroundColor: colors.primary,
    },

    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },

    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },

    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
      maxHeight: '92%',
    },

    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
      backgroundColor: colors.border,
    },

    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
    },

    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });