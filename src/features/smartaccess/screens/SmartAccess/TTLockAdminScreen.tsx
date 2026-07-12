import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Path, Circle, Rect, Line} from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useI18n} from '../../../../i18n';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import type {ThemeColors} from '../../../../theme/colors';
import {
  getInitializedSmartLocks,
  initializeSmartLock,
  removeTTLock,
  type TTLockNetworkLock,
} from '../../services/ttlockService';
import * as ttlockNative from '../../native/ttlockNative';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBluetooth = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const IconScan = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const IconList = ({size = 20, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="8" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="8" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="8" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Circle cx="3.5" cy="6" r="1.2" fill={color}/>
    <Circle cx="3.5" cy="12" r="1.2" fill={color}/>
    <Circle cx="3.5" cy="18" r="1.2" fill={color}/>
  </Svg>
);

const IconLock = ({size = 22, color = '#5DAFA4'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8"/>
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Circle cx="12" cy="16" r="1.5" fill={color}/>
  </Svg>
);

const IconCheck = ({size = 16, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const IconClose = ({size = 16, color = '#888'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const IconWifi = ({size = 16, color = '#5DAFA4'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Circle cx="12" cy="20" r="1" fill={color}/>
  </Svg>
);

const IconRefresh = ({size = 16, color = '#3A8F86'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11a8 8 0 10-2.34 5.66M20 11V4m0 7h-7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconTrash = ({size = 16, color = '#DC2626'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M9 7V5.8c0-.66.54-1.2 1.2-1.2h3.6c.66 0 1.2.54 1.2 1.2V7M8 10v7m4-7v7m4-7v7M7 7l.7 11.2c.07 1.01.91 1.8 1.92 1.8h4.82c1.01 0 1.85-.79 1.92-1.8L17 7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type LockDevice = {
  id: string;
  name: string;
  mac: string;
  deviceId?: string;
  lockData?: string;
  lockId?: string;
  alias?: string;
  isSettingMode?: boolean;
};

const looksLikeGuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const isNumericIdentifier = (value: string) => /^\d+$/.test(value);

const getBluetoothEnableMessage = (
  t: (key: string, fallback?: string) => string,
) =>
  Platform.OS === 'ios'
    ? t(
        'mobile.ttlock.admin.enableBluetoothToScan',
        'Turn on Bluetooth in iPhone Settings to start device detection.',
      )
    : t(
        'mobile.ttlock.admin.enableBluetoothToScan',
        'Enable Bluetooth to start device detection.',
      );

const pickRemoveLockIdentifier = (lock: TTLockNetworkLock) => {
  const candidates = [
    lock.lockId,
    lock.raw?.lockId,
    lock.raw?.LockId,
    lock.raw?.ttLockId,
    lock.raw?.TTLockId,
    lock.raw?.ttlockId,
    lock.raw?.TTLOCKID,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate || '').trim();
    if (normalized && isNumericIdentifier(normalized)) {
      return normalized;
    }
  }

  for (const candidate of candidates) {
    const normalized = String(candidate || '').trim();
    if (normalized && !looksLikeGuid(normalized)) {
      return normalized;
    }
  }

  const guidCandidates = [
    lock.raw?.id,
    lock.raw?.Id,
    lock.deviceId,
    lock.raw?.deviceId,
    lock.raw?.DeviceId,
    lock.raw?.accessDeviceId,
    lock.raw?.AccessDeviceId,
    lock.raw?.residentDeviceId,
    lock.raw?.ResidentDeviceId,
    lock.raw?.smartAccessDeviceId,
    lock.raw?.SmartAccessDeviceId,
    lock.raw?.guid,
    lock.raw?.Guid,
    lock.id,
  ];

  for (const candidate of guidCandidates) {
    const normalized = String(candidate || '').trim();
    if (normalized && looksLikeGuid(normalized)) {
      return normalized;
    }
  }

  return '';
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TTLockAdminScreen({navigation}: any) {
  const {colors} = useAppTheme();
  const {t, language} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const adminCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        bluetoothStatus: 'بلوتوث',
        initializedMessage: (name: string, lockId?: string, alias?: string) =>
          `تمت تهيئة ${name} عبر SDK.\n\nمعرّف القفل: ${lockId || '-'}\nالاسم المستعار: ${alias || '-'}`,
      };
    }

    if (language === 'fr') {
      return {
        bluetoothStatus: 'Bluetooth',
        initializedMessage: (name: string, lockId?: string, alias?: string) =>
          `${name} a ete initialise via le SDK.\n\nID serrure : ${lockId || '-'}\nAlias : ${alias || '-'}`,
      };
    }

    return {
      bluetoothStatus: 'Bluetooth',
      initializedMessage: (name: string, lockId?: string, alias?: string) =>
        `${name} is initialized via SDK.\n\nLock ID: ${lockId || '-'}\nAlias: ${alias || '-'}`,
    };
  }, [language]);

  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [devices, setDevices] = useState<LockDevice[]>([]);
  const [networkLocks, setNetworkLocks] = useState<TTLockNetworkLock[]>([]);
  const [loadingNetworkLocks, setLoadingNetworkLocks] = useState(false);
  const [networkLocksError, setNetworkLocksError] = useState<string | null>(null);
  const [bluetoothModalVisible, setBluetoothModalVisible] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [removingLockId, setRemovingLockId] = useState<string | null>(null);
  const adminBusy = scanning || loadingNetworkLocks || Boolean(connectingId) || Boolean(removingLockId);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS !== 'android') return true;
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
    const result = await PermissionsAndroid.requestMultiple(permissions);
    return permissions.every(p => result[p] === PermissionsAndroid.RESULTS.GRANTED);
  };

  const syncBluetoothState = async () => {
    const enabled = await ttlockNative.isBluetoothEnabled();
    setBluetoothEnabled(Boolean(enabled));
    return Boolean(enabled);
  };

  const loadNetworkLocks = async (showErrorAlert = false) => {
    try {
      setLoadingNetworkLocks(true);
      setNetworkLocksError(null);
      const locks = await getInitializedSmartLocks();
      setNetworkLocks(locks);
    } catch (error: any) {
      const message =
        error?.message ||
        t(
          'mobile.ttlock.admin.loadInitializedLocksError',
          'Unable to load initialized locks.',
        );
      setNetworkLocksError(message);
      if (showErrorAlert) {
        Alert.alert(
          t('mobile.ttlock.admin.locksUnavailableTitle', 'Locks unavailable'),
          message,
        );
      }
    } finally {
      setLoadingNetworkLocks(false);
    }
  };

  useEffect(() => {
    syncBluetoothState().catch(() => null);
    loadNetworkLocks().catch(() => null);
  }, []);

  const ensureBluetoothReady = async () => {
    const permissionsGranted = await requestBluetoothPermissions();
    if (!permissionsGranted) {
      Alert.alert(
        t('mobile.ttlock.admin.permissionRequiredTitle', 'Permission required'),
        t(
          'mobile.ttlock.admin.permissionRequiredMessage',
          'Bluetooth and location permissions are required to scan TTLock devices.',
        ),
      );
      return false;
    }
    const enabled = await syncBluetoothState();
    if (enabled) return true;

    if (Platform.OS === 'android') {
      await ttlockNative.requestBluetoothEnable();
      setTimeout(() => syncBluetoothState().catch(() => null), 1200);
    } else {
      Alert.alert(
        t('mobile.ttlock.admin.bluetoothErrorTitle', 'Bluetooth error'),
        getBluetoothEnableMessage(t),
      );
    }

    return false;
  };

  const runScan = async () => {
    try {
      setScanning(true);
      const ready = await ensureBluetoothReady();
      if (!ready) return;
      const scannedDevices = await ttlockNative.scanLocks();
      const formattedDevices: LockDevice[] = scannedDevices.map(device => ({
        id: device.mac,
        name: device.name || t('mobile.ttlock.admin.defaultDeviceName', 'TTLock Device'),
        mac: device.mac,
        alias: device.name || t('mobile.ttlock.admin.defaultDeviceName', 'TTLock Device'),
        isSettingMode: Boolean(device.isSettingMode),
      }));
      setDevices(formattedDevices);
      setBluetoothModalVisible(true);
      if (formattedDevices.length === 0) {
        Alert.alert(
          t('mobile.ttlock.admin.noLocksFoundTitle', 'No locks found'),
          t(
            'mobile.ttlock.admin.noLocksFoundMessage',
            'No TTLock devices were found nearby. Keep the lock awake and try again.',
          ),
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('mobile.ttlock.admin.scanFailedTitle', 'Scan failed'),
        error?.message ||
          t(
            'mobile.ttlock.admin.scanFailedMessage',
            'Unable to scan TTLock devices.',
          ),
      );
    } finally {
      setScanning(false);
    }
  };

  const handleEnableBluetooth = async () => {
    try {
      const ready = await ensureBluetoothReady();
      if (ready) {
        Alert.alert(
          t('mobile.ttlock.admin.bluetoothReadyTitle', 'Bluetooth ready'),
          t(
            'mobile.ttlock.admin.bluetoothReadyMessage',
            'Bluetooth is enabled. You can scan nearby TTLock devices now.',
          ),
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('mobile.ttlock.admin.bluetoothErrorTitle', 'Bluetooth error'),
        error?.message ||
          t(
            'mobile.ttlock.admin.bluetoothErrorMessage',
            'Unable to enable Bluetooth.',
          ),
      );
    }
  };

  const handleConnectDevice = async (device: LockDevice) => {
    if (!device.isSettingMode) {
      Alert.alert(
        t('mobile.ttlock.admin.notInSettingModeTitle', 'Lock not in setting mode'),
        t(
          'mobile.ttlock.admin.notInSettingModeMessage',
          'This flow is only for a new lock in TTLock setting mode. Reset or put the lock into add/setup mode first, then scan again.',
        ),
      );
      return;
    }
    try {
      setConnectingId(device.id);
      const initResult = await ttlockNative.initLock(device.mac);
      const lockAlias =
        device.alias ||
        device.name ||
        initResult.name ||
        t('mobile.ttlock.admin.defaultLockName', 'Smart Lock');
      const backendResult = await initializeSmartLock({lockData: initResult.lockData, lockAlias});
      await loadNetworkLocks();
      const nextDevice = {
        ...device,
        name: initResult.name || device.name,
        alias: lockAlias,
        deviceId: backendResult.deviceId,
        lockData: initResult.lockData,
        lockId: String(backendResult.lockId),
      };
      setConnectedDeviceId(device.id);
      setDevices(prev =>
        prev.map(item =>
              item.id === device.id
            ? {
                ...item,
                name: initResult.name || item.name,
                alias: lockAlias,
                deviceId: backendResult.deviceId,
                lockData: initResult.lockData,
                lockId: String(backendResult.lockId),
              }
            : item,
        ),
      );

      setBluetoothModalVisible(false);
      if (scanning) {
        try {
          await ttlockNative.stopScan();
        } catch {}
      }

      handleOpenTTLockPreview(nextDevice);
    } catch (error: any) {
      Alert.alert(
        t('mobile.ttlock.admin.initializationFailedTitle', 'Initialization failed'),
        error?.message ||
          t(
            'mobile.ttlock.admin.initializationFailedMessage',
            'Unable to initialize this lock with BLE and backend registration.',
          ),
      );
    } finally {
      setConnectingId(null);
    }
  };

  const getLockUnavailableMessage = (error: unknown) => {
    if (ttlockNative.isTTLockCommandInProgressError(error)) {
      return t(
        'mobile.ttlock.admin.lockNearbyRequiredMessage',
        'Bring the lock nearby and connect to the device before opening its options.',
      );
    }

    return ttlockNative.getTTLockUserFacingErrorMessage(
      error,
      t(
        'mobile.ttlock.admin.lockNearbyRequiredMessage',
        'Bring the lock nearby and connect to the device before opening its options.',
      ),
    );
  };

  const handleOpenTTLockPreview = (
    lock?: Partial<TTLockNetworkLock | LockDevice>,
  ) => {
    const target = (lock || {}) as Partial<TTLockNetworkLock> & Partial<LockDevice>;
    const raw = target.raw || {};
    const deviceId =
      target.deviceId ||
      raw.deviceId ||
      raw.DeviceId ||
      raw.accessDeviceId ||
      raw.AccessDeviceId ||
      raw.residentDeviceId ||
      raw.ResidentDeviceId ||
      raw.smartAccessDeviceId ||
      raw.SmartAccessDeviceId ||
      raw.guid ||
      raw.Guid;
    const lockMac = target.mac || raw.lockMac || raw.LockMac;
    const lockData = target.lockData || raw.lockData || raw.LockData;

    navigation.navigate('TTLockScreen', {
      deviceId,
      lockId: target.lockId,
      lockAlias: target.lockAlias || target.alias || target.name,
      mac: lockMac,
      lockData,
    });
  };

  const handleRemoveLock = async (lock: TTLockNetworkLock) => {
    const normalizedLockId = pickRemoveLockIdentifier(lock);
    const normalizedLockMac = String(
      lock.mac || lock.raw?.lockMac || lock.raw?.LockMac || lock.raw?.mac || lock.raw?.Mac || '',
    ).trim();
    const normalizedLockData = String(
      lock.lockData || lock.raw?.lockData || lock.raw?.LockData || '',
    ).trim();
    console.log('[TTLockAdminScreen] delete selected lock:', {
      normalizedLockId,
      normalizedLockMac,
      hasLockData: Boolean(normalizedLockData),
      numericLockId: lock.lockId,
      backendId: lock.id,
      deviceId: lock.deviceId,
      lock,
      raw: lock.raw,
    });

    if (!normalizedLockId) {
      Alert.alert(
        t('mobile.ttlock.admin.removeLockUnavailableTitle', 'Unable to remove lock'),
        t(
          'mobile.ttlock.admin.removeLockMissingId',
          'This lock is missing a lock ID, so it cannot be removed yet.',
        ),
      );
      return;
    }

    try {
      setRemovingLockId(normalizedLockId);
      let resetWarning = '';

      await removeTTLock({
        identifier: normalizedLockId,
        lockId: String(lock.lockId || lock.raw?.lockId || lock.raw?.LockId || ''),
        deviceId: String(
          lock.deviceId ||
            lock.raw?.deviceId ||
            lock.raw?.DeviceId ||
            lock.raw?.accessDeviceId ||
            lock.raw?.AccessDeviceId ||
            lock.raw?.residentDeviceId ||
            lock.raw?.ResidentDeviceId ||
            lock.raw?.smartAccessDeviceId ||
            lock.raw?.SmartAccessDeviceId ||
            lock.raw?.guid ||
            lock.raw?.Guid ||
            '',
        ),
      });

      if (normalizedLockMac && normalizedLockData) {
        try {
          await ttlockNative.resetLock(normalizedLockData, normalizedLockMac);
        } catch (error: any) {
          resetWarning =
            getLockUnavailableMessage(error) ||
            error?.message ||
            t(
              'mobile.ttlock.admin.removeLockResetSkippedMessage',
              'The lock could not be reset over Bluetooth, but it will still be removed from the admin list.',
            );
          console.log('[TTLockAdminScreen] lock reset skipped after removal:', {
            normalizedLockId,
            error,
          });
        }
      } else {
        resetWarning = t(
          'mobile.ttlock.admin.removeLockMissingBleData',
          'This lock is missing Bluetooth data, so it cannot be reset before removal.',
        );
      }

      setNetworkLocks(prev => prev.filter(item => pickRemoveLockIdentifier(item) !== normalizedLockId));
      Alert.alert(
        t('mobile.ttlock.admin.removeLockSuccessTitle', 'Lock removed'),
        resetWarning
          ? `${t(
              'mobile.ttlock.admin.removeLockSuccessMessage',
              'The lock was removed successfully.',
            )}\n\n${resetWarning}`
          : t(
              'mobile.ttlock.admin.removeLockSuccessMessage',
              'The lock was removed successfully.',
            ),
      );
      await loadNetworkLocks();
    } catch (error: any) {
      Alert.alert(
        t('mobile.ttlock.admin.removeLockFailedTitle', 'Failed to remove lock'),
        getLockUnavailableMessage(error) ||
          error?.message ||
          t(
            'mobile.ttlock.admin.removeLockFailedMessage',
            'Unable to remove this lock right now.',
          ),
      );
    } finally {
      setRemovingLockId(null);
    }
  };

  const confirmRemoveLock = (lock: TTLockNetworkLock) => {
    Alert.alert(
      t('mobile.ttlock.admin.removeLockConfirmTitle', 'Remove lock'),
      t(
        'mobile.ttlock.admin.removeLockConfirmMessage',
        'Are you sure you want to remove this lock from the admin list?',
      ),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            handleRemoveLock(lock).catch(() => null);
          },
        },
      ],
    );
  };

  const renderNetworkLockRow = (lock: TTLockNetworkLock) => {
    const isRemoving = removingLockId === String(lock.lockId || '');

    return (
      <TouchableOpacity
        key={lock.id}
        style={styles.deviceRow}
        activeOpacity={0.85}
        disabled={adminBusy}
        onPress={() => handleOpenTTLockPreview(lock)}>
        <View style={styles.deviceMain}>
          <View style={[styles.deviceIconWrap, styles.deviceIconWrapDone]}>
            <IconLock size={20} color="#fff" />
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName} numberOfLines={2}>{lock.lockAlias}</Text>
            <Text style={styles.deviceMac}>
              {lock.mac ? lock.mac : t('mobile.ttlock.admin.macUnavailable', 'MAC unavailable')}
            </Text>
            <View style={styles.deviceTagRow}>
              {lock.lockId ? (
                <View style={styles.idTag}>
                  <Text style={styles.idTagText}>ID: {lock.lockId}</Text>
                </View>
              ) : null}
              <View style={styles.registeredBadge}>
                <IconCheck size={11} color="#5DAFA4" />
                <Text style={styles.registeredText}>
                  {t('mobile.ttlock.admin.initializedOnNetwork', 'Initialized on network')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.deviceActionWrap}>
          <TouchableOpacity
            style={[styles.deleteBtn, isRemoving && styles.refreshBtnDisabled]}
            activeOpacity={0.85}
            disabled={adminBusy || isRemoving}
            onPress={event => {
              event.stopPropagation();
              confirmRemoveLock(lock);
            }}>
            {isRemoving ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <IconTrash size={16} color={colors.danger} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCloseModal = async () => {
    setBluetoothModalVisible(false);
    if (scanning) {
      try {
        await ttlockNative.stopScan();
      } catch {
        return;
      }
    }
  };

  // ── Shared device row ──────────────────────────────────────
  const renderDeviceRow = (device: LockDevice, inModal = false) => {
    const isConnected = connectedDeviceId === device.id;
    const isConnecting = connectingId === device.id;
    const isReady = device.isSettingMode;

    return (
      <View key={device.id} style={inModal ? styles.modalDeviceRow : styles.deviceRow}>
        <View style={[styles.deviceIconWrap, isConnected && styles.deviceIconWrapDone]}>
          <IconLock size={20} color={isConnected ? '#fff' : '#5DAFA4'} />
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={1}>{device.name}</Text>
          <Text style={styles.deviceMac}>{device.mac}</Text>
          <View style={styles.deviceTagRow}>
            <View style={[
              styles.modeTag,
              {backgroundColor: isReady ? 'rgba(93,175,164,0.12)' : 'rgba(180,180,180,0.12)'},
            ]}>
              <View style={[styles.modeDot, {backgroundColor: isReady ? '#5DAFA4' : '#bbb'}]} />
              <Text style={[styles.modeTagText, {color: isReady ? '#3A8F86' : colors.textMuted}]}>
                {isReady
                  ? t('mobile.ttlock.admin.settingMode', 'Setting mode')
                  : t('mobile.ttlock.admin.normalMode', 'Normal mode')}
              </Text>
            </View>
            {device.lockId ? (
              <View style={styles.idTag}>
                <Text style={styles.idTagText}>ID: {device.lockId}</Text>
              </View>
            ) : null}
          </View>
          {device.lockData ? (
            <View style={styles.registeredBadge}>
              <IconCheck size={11} color="#5DAFA4" />
              <Text style={styles.registeredText}>
                {t(
                  'mobile.ttlock.admin.sdkInitializedRegistered',
                  'SDK initialized & registered',
                )}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.initBtn,
            isConnected && styles.initBtnDone,
            !isReady && styles.initBtnDisabled,
            (isConnecting || adminBusy) && styles.initBtnLoading,
          ]}
          onPress={() => (device.lockData ? handleOpenTTLockPreview(device) : handleConnectDevice(device))}
          disabled={isConnecting || adminBusy}>
          {isConnecting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : isConnected ? (
            <IconCheck size={14} color="#fff" />
          ) : (
            <Text style={styles.initBtnText}>
              {isReady
                ? t('mobile.ttlock.admin.init', 'Init')
                : t('common.notAvailable', 'N/A')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper
      title={t('mobile.ttlock.admin.title', 'TTLock Setup')}
      onBackPress={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Status + controls ── */}
        <View style={styles.card}>
          {/* BT status pill */}
          <View style={styles.btStatusRow}>
            <View style={styles.btStatusLeft}>
              <View style={[styles.btDot, {backgroundColor: bluetoothEnabled ? '#5DAFA4' : colors.danger}]} />
              <Text style={styles.btStatusLabel}>
                {adminCopy.bluetoothStatus} —{' '}
                <Text style={{
                  color: bluetoothEnabled ? '#3A8F86' : colors.danger,
                  fontWeight: '700',
                }}>
                  {bluetoothEnabled
                    ? t('mobile.ttlock.on', 'On')
                    : t('mobile.ttlock.off', 'Off')}
                </Text>
              </Text>
            </View>
          </View>

          {/* Three action buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, adminBusy && styles.actionBtnMuted]}
              onPress={handleEnableBluetooth}
              disabled={adminBusy}
              activeOpacity={0.85}>
              <View style={styles.actionBtnIcon}>
                <IconBluetooth size={18} color="#5DAFA4" />
              </View>
              <Text style={styles.actionBtnLabel}>
                {t('mobile.ttlock.admin.enableBluetooth', 'Enable')}
                {'\n'}
                {t('mobile.ttlock.bluetoothStatus', 'Bluetooth')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, adminBusy && styles.actionBtnMuted]}
              onPress={runScan}
              disabled={adminBusy}
              activeOpacity={0.85}>
              <View style={styles.actionBtnIcon}>
                {scanning
                  ? <ActivityIndicator size="small" color="#5DAFA4" />
                  : <IconScan size={18} color="#5DAFA4" />}
              </View>
              <Text style={styles.actionBtnLabel}>
                {scanning
                  ? t('mobile.ttlock.scanning', 'Scanning...')
                  : `${t('mobile.ttlock.admin.scan', 'Scan')}\n${t(
                      'mobile.ttlock.admin.locks',
                      'Locks',
                    )}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, adminBusy && styles.actionBtnMuted]}
              onPress={() => setBluetoothModalVisible(true)}
              disabled={adminBusy}
              activeOpacity={0.85}>
              <View style={styles.actionBtnIcon}>
                <IconList size={18} color="#5DAFA4" />
              </View>
              <Text style={styles.actionBtnLabel}>
                {t('common.view', 'View')}
                {'\n'}
                {t('mobile.ttlock.detectedDevices', 'Devices')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Detected devices ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t('mobile.ttlock.detectedDevices', 'Detected Devices')}
          </Text>

          {scanning && (
            <View style={styles.scanningBanner}>
              <ActivityIndicator size="small" color="#5DAFA4" />
              <Text style={styles.scanningText}>
                {t('mobile.ttlock.scanningDevices', 'Scanning nearby TTLock devices...')}
              </Text>
            </View>
          )}

          {!scanning && devices.length === 0 && (
            <View style={styles.emptyWrap}>
              <IconWifi size={32} color={colors.border} />
              <Text style={styles.emptyText}>
                {t(
                  'mobile.ttlock.admin.noDevicesYet',
                  'No devices yet. Enable Bluetooth and run a scan with the lock hardware nearby.',
                )}
              </Text>
            </View>
          )}

          {devices.map(device => renderDeviceRow(device, false))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardTitle}>
              {t('mobile.ttlock.admin.initializedLocks', 'Initialized Locks')}
            </Text>
            <TouchableOpacity
              style={[styles.refreshBtn, adminBusy && styles.refreshBtnDisabled]}
              onPress={() => loadNetworkLocks(true)}
              disabled={adminBusy}
              activeOpacity={0.85}>
              {loadingNetworkLocks ? (
                <ActivityIndicator size="small" color="#3A8F86" />
              ) : (
                <IconRefresh size={16} color="#3A8F86" />
              )}
            </TouchableOpacity>
          </View>

          {loadingNetworkLocks && networkLocks.length === 0 ? (
            <View style={styles.scanningBanner}>
              <ActivityIndicator size="small" color="#5DAFA4" />
              <Text style={styles.scanningText}>
                {t('mobile.ttlock.admin.loadingInitializedLocks', 'Loading locks from network...')}
              </Text>
            </View>
          ) : null}

          {!loadingNetworkLocks && networkLocksError && networkLocks.length === 0 ? (
            <View style={styles.emptyWrap}>
              <IconWifi size={32} color={colors.border} />
              <Text style={styles.emptyText}>
                {networkLocksError}
              </Text>
            </View>
          ) : null}

          {!loadingNetworkLocks && !networkLocksError && networkLocks.length === 0 ? (
            <View style={styles.emptyWrap}>
              <IconWifi size={32} color={colors.border} />
              <Text style={styles.emptyText}>
                {t(
                  'mobile.ttlock.admin.noInitializedLocks',
                  'No initialized locks found on this network yet.',
                )}
              </Text>
            </View>
          ) : null}

          {networkLocks.map(renderNetworkLockRow)}
        </View>
      </ScrollView>

      {/* ── Modal ── */}
      <Modal
        transparent
        animationType="slide"
        visible={bluetoothModalVisible}
        onRequestClose={handleCloseModal}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  {t('mobile.ttlock.bluetoothDevices', 'Bluetooth Devices')}
                </Text>
                <Text style={styles.sheetSub}>
                  {t(
                    'mobile.ttlock.admin.devicesFound',
                    '{{count}} device(s) found',
                  ).replace('{{count}}', String(devices.length))}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeBtn, adminBusy && styles.refreshBtnDisabled]}
                onPress={handleCloseModal}
                disabled={adminBusy}>
                <IconClose size={15} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {scanning && (
              <View style={[styles.scanningBanner, {marginHorizontal: 16, marginTop: 10}]}>
                <ActivityIndicator size="small" color="#5DAFA4" />
                <Text style={styles.scanningText}>
                  {t('mobile.ttlock.scanningDevices', 'Scanning nearby TTLock devices...')}
                </Text>
              </View>
            )}

            {!scanning && devices.length === 0 && (
              <View style={styles.emptyWrap}>
                <IconWifi size={32} color={colors.border} />
                <Text style={styles.emptyText}>
                  {t(
                    'mobile.ttlock.admin.noNearbyDevicesYet',
                    'No nearby TTLock devices found yet.',
                  )}
                </Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}>
              {devices.map(device => renderDeviceRow(device, true))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      padding: 16,
      gap: 12,
      paddingBottom: 32,
    },

    // Card
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.1,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 14,
    },

    // BT status
    btStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    btStatusLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    btDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    btStatusLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },

    // Action buttons — outlined teal, NOT filled orange
    actionsGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    actionBtn: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: 'rgba(93,175,164,0.08)',
      borderWidth: 1.5,
      borderColor: 'rgba(93,175,164,0.32)',
      padding: 14,
      alignItems: 'center',
      gap: 8,
    },
    actionBtnMuted: {
      opacity: 0.55,
    },
    actionBtnIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: 'rgba(93,175,164,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#3A8F86',
      textAlign: 'center',
      lineHeight: 15,
    },
    refreshBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: 'rgba(93,175,164,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.32)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshBtnDisabled: {
      opacity: 0.7,
    },

    // Scanning / empty
    scanningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(93,175,164,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.2)',
      marginBottom: 10,
    },
    scanningText: {
      fontSize: 13,
      color: '#3A8F86',
      fontWeight: '500',
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 10,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
      maxWidth: 260,
    },

    // Device rows
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 4,
    },
    deviceMain: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    deviceActionWrap: {
      width: 40,
      alignSelf: 'stretch',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    modalDeviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deviceIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(93,175,164,0.10)',
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deviceIconWrapDone: {
      backgroundColor: '#5DAFA4',
      borderColor: '#5DAFA4',
    },
    deviceInfo: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    deviceName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      flexShrink: 1,
      lineHeight: 20,
    },
    deviceMac: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'monospace',
    },
    deviceTagRow: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 2,
    },
    modeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    modeDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    modeTagText: {
      fontSize: 11,
      fontWeight: '600',
    },
    idTag: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: 'rgba(93,175,164,0.10)',
    },
    idTagText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#3A8F86',
    },
    registeredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
      flexShrink: 1,
    },
    registeredText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#5DAFA4',
      flexShrink: 1,
    },

    // Init button
    initBtn: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: '#5DAFA4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    initBtnDone: {
      backgroundColor: '#3D8A7E',
    },
    initBtnDisabled: {
      backgroundColor: colors.textMuted,
    },
    initBtnLoading: {
      opacity: 0.75,
    },
    initBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#fff',
    },
    deleteBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: `${colors.danger}14`,
      borderWidth: 1,
      borderColor: `${colors.danger}2E`,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    // Modal sheet
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: '80%',
      flexDirection: 'column',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 4,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    sheetSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetScroll: {
      paddingHorizontal: 18,
      paddingBottom: 32,
      paddingTop: 4,
    },
  });
