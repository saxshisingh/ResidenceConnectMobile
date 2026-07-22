/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useMemo, useState} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

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

const getAccessIcon = (deviceName: string): AccessIconComponent => {
  const normalized = String(deviceName || '').toLowerCase();
  const matchedKey = Object.keys(ACCESS_ICON_MAP).find(key =>
    normalized.includes(key),
  );
  return matchedKey ? ACCESS_ICON_MAP[matchedKey] : AccessFallbackIcon;
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

  const result = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every(
    permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

const isEffectiveTimeError = (message?: string) =>
  String(message || '').toLowerCase().includes('effective');

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
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
        commandInProgressMessage: 'يرجى المحاولة مرة أخرى بعد لحظة.',
      };
    }
    if (language === 'fr') {
      return {
        commandInProgressTitle: 'Veuillez patienter',
        commandInProgressMessage: 'Veuillez reessayer dans un instant.',
      };
    }

    return null;
  }, [language]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 520);
  const user = useAppSelector(state => state.auth.user);
  const residentId = user?.data?.residentId;

  const [devices, setDevices] = useState<ResidentAccessDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [activeControlId, setActiveControlId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] =
    useState<ResidentAccessDevice | null>(null);
  const [isSelectedDeviceModalVisible, setIsSelectedDeviceModalVisible] =
    useState(false);
  const [deviceLockStates, setDeviceLockStates] = useState<Record<string, boolean>>({});
  const [deviceBatteryLevels, setDeviceBatteryLevels] = useState<Record<string, number>>({});

  const getControlErrorMessage = (error: unknown, fallback: string) => {
    if (ttlockNative.isTTLockCommandInProgressError(error)) {
      return smartAccessCopy?.commandInProgressMessage || fallback;
    }

    if (ttlockNative.isTTLockNearbyError(error)) {
      return t(
        'mobile.ttlock.lockUnavailableMessage',
        'This lock is not connected nearby right now. Move closer to the lock and try again.',
      );
    }

    if (ttlockNative.isTTLockBluetoothDisabledError(error)) {
      return t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Enable Bluetooth, then try again.',
      );
    }

    return ttlockNative.getTTLockUserFacingErrorMessage(error, fallback);
  };

  const loadDevices = async (showErrorAlert = false) => {
    if (!residentId) {
      const message = t(
        'mobile.smartAccess.devices.missingResident',
        'Resident ID is missing for this account.',
      );
      setDevices([]);
      setDevicesError(message);
      if (showErrorAlert) {
        Alert.alert(
          t('mobile.smartAccess.devices.loadErrorTitle', 'Unable to load devices'),
          message,
        );
      }
      return;
    }

    try {
      setLoadingDevices(true);
      setDevicesError(null);
      const permissionDevices = await getResidentAccessDevices(String(residentId));
      setDevices(permissionDevices);

      if (selectedDevice && isSelectedDeviceModalVisible) {
        const nextSelected =
          permissionDevices.find(item => item.id === selectedDevice.id) || null;
        setSelectedDevice(nextSelected);
      }
    } catch (error: any) {
      const message =
        error?.message ||
        t('mobile.smartAccess.devices.loadError', 'Unable to load your access devices.');
      setDevicesError(message);
      if (showErrorAlert) {
        Alert.alert(
          t('mobile.smartAccess.devices.loadErrorTitle', 'Unable to load devices'),
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

  useEffect(() => {
    if (!selectedDevice || !residentId || !isSelectedDeviceModalVisible) {
      return;
    }

    let cancelled = false;

    const loadBatteryLevel = async () => {
      if (Platform.OS === 'ios') {
        // Wait for modal animation to finish
        await new Promise<void>(resolve => setTimeout(() => resolve(), 400));
      }

      const fallbackBattery =
        typeof selectedDevice?.raw?.electricQuantity === 'number'
          ? selectedDevice.raw.electricQuantity
          : typeof selectedDevice?.raw?.ElectricQuantity === 'number'
            ? selectedDevice.raw.ElectricQuantity
            : typeof selectedDevice?.raw?.battery === 'number'
              ? selectedDevice.raw.battery
              : null;

      try {
        const ready = await ensureBluetoothReady();
        if (!ready) {
          return;
        }

        const bleAccess = await getDeviceBleAccess(selectedDevice.id, String(residentId));
        const result = await ttlockNative.getBatteryLevel(
          bleAccess.lockData,
          bleAccess.lockMac,
        );
        const batteryLevel = result?.battery;

        if (!cancelled && typeof batteryLevel === 'number') {
          setDeviceBatteryLevels(prev => ({
            ...prev,
            [selectedDevice.id]: batteryLevel,
          }));
        }
      } catch {
        if (!cancelled && typeof fallbackBattery === 'number') {
          setDeviceBatteryLevels(prev => ({
            ...prev,
            [selectedDevice.id]: fallbackBattery,
          }));
        }
        return;
      }
    };

    if (Platform.OS === 'ios') {
      InteractionManager.runAfterInteractions(() => {
        if (!cancelled) {
          loadBatteryLevel();
        }
      });
    } else {
      loadBatteryLevel();
    }

    return () => {
      cancelled = true;
    };
  }, [isSelectedDeviceModalVisible, selectedDevice, residentId]);

  const openSelectedDeviceModal = (device: ResidentAccessDevice) => {
    setSelectedDevice(device);
    setIsSelectedDeviceModalVisible(true);
  };

  const closeSelectedDeviceModal = () => {
    setIsSelectedDeviceModalVisible(false);
  };

  const ensureBluetoothReady = async () => {
    const permissionsGranted = await requestBluetoothPermissions();
    if (!permissionsGranted) {
      Alert.alert(
        t('mobile.smartAccess.devices.permissionTitle', 'Permission required'),
        t(
          'mobile.smartAccess.devices.permissionMessage',
          'Bluetooth and location permissions are required for BLE access.',
        ),
      );
      return false;
    }

    const enabled = await ttlockNative.isBluetoothEnabled();
    if (enabled) {
      return true;
    }

    if (Platform.OS === 'android') {
      await ttlockNative.requestBluetoothEnable();
    }

    Alert.alert(
      t('mobile.smartAccess.devices.bluetoothRequiredTitle', 'Bluetooth required'),
      getBluetoothEnableMessage(t),
    );
    return false;
  };

  const handleControlDevice = async (
    device: ResidentAccessDevice,
    action: ControlAction,
  ) => {
    if (activeControlId) {
      Alert.alert(
        smartAccessCopy?.commandInProgressTitle ||
          t('mobile.smartAccess.devices.commandInProgressTitle', 'Please wait'),
        smartAccessCopy?.commandInProgressMessage ||
          'Please try again in a moment.',
        [{text: t('common.mobile.common.ok', 'OK')}],
      );
      return;
    }

    if (!residentId) {
      Alert.alert(
        t('mobile.smartAccess.devices.missingResidentTitle', 'Resident missing'),
        t(
          'mobile.smartAccess.devices.missingResidentBeforeControl',
          'Resident ID is required before controlling a lock.',
        ),
      );
      return;
    }

    try {
      setActiveControlId(device.id);

      const ready = await ensureBluetoothReady();
      if (!ready) {
        return;
      }

      const performControlWithAccess = async (
        lockData: string,
        lockMac: string,
      ) => {
        try {
          return await ttlockNative.controlLock(lockData, lockMac, action);
        } catch (error: any) {
          if (!isEffectiveTimeError(error?.message)) {
            throw error;
          }

          const currentTimestamp = Date.now();
          await ttlockNative.getLockTime(lockData, lockMac);
          await ttlockNative.setLockTime(
            currentTimestamp,
            lockData,
            lockMac,
          );

          return ttlockNative.controlLock(lockData, lockMac, action);
        }
      };

      let bleAccess = await getDeviceBleAccess(device.id, String(residentId));
      let result;

      try {
        result = await performControlWithAccess(
          bleAccess.lockData,
          bleAccess.lockMac,
        );
      } catch (error: any) {
        if (!ttlockNative.isTTLockNearbyError(error)) {
          throw error;
        }

        await wait(350);
        bleAccess = await getDeviceBleAccess(device.id, String(residentId));
        result = await performControlWithAccess(
          bleAccess.lockData,
          bleAccess.lockMac,
        );
      }

      try {
        await saveTTLockOperationLog({
          deviceId: device.id,
          residentId: String(residentId),
          action: action.toUpperCase(),
          mode: 'BLE',
        });
      } catch (logError: any) {
        console.log('Operation log failed:', logError);
      }

      const actionLabel =
        action === 'unlock'
          ? t('mobile.smartAccess.devices.unlocked', 'Unlocked')
          : t('mobile.smartAccess.devices.locked', 'Locked');
      const batterySuffix =
        typeof result?.battery === 'number'
          ? `\n${t('common.mobile.ttlock.battery', 'Battery')}: ${result.battery}%`
          : '';

      Alert.alert(
        t('mobile.smartAccess.devices.controlSuccess', '{{action}} successfully').replace('{{action}}', actionLabel),
        `${bleAccess.deviceName || device.name}${batterySuffix}`,
      );
      setDeviceLockStates(prev => ({
        ...prev,
        [device.id]: action === 'unlock',
      }));
      const batteryLevel = result?.battery;
      if (typeof batteryLevel === 'number') {
        setDeviceBatteryLevels(prev => ({
          ...prev,
          [device.id]: batteryLevel,
        }));
      }
    } catch (error: any) {
      Alert.alert(
        action === 'unlock'
          ? t('mobile.smartAccess.devices.unlockFailed', 'Unlock failed')
          : t('mobile.smartAccess.devices.lockFailed', 'Lock failed'),
        getControlErrorMessage(
          error,
          t('mobile.smartAccess.devices.controlFailed', 'Unable to control this lock over BLE.'),
        ),
      );
    } finally {
      setActiveControlId(null);
    }
  };

  const renderSelectedDeviceModal = () => {
    if (!selectedDevice) {
      return null;
    }

    const isBusy = activeControlId === selectedDevice.id;
    const isUnlocked = Boolean(deviceLockStates[selectedDevice.id]);

    return (
      <Modal
        transparent
        animationType="slide"
        visible={isSelectedDeviceModalVisible}
        onRequestClose={closeSelectedDeviceModal}
        onDismiss={() => {
          if (!isSelectedDeviceModalVisible) {
            setSelectedDevice(null);
          }
        }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeSelectedDeviceModal}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <SmartLockHeroCard
              colors={colors}
              isDark={resolvedTheme === 'dark'}
              title={selectedDevice.name}
              subtitle={
                selectedDevice.lockId
                  ? `Lock #${selectedDevice.lockId}`
                  : selectedDevice.subtitle
              }
              infoText={selectedDevice.deviceType}
              battery={deviceBatteryLevels[selectedDevice.id]}
              isUnlocked={isUnlocked}
              isBusy={isBusy}
              lockedHint={t('mobile.smartAccess.unlockDoor', 'Tap lock to unlock')}
              unlockedHint={t('mobile.smartAccess.devices.lock', 'Tap lock to lock')}
              onToggleLock={() =>
                handleControlDevice(
                  selectedDevice,
                  isUnlocked ? 'lock' : 'unlock',
                )
              }
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeSelectedDeviceModal}>
              <Text style={styles.cancelButtonText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const showCenteredState = loadingDevices || !!devicesError || devices.length === 0;

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="unlockDoorBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.gradientTop} />
            <Stop offset="100%" stopColor={colors.gradientBottom} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#unlockDoorBg)" />
      </Svg>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          showCenteredState && styles.scrollContentCentered,
          {paddingBottom: Math.max(insets.bottom, 16) + 24},
        ]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton onPress={() => navigation.goBack()} color={colors.textPrimary} />
            <Text style={styles.headerTitle}>
              {t('mobile.smartAccess.title', 'Smart Access')}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerActionButton, styles.headerTextButton]}
              onPress={() => navigation.navigate('SmartAccessHistory')}>
              <Text style={styles.headerActionText}>
                {t('mobile.smartAccess.history.title', 'History')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.refreshBtn,
                loadingDevices && styles.refreshBtnDisabled,
              ]}
              disabled={loadingDevices}
              onPress={() => loadDevices(true)}>
              {loadingDevices ? (
                <ActivityIndicator size="small" color="#3A8F86" />
              ) : (
                <RefreshActionIcon color="#3A8F86" size={16} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loadingDevices && devices.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.loaderRing}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.stateTitle}>
              {t('mobile.smartAccess.devices.loadingTitle', 'Loading devices')}
            </Text>
            <Text style={styles.stateSubtitle}>
              {t(
                'mobile.smartAccess.devices.loadingDescription',
                "We're fetching your smart access devices now.",
              )}
            </Text>
          </View>
        ) : null}

        {!loadingDevices && devicesError ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <Text style={styles.stateIconText}>!</Text>
            </View>
            <Text style={styles.stateTitle}>
              {t('mobile.smartAccess.devices.loadErrorTitle', 'Unable to load devices')}
            </Text>
            <Text style={styles.stateSubtitle}>{devicesError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadDevices(true)}>
              <Text style={styles.retryButtonText}>{t('common.mobile.common.retry', 'Retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loadingDevices && !devicesError && devices.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <Text style={styles.stateIconText}>+</Text>
            </View>
            <Text style={styles.stateTitle}>
              {t('mobile.smartAccess.devices.emptyTitle', 'No access devices available')}
            </Text>
            <Text style={styles.stateSubtitle}>
              {t(
                'mobile.smartAccess.devices.emptyDescription',
                'Contact your building manager to get access permissions.',
              )}
            </Text>
          </View>
        ) : null}

        {devices.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>
                {t(
                  devices.length === 1
                    ? 'mobile.smartAccess.devices.availableSingle'
                    : 'mobile.smartAccess.devices.availablePlural',
                  devices.length === 1 ? '1 Device Available' : '{{count}} Devices Available',
                ).replace('{{count}}', String(devices.length))}
              </Text>
            </View>

            <View
              style={[
                styles.devicesGrid,
                {width: contentWidth, alignSelf: 'center'},
              ]}>
              {devices.map(device => {
                const IconComponent = getAccessIcon(device.name);
                const isBusy = activeControlId === device.id;

                return (
                    <TouchableOpacity
                      key={device.id}
                      style={[styles.deviceCard, isBusy && styles.deviceCardBusy]}
                      activeOpacity={0.8}
                      onPress={() => openSelectedDeviceModal(device)}
                      disabled={isBusy}>
                    <View style={styles.deviceIconCircle}>
                      <IconComponent width={34} height={34} />
                    </View>

                    {isBusy ? (
                      <View style={styles.busyIndicator}>
                        <ActivityIndicator size="small" color={colors.onPrimary} />
                      </View>
                    ) : null}

                    <Text style={styles.deviceName} numberOfLines={2}>
                      {device.name}
                    </Text>

                    {device.subtitle ? (
                      <Text style={styles.deviceSubtitle} numberOfLines={1}>
                        {device.subtitle}
                      </Text>
                    ) : null}

                    <View style={styles.statusPill}>
                      <View
                        style={[
                          styles.statusDot,
                          isBusy && styles.statusDotBusy,
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {isBusy
                          ? t('mobile.smartAccess.devices.working', 'Working...')
                          : t('mobile.smartAccess.devices.ready', 'Ready')}
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

const createStyles = (colors: ThemeColors) =>
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
      backgroundColor: colors.surfaceMuted,
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
      backgroundColor: colors.surfaceMuted,
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
      backgroundColor: 'rgba(93,175,164,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.32)',
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
      backgroundColor: colors.backgroundAlt,
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
      backgroundColor: colors.surfaceMuted,
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