import React, {useEffect, useMemo, useRef, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useAppSelector} from '../../../../redux/hooks';
import {useI18n} from '../../../../i18n';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {
  getAccessDevices,
  getDeviceBleAccess,
  getResidentAccessDevices,
} from '../../services/accessDeviceService';
import {getAllResidents} from '../../services/residentDirectoryService';
import {
  addTTLockCard,
  addTTLockPasscode,
  // deleteTTLockCard,
  getInitializedSmartLocks,
} from '../../services/ttlockService';
import * as ttlockNative from '../../native/ttlockNative';

const IconWifi = ({color = '#fff'}) => (
  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="20" r="1.2" fill={color} />
  </Svg>
);

const IconPasscode = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="13" rx="2.5" stroke={color} strokeWidth="1.8" />
    <Path d="M3 10h18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Circle cx="8" cy="14.5" r="1.1" fill={color} />
    <Circle cx="12" cy="14.5" r="1.1" fill={color} />
    <Circle cx="16" cy="14.5" r="1.1" fill={color} />
    <Path d="M7 7.5V6a5 5 0 0 1 10 0v1.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const IconCard = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="2.5" y="4.5" width="19" height="15" rx="3" stroke={color} strokeWidth="1.8" />
    <Rect x="5.5" y="8" width="5.5" height="8" rx="1.4" stroke={color} strokeWidth="1.5" />
    <Path d="M13.5 9.2a3.6 3.6 0 0 1 0 5.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M16.2 7.4a6.2 6.2 0 0 1 0 9.2" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M5.8 11h4.9M5.8 13h4.9" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);

const IconFingerprint = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3C8.7 3 6.2 5.5 6.2 8.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M17.8 8.8C17.8 5.5 15.3 3 12 3" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M8.1 12.1c0-2.1 1.7-3.8 3.9-3.8 2.2 0 3.9 1.7 3.9 3.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M9.2 15.1c-.4 1.9-.3 3.7.4 5.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M14.8 15.1c.4 1.9.3 3.7-.4 5.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M6.3 13.7c0 2.8.8 5 2.4 7" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M17.7 13.7c0 2.8-.8 5-2.4 7" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M12 11.4v8.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
  </Svg>
);

const IconBattery = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7" width="16" height="10" rx="2" stroke={color} strokeWidth="1.8" />
    <Rect x="19" y="10" width="2" height="4" rx="1" fill={color} />
    <Rect x="5.5" y="9.5" width="8" height="5" rx="1" fill={color} />
  </Svg>
);

const IconTimer = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="13" r="7" stroke={color} strokeWidth="1.8" />
    <Path d="M12 13V9M12 13l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 3h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const IconSync = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M19 8a7 7 0 0 0-11.9-2.9L5 7.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 7.2V4m0 3.2h3.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 16a7 7 0 0 0 11.9 2.9L19 16.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 16.8V20m0-3.2h-3.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconSound = ({color}) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M5 14H3V10h2l4-4v12l-4-4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M14 9a4 4 0 0 1 0 6M17 7a7 7 0 0 1 0 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const FIVE_YEARS_MS = 5 * 365 * 24 * 60 * 60 * 1000;
const INT32_MAX = 2147483647;
const ADMIN_ACCENT = '#5DAFA4';
const ADMIN_ACCENT_DARK = '#3A8F86';
const ADMIN_ACCENT_SOFT = 'rgba(93,175,164,0.10)';
const PASSCODE_MIN_LENGTH = 4;
const PASSCODE_MAX_LENGTH = 9;
const PASSCODE_START_BUFFER_MS = 60 * 1000;
const FINGERPRINT_LOADER_MS = 3000;

const getBluetoothEnableMessage = t =>
  Platform.OS === 'ios'
    ? t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Turn on Bluetooth in iPhone Settings, then try again.',
      )
    : t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Enable Bluetooth, then try again.',
      );

const looksLikeGuid = value =>
  /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i.test(
    String(value || '').trim(),
  );

const pickDeviceIdCandidate = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
};

const pickGuidDeviceIdCandidate = (...values) => {
  for (const value of values) {
    const normalized = String(value || '').trim();
    if (looksLikeGuid(normalized)) {
      return normalized;
    }
  }

  return '';
};

const normalizeToStartOfDay = value => {
  const nextDate = new Date(value);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const normalizeToEndOfDay = value => {
  const nextDate = new Date(value);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const pickLockIdCandidate = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
};

const getResidentOptionName = item => {
  const firstName = String(item?.firstName || item?.FirstName || '').trim();
  const lastName = String(item?.lastName || item?.LastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return String(
    item?.name ||
    item?.Name ||
    item?.neighborName ||
    item?.neighbourName ||
    item?.fullName ||
      item?.FullName ||
      item?.email ||
      '',
  ).trim();
};

const normalizeResidentOptions = (items, currentResidentId, currentUser) => {
  const seen = new Set();
  const options = [];

  const pushOption = item => {
    const optionResidentId = String(
      item?.residentId ||
        item?.ResidentId ||
        item?.id ||
        item?.Id ||
        '',
    ).trim();

    if (!optionResidentId || seen.has(optionResidentId)) {
      return;
    }

    seen.add(optionResidentId);
    options.push({
      residentId: optionResidentId,
      name: getResidentOptionName(item) || `Resident ${optionResidentId}`,
      subtitle: String(
        item?.subtitle ||
          item?.apartmentNumber ||
          item?.neighbourApartmentNumber ||
          item?.apartmentUnit ||
          item?.email ||
          item?.mobileNumber ||
          '',
      ).trim(),
      raw: item,
    });
  };

  if (currentResidentId) {
    pushOption({
      residentId: currentResidentId,
      firstName: currentUser?.data?.firstName || currentUser?.firstName,
      lastName: currentUser?.data?.lastName || currentUser?.lastName,
      name:
        currentUser?.data?.name ||
        currentUser?.name ||
        currentUser?.data?.fullName ||
        currentUser?.fullName,
      email: currentUser?.data?.email || currentUser?.email,
      mobileNumber: currentUser?.data?.mobileNumber || currentUser?.mobileNumber,
      apartmentNumber:
        currentUser?.data?.apartmentNumber ||
        currentUser?.apartmentNumber ||
        currentUser?.data?.unitNumber ||
        currentUser?.unitNumber,
    });
  }

  if (Array.isArray(items)) {
    items.forEach(pushOption);
  }

  return options;
};

export default function TTLockScreen({navigation, route}) {
  const {colors, resolvedTheme} = useAppTheme();
  const {language, t} = useI18n();
  const styles = useMemo(() => createStyles(colors, resolvedTheme === 'dark'), [colors, resolvedTheme]);
  const smartLockCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        screenTitle: 'القفل الذكي',
        lockUnavailableTitle: 'القفل غير متاح',
        lockUnavailableMessage:
          'القفل الذكي ليس قريبًا أو فُقد اتصال البلوتوث. اقترب من القفل ثم حاول مرة أخرى.',
        lockNeedsInitializationMessage:
          'يبدو أن هذا القفل تمت إعادة تهيئته أو إزالته. يرجى إعادة تهيئة جهازك مرة أخرى.',
        commandInProgressTitle: 'يرجى الانتظار',
        commandInProgressMessage: 'يرجى إعادة التهيئة أو المحاولة مرة أخرى بعد لحظة.',
      };
    }
    if (language === 'fr') {
      return {
        screenTitle: 'Serrure intelligente',
        lockUnavailableTitle: 'Serrure indisponible',
        lockUnavailableMessage:
          "La serrure intelligente n'est pas a proximite ou la connexion Bluetooth a ete perdue. Rapprochez-vous de la serrure et reessayez.",
        lockNeedsInitializationMessage:
          "Cette serrure semble avoir ete reinitialisee ou supprimee. Veuillez initialiser votre appareil a nouveau.",
        commandInProgressTitle: 'Veuillez patienter',
        commandInProgressMessage: 'Veuillez reinitialiser ou reessayer dans un instant.',
      };
    }
    return null;
  }, [language]);

  const user = useAppSelector(state => state.auth.user);
  const residentIdFromStore =
    user?.data?.residentId ||
    user?.residentId ||
    user?.data?.ResidentId ||
    user?.ResidentId ||
    '';
  const routeDeviceId = pickDeviceIdCandidate(
    route?.params?.deviceId,
    route?.params?.DeviceId,
    route?.params?.id,
    route?.params?.Id,
    route?.params?.accessDeviceId,
    route?.params?.AccessDeviceId,
    route?.params?.residentDeviceId,
    route?.params?.ResidentDeviceId,
    route?.params?.smartAccessDeviceId,
    route?.params?.SmartAccessDeviceId,
    route?.params?.raw?.deviceId,
    route?.params?.raw?.DeviceId,
    route?.params?.raw?.id,
    route?.params?.raw?.Id,
    route?.params?.raw?.accessDeviceId,
    route?.params?.raw?.AccessDeviceId,
    route?.params?.raw?.residentDeviceId,
    route?.params?.raw?.ResidentDeviceId,
    route?.params?.raw?.smartAccessDeviceId,
    route?.params?.raw?.SmartAccessDeviceId,
  );
  const lockName = route?.params?.lockAlias || t('mobile.ttlock.admin.defaultLockName', 'Smart Lock');
  const lockId = pickLockIdCandidate(
    route?.params?.lockId,
    route?.params?.LockId,
    route?.params?.raw?.lockId,
    route?.params?.raw?.LockId,
  );
  const mac = route?.params?.mac;
  const routeLockData = route?.params?.lockData;

  const [activeAction, setActiveAction] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [pendingCardNumber, setPendingCardNumber] = useState('');
  const [bleAccess, setBleAccess] = useState(null);
  const [resolvedDeviceId, setResolvedDeviceId] = useState(routeDeviceId || '');
  const [resolvedLockId, setResolvedLockId] = useState(lockId || '');
  const [muteEnabled, setMuteEnabled] = useState(null);
  const [residentId, setResidentId] = useState(residentIdFromStore);
  const [residentOptions, setResidentOptions] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [residentOptionsLoading, setResidentOptionsLoading] = useState(false);
  const [cardStartDate, setCardStartDate] = useState(() => normalizeToStartOfDay(new Date()));
  const [cardEndDate, setCardEndDate] = useState(() => {
    const nextDate = new Date();
    nextDate.setFullYear(nextDate.getFullYear() + 5);
    return normalizeToEndOfDay(nextDate);
  });
  const [showCardStartDatePicker, setShowCardStartDatePicker] = useState(false);
  const [showCardEndDatePicker, setShowCardEndDatePicker] = useState(false);
  const [knownBatteryLevel, setKnownBatteryLevel] = useState(null);
  const [infoModal, setInfoModal] = useState({
    visible: false,
    title: '',
    message: '',
    loading: false,
  });
  const fingerprintLoaderTimeoutRef = useRef(null);
  const infoModalAutoHideTimeoutRef = useRef(null);
  const actionTokenRef = useRef(0);
  const fingerprintTimedOutRef = useRef(false);

  useEffect(() => {
    console.log('[TTLockScreen] modalType changed:', modalType);
  }, [modalType]);

  useEffect(() => {
    console.log('[TTLockScreen] passcode length changed:', passcode.length);
  }, [passcode]);

  useEffect(() => {
    console.log('[TTLockScreen] card number length changed:', cardNumber.length);
  }, [cardNumber]);

  useEffect(() => {
    setResolvedDeviceId(routeDeviceId || '');
  }, [routeDeviceId]);

  useEffect(() => {
    setResolvedLockId(lockId || '');
  }, [lockId]);

  useEffect(() => {
    return () => {
      if (fingerprintLoaderTimeoutRef.current) {
        clearTimeout(fingerprintLoaderTimeoutRef.current);
      }
      if (infoModalAutoHideTimeoutRef.current) {
        clearTimeout(infoModalAutoHideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const resolveResidentId = async () => {
      if (residentIdFromStore) {
        setResidentId(String(residentIdFromStore));
        return;
      }

      try {
        const storedResidentId = await AsyncStorage.getItem('residentId');
        if (!cancelled && storedResidentId) {
          setResidentId(String(storedResidentId));
        }
      } catch {}
    };

    resolveResidentId();
    return () => {
      cancelled = true;
    };
  }, [residentIdFromStore]);

  useEffect(() => {
    let cancelled = false;

    const resolveDeviceId = async () => {
      if (routeDeviceId) {
        return;
      }

      try {
        const adminLocks = await getInitializedSmartLocks();
        const matchedAdminLock = adminLocks.find(item =>
          (lockId && item.lockId && String(item.lockId) === String(lockId)) ||
          (mac && item.mac && item.mac.toLowerCase() === String(mac).toLowerCase()) ||
          (lockName &&
            (item.lockAlias?.toLowerCase() === String(lockName).toLowerCase() ||
              item.lockName?.toLowerCase() === String(lockName).toLowerCase())),
        );

        if (!cancelled && matchedAdminLock?.deviceId) {
          setResolvedDeviceId(matchedAdminLock.deviceId);
          return;
        }
      } catch {}
    };

    resolveDeviceId();
    return () => {
      cancelled = true;
    };
  }, [routeDeviceId, lockId, mac, lockName]);

  useEffect(() => {
    let cancelled = false;

    const resolveKnownBatteryLevel = async () => {
      const routeBatteryCandidates = [
        route?.params?.battery,
        route?.params?.electricQuantity,
        route?.params?.raw?.battery,
        route?.params?.raw?.electricQuantity,
        route?.params?.raw?.ElectricQuantity,
      ];
      const directBattery = routeBatteryCandidates.find(
        value => typeof value === 'number' && Number.isFinite(value),
      );
      if (typeof directBattery === 'number') {
        if (!cancelled) {
          setKnownBatteryLevel(directBattery);
        }
        return;
      }

      try {
        const adminLocks = await getInitializedSmartLocks();
        const matchedAdminLock = adminLocks.find(item =>
          (lockId && item.lockId && String(item.lockId) === String(lockId)) ||
          (resolvedDeviceId && item.deviceId && String(item.deviceId) === String(resolvedDeviceId)) ||
          (mac && item.mac && item.mac.toLowerCase() === String(mac).toLowerCase()) ||
          (lockName &&
            (item.lockAlias?.toLowerCase() === String(lockName).toLowerCase() ||
              item.lockName?.toLowerCase() === String(lockName).toLowerCase())),
        );

        if (!cancelled) {
          setKnownBatteryLevel(
            typeof matchedAdminLock?.battery === 'number' ? matchedAdminLock.battery : null,
          );
        }
      } catch {
        if (!cancelled) {
          setKnownBatteryLevel(null);
        }
      }
    };

    resolveKnownBatteryLevel();
    return () => {
      cancelled = true;
    };
  }, [route, lockId, mac, lockName, resolvedDeviceId]);

  const resolveResidentIdForAction = async () => {
    if (residentId) {
      return String(residentId);
    }

    if (residentIdFromStore) {
      const nextResidentId = String(residentIdFromStore);
      setResidentId(nextResidentId);
      return nextResidentId;
    }

    const storedResidentId = await AsyncStorage.getItem('residentId');
    if (storedResidentId) {
      const nextResidentId = String(storedResidentId);
      setResidentId(nextResidentId);
      return nextResidentId;
    }

    return '';
  };

  const requestBluetoothPermissionsForAction = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const permissions =
      Platform.Version >= 31
        ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
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

  const ensureBluetoothReadyForAction = async () => {
    const hasPermission = await requestBluetoothPermissionsForAction();

    if (!hasPermission) {
      throw new Error(
        t(
          'mobile.ttlock.permissionRequiredMessage',
          'Bluetooth permission is required to use lock actions. Please allow Bluetooth permission and try again.',
        ),
      );
    }

    const enabled = await ttlockNative.isBluetoothEnabled();
    if (enabled) {
      return true;
    }

    if (Platform.OS === 'android') {
      await ttlockNative.requestBluetoothEnable();
    }

    throw new Error(
      getBluetoothEnableMessage(t),
    );
  };

  const resolveDeviceIdForAction = async currentResidentId => {
    if (looksLikeGuid(resolvedDeviceId)) {
      console.log('[TTLockScreen] resolveDeviceIdForAction: using resolvedDeviceId', {
        currentResidentId,
        resolvedDeviceId,
      });
      return String(resolvedDeviceId);
    }

    const bleDeviceId = pickGuidDeviceIdCandidate(
      bleAccess?.deviceId,
      bleAccess?.raw?.deviceId,
      bleAccess?.raw?.DeviceId,
      bleAccess?.raw?.deviceGuid,
      bleAccess?.raw?.DeviceGuid,
      bleAccess?.raw?.accessDeviceId,
      bleAccess?.raw?.AccessDeviceId,
      bleAccess?.raw?.accessDeviceGuid,
      bleAccess?.raw?.AccessDeviceGuid,
      bleAccess?.raw?.residentDeviceGuid,
      bleAccess?.raw?.ResidentDeviceGuid,
      bleAccess?.raw?.smartAccessDeviceGuid,
      bleAccess?.raw?.SmartAccessDeviceGuid,
      bleAccess?.raw?.guid,
      bleAccess?.raw?.Guid,
    );
    if (bleDeviceId) {
      console.log('[TTLockScreen] resolveDeviceIdForAction: using BLE device id', {
        currentResidentId,
        bleDeviceId,
      });
      setResolvedDeviceId(bleDeviceId);
      return bleDeviceId;
    }

    if (looksLikeGuid(routeDeviceId)) {
      const nextDeviceId = String(routeDeviceId);
      console.log('[TTLockScreen] resolveDeviceIdForAction: using route device id', {
        currentResidentId,
        routeDeviceId: nextDeviceId,
      });
      setResolvedDeviceId(nextDeviceId);
      return nextDeviceId;
    }

    try {
      const adminLocks = await getInitializedSmartLocks();
      console.log('[TTLockScreen] resolveDeviceIdForAction: checking admin locks', {
        currentResidentId,
        adminLockCount: adminLocks.length,
        lockId,
        mac,
        lockName,
      });
      const matchedAdminLock = adminLocks.find(item =>
        (lockId && item.lockId && String(item.lockId) === String(lockId)) ||
        (mac && item.mac && item.mac.toLowerCase() === String(mac).toLowerCase()) ||
        (lockName &&
          (item.lockAlias?.toLowerCase() === String(lockName).toLowerCase() ||
            item.lockName?.toLowerCase() === String(lockName).toLowerCase())),
      );

      if (matchedAdminLock?.deviceId) {
        const nextDeviceId = String(matchedAdminLock.deviceId);
        console.log('[TTLockScreen] resolveDeviceIdForAction: matched admin lock device id', {
          currentResidentId,
          nextDeviceId,
          matchedAdminLock,
        });
        setResolvedDeviceId(nextDeviceId);
        if (matchedAdminLock.lockId) {
          setResolvedLockId(String(matchedAdminLock.lockId));
        }
        return nextDeviceId;
      }

      const rawAdminDeviceId = pickGuidDeviceIdCandidate(
        matchedAdminLock?.raw?.deviceId,
        matchedAdminLock?.raw?.DeviceId,
        matchedAdminLock?.raw?.deviceGuid,
        matchedAdminLock?.raw?.DeviceGuid,
        matchedAdminLock?.raw?.accessDeviceId,
        matchedAdminLock?.raw?.AccessDeviceId,
        matchedAdminLock?.raw?.accessDeviceGuid,
        matchedAdminLock?.raw?.AccessDeviceGuid,
        matchedAdminLock?.raw?.residentDeviceId,
        matchedAdminLock?.raw?.ResidentDeviceId,
        matchedAdminLock?.raw?.residentDeviceGuid,
        matchedAdminLock?.raw?.ResidentDeviceGuid,
        matchedAdminLock?.raw?.smartAccessDeviceId,
        matchedAdminLock?.raw?.SmartAccessDeviceId,
        matchedAdminLock?.raw?.smartAccessDeviceGuid,
        matchedAdminLock?.raw?.SmartAccessDeviceGuid,
        matchedAdminLock?.raw?.guid,
        matchedAdminLock?.raw?.Guid,
        looksLikeGuid(matchedAdminLock?.raw?.id) ? matchedAdminLock?.raw?.id : '',
        looksLikeGuid(matchedAdminLock?.raw?.Id) ? matchedAdminLock?.raw?.Id : '',
      );
      if (rawAdminDeviceId) {
        console.log('[TTLockScreen] resolveDeviceIdForAction: matched raw admin device id', {
          currentResidentId,
          rawAdminDeviceId,
          matchedAdminLock,
        });
        setResolvedDeviceId(rawAdminDeviceId);
        return rawAdminDeviceId;
      }
    } catch (error) {
      console.log('[TTLockScreen] resolveDeviceIdForAction: admin lock lookup failed', {
        currentResidentId,
        error,
      });
    }

    console.log('[TTLockScreen] resolveDeviceIdForAction: no device id found from direct lock sources', {
      currentResidentId,
      resolvedDeviceId,
      routeDeviceId,
      bleDeviceId,
      lockId,
      mac,
      lockName,
    });
    return '';
  };

  const getFinalDeviceIdForAssignment = async currentResidentId => {
    const resolvedActionDeviceId = await resolveDeviceIdForAction(currentResidentId);
    if (resolvedActionDeviceId) {
      console.log('[TTLockScreen] getFinalDeviceIdForAssignment: resolved from lookup', {
        currentResidentId,
        resolvedActionDeviceId,
      });
      return String(resolvedActionDeviceId);
    }

    const fallbackDeviceId = pickDeviceIdCandidate(
      resolvedDeviceId,
      routeDeviceId,
      route?.params?.deviceId,
      route?.params?.DeviceId,
      route?.params?.deviceGuid,
      route?.params?.DeviceGuid,
      route?.params?.id,
      route?.params?.Id,
      route?.params?.accessDeviceId,
      route?.params?.AccessDeviceId,
      route?.params?.accessDeviceGuid,
      route?.params?.AccessDeviceGuid,
      route?.params?.residentDeviceId,
      route?.params?.ResidentDeviceId,
      route?.params?.residentDeviceGuid,
      route?.params?.ResidentDeviceGuid,
      route?.params?.smartAccessDeviceId,
      route?.params?.SmartAccessDeviceId,
      route?.params?.smartAccessDeviceGuid,
      route?.params?.SmartAccessDeviceGuid,
      route?.params?.guid,
      route?.params?.Guid,
      route?.params?.raw?.deviceId,
      route?.params?.raw?.DeviceId,
      route?.params?.raw?.deviceGuid,
      route?.params?.raw?.DeviceGuid,
      route?.params?.raw?.id,
      route?.params?.raw?.Id,
      route?.params?.raw?.accessDeviceId,
      route?.params?.raw?.AccessDeviceId,
      route?.params?.raw?.accessDeviceGuid,
      route?.params?.raw?.AccessDeviceGuid,
      route?.params?.raw?.residentDeviceId,
      route?.params?.raw?.ResidentDeviceId,
      route?.params?.raw?.residentDeviceGuid,
      route?.params?.raw?.ResidentDeviceGuid,
      route?.params?.raw?.smartAccessDeviceId,
      route?.params?.raw?.SmartAccessDeviceId,
      route?.params?.raw?.smartAccessDeviceGuid,
      route?.params?.raw?.SmartAccessDeviceGuid,
      route?.params?.raw?.guid,
      route?.params?.raw?.Guid,
      bleAccess?.deviceId,
      bleAccess?.raw?.deviceId,
      bleAccess?.raw?.DeviceId,
      bleAccess?.raw?.deviceGuid,
      bleAccess?.raw?.DeviceGuid,
      bleAccess?.raw?.accessDeviceId,
      bleAccess?.raw?.AccessDeviceId,
      bleAccess?.raw?.accessDeviceGuid,
      bleAccess?.raw?.AccessDeviceGuid,
      bleAccess?.raw?.residentDeviceId,
      bleAccess?.raw?.ResidentDeviceId,
      bleAccess?.raw?.residentDeviceGuid,
      bleAccess?.raw?.ResidentDeviceGuid,
      bleAccess?.raw?.smartAccessDeviceId,
      bleAccess?.raw?.SmartAccessDeviceId,
      bleAccess?.raw?.smartAccessDeviceGuid,
      bleAccess?.raw?.SmartAccessDeviceGuid,
      bleAccess?.raw?.guid,
      bleAccess?.raw?.Guid,
    );

    if (fallbackDeviceId) {
      console.log('[TTLockScreen] getFinalDeviceIdForAssignment: using fallback device id', {
        currentResidentId,
        fallbackDeviceId,
        resolvedDeviceId,
        routeDeviceId,
        bleDeviceId: bleAccess?.deviceId,
      });
      setResolvedDeviceId(fallbackDeviceId);
      return fallbackDeviceId;
    }

    try {
      const accessDevices = await getAccessDevices();
      console.log('[TTLockScreen] getFinalDeviceIdForAssignment: checking access devices', {
        accessDeviceCount: accessDevices.length,
        lockId,
        mac,
        lockName,
      });

      const matchedAccessDevice = accessDevices.find(matchesCurrentLock);
      const fallbackAccessDevice = accessDevices.find(item =>
        Boolean(
          pickDeviceIdCandidate(
            item?.id,
            item?.raw?.deviceId,
            item?.raw?.DeviceId,
            item?.raw?.accessDeviceId,
            item?.raw?.AccessDeviceId,
            item?.raw?.residentDeviceId,
            item?.raw?.ResidentDeviceId,
            item?.raw?.smartAccessDeviceId,
            item?.raw?.SmartAccessDeviceId,
          ),
        ),
      );
      const selectedAccessDevice = matchedAccessDevice || fallbackAccessDevice;
      const accessDeviceId = pickDeviceIdCandidate(
        selectedAccessDevice?.id,
        selectedAccessDevice?.raw?.deviceId,
        selectedAccessDevice?.raw?.DeviceId,
        selectedAccessDevice?.raw?.accessDeviceId,
        selectedAccessDevice?.raw?.AccessDeviceId,
        selectedAccessDevice?.raw?.residentDeviceId,
        selectedAccessDevice?.raw?.ResidentDeviceId,
        selectedAccessDevice?.raw?.smartAccessDeviceId,
        selectedAccessDevice?.raw?.SmartAccessDeviceId,
      );

      if (accessDeviceId) {
        console.log('[TTLockScreen] getFinalDeviceIdForAssignment: using access device id', {
          accessDeviceId,
          matchedAccessDevice,
          fallbackAccessDevice,
          selectedAccessDevice,
        });
        setResolvedDeviceId(accessDeviceId);
        return accessDeviceId;
      }
    } catch (error) {
      console.log('[TTLockScreen] getFinalDeviceIdForAssignment: access devices lookup failed', {
        error,
      });
    }

    if (currentResidentId) {
      try {
        const residentDevices = await getResidentAccessDevices(String(currentResidentId));
        console.log('[TTLockScreen] getFinalDeviceIdForAssignment: checking resident access devices', {
          currentResidentId,
          residentDeviceCount: residentDevices.length,
          lockId,
          mac,
          lockName,
        });

        const matchedResidentDevice = residentDevices.find(matchesCurrentLock);
        const fallbackResidentDevice = residentDevices.find(item =>
          Boolean(
            pickDeviceIdCandidate(
              item?.id,
              item?.raw?.deviceId,
              item?.raw?.DeviceId,
              item?.raw?.accessDeviceId,
              item?.raw?.AccessDeviceId,
              item?.raw?.residentDeviceId,
              item?.raw?.ResidentDeviceId,
              item?.raw?.smartAccessDeviceId,
              item?.raw?.SmartAccessDeviceId,
            ),
          ),
        );
        const selectedResidentDevice = matchedResidentDevice || fallbackResidentDevice;
        const residentDeviceId = pickDeviceIdCandidate(
          selectedResidentDevice?.id,
          selectedResidentDevice?.raw?.deviceId,
          selectedResidentDevice?.raw?.DeviceId,
          selectedResidentDevice?.raw?.accessDeviceId,
          selectedResidentDevice?.raw?.AccessDeviceId,
          selectedResidentDevice?.raw?.residentDeviceId,
          selectedResidentDevice?.raw?.ResidentDeviceId,
          selectedResidentDevice?.raw?.smartAccessDeviceId,
          selectedResidentDevice?.raw?.SmartAccessDeviceId,
        );

        if (residentDeviceId) {
          console.log('[TTLockScreen] getFinalDeviceIdForAssignment: using resident access device id', {
            currentResidentId,
            residentDeviceId,
            matchedResidentDevice,
            fallbackResidentDevice,
            selectedResidentDevice,
          });
          setResolvedDeviceId(residentDeviceId);
          return residentDeviceId;
        }
      } catch (error) {
        console.log('[TTLockScreen] getFinalDeviceIdForAssignment: resident access lookup failed', {
          currentResidentId,
          error,
        });
      }
    }

    console.log('[TTLockScreen] getFinalDeviceIdForAssignment: no fallback device id available', {
      currentResidentId,
      resolvedDeviceId,
      routeDeviceId,
      routeParams: route?.params,
      bleAccess,
    });
    return '';
  };

  const getFinalLockIdForAssignment = async currentResidentId => {
    if (resolvedLockId) {
      return String(resolvedLockId);
    }

    const fallbackLockId = pickLockIdCandidate(
      lockId,
      route?.params?.lockId,
      route?.params?.LockId,
      route?.params?.raw?.lockId,
      route?.params?.raw?.LockId,
      bleAccess?.raw?.lockId,
      bleAccess?.raw?.LockId,
    );

    if (fallbackLockId) {
      setResolvedLockId(fallbackLockId);
      return fallbackLockId;
    }

    return '';
  };

  const ensureBleAccess = async () => {
    await ensureBluetoothReadyForAction();

    if (bleAccess?.lockData && bleAccess?.lockMac) {
      return bleAccess;
    }

    if (routeLockData && mac) {
      const directAccess = {
        deviceId: resolvedDeviceId || '',
        deviceName: lockName,
        lockData: routeLockData,
        lockMac: mac,
        raw: route?.params || {},
      };
      setBleAccess(directAccess);
      return directAccess;
    }

    const currentResidentId = await resolveResidentIdForAction();
    const currentDeviceId = await resolveDeviceIdForAction(currentResidentId);

    if (!currentDeviceId) {
      throw new Error('This lock is missing a backend device id for this action.');
    }

    if (!currentResidentId) {
      throw new Error('Resident id is required for BLE access.');
    }

    const result = await getDeviceBleAccess(currentDeviceId, currentResidentId);
    setBleAccess(result);
    return result;
  };

  const loadResidentOptions = async targetResidentId => {
    setResidentOptionsLoading(true);

    try {
      const residents = await getAllResidents();
      const options = normalizeResidentOptions(residents, targetResidentId, user);
      setResidentOptions(options);
      setSelectedResidentId(previousValue => {
        if (previousValue && options.some(item => item.residentId === previousValue)) {
          return previousValue;
        }

        return options[0]?.residentId || '';
      });
      return options;
    } finally {
      setResidentOptionsLoading(false);
    }
  };

  const refreshMuteState = async () => {
    try {
      const access = await ensureBleAccess();
      const result = await ttlockNative.getMuteModeState(access.lockData, access.lockMac);
      setMuteEnabled(Boolean(result?.enabled));
      return Boolean(result?.enabled);
    } catch {
      return null;
    }
  };

  const openInfoModal = ({title, message, loading = false}) => {
    if (!message) {
      return;
    }

    if (infoModalAutoHideTimeoutRef.current) {
      clearTimeout(infoModalAutoHideTimeoutRef.current);
      infoModalAutoHideTimeoutRef.current = null;
    }

    setInfoModal({
      visible: true,
      title,
      message,
      loading,
    });
  };

  const closeInfoModal = () => {
    if (infoModalAutoHideTimeoutRef.current) {
      clearTimeout(infoModalAutoHideTimeoutRef.current);
      infoModalAutoHideTimeoutRef.current = null;
    }
    setInfoModal(prev => ({
      ...prev,
      visible: false,
      loading: false,
    }));
  };

  const clearFingerprintLoaderTimeout = () => {
    if (fingerprintLoaderTimeoutRef.current) {
      clearTimeout(fingerprintLoaderTimeoutRef.current);
      fingerprintLoaderTimeoutRef.current = null;
    }
  };

  const getLockNeedsInitializationMessage = () =>
    smartLockCopy?.lockNeedsInitializationMessage ||
    t(
      'mobile.ttlock.lockNeedsInitializationMessage',
      'This lock appears to have been reset or removed. Please initialize your device again.',
    );

  const matchesCurrentLock = item => {
    if (!item) {
      return false;
    }

    const itemLockId = pickLockIdCandidate(
      item.lockId,
      item.raw?.lockId,
      item.raw?.LockId,
    );
    const itemDeviceId = pickDeviceIdCandidate(
      item.deviceId,
      item.id,
      item.raw?.deviceId,
      item.raw?.DeviceId,
      item.raw?.accessDeviceId,
      item.raw?.AccessDeviceId,
      item.raw?.residentDeviceId,
      item.raw?.ResidentDeviceId,
      item.raw?.smartAccessDeviceId,
      item.raw?.SmartAccessDeviceId,
    );
    const itemMac = String(
      item.mac ||
        item.lockMac ||
        item.raw?.mac ||
        item.raw?.Mac ||
        item.raw?.lockMac ||
        item.raw?.LockMac ||
        '',
    )
      .trim()
      .toLowerCase();
    const itemName = String(
      item.lockAlias ||
        item.lockName ||
        item.name ||
        item.raw?.lockAlias ||
        item.raw?.LockAlias ||
        item.raw?.lockName ||
        item.raw?.LockName ||
        '',
    )
      .trim()
      .toLowerCase();

    return (
      (resolvedLockId && itemLockId && String(itemLockId) === String(resolvedLockId)) ||
      (lockId && itemLockId && String(itemLockId) === String(lockId)) ||
      (resolvedDeviceId && itemDeviceId && String(itemDeviceId) === String(resolvedDeviceId)) ||
      (routeDeviceId && itemDeviceId && String(itemDeviceId) === String(routeDeviceId)) ||
      (mac && itemMac && itemMac === String(mac).trim().toLowerCase()) ||
      (lockName && itemName && itemName === String(lockName).trim().toLowerCase())
    );
  };

  const isCurrentLockStillConfigured = async () => {
    try {
      const adminLocks = await getInitializedSmartLocks();
      if (adminLocks.some(matchesCurrentLock)) {
        return true;
      }
    } catch {}

    const currentResidentId = await resolveResidentIdForAction();
    if (!currentResidentId) {
      return false;
    }

    try {
      const devices = await getResidentAccessDevices(String(currentResidentId));
      return devices.some(matchesCurrentLock);
    } catch {
      return false;
    }
  };

  const getActionErrorMessage = (error, fallback) => {
    const rawMessage =
      typeof error === 'string'
        ? error
        : typeof error?.message === 'string'
          ? error.message
          : '';
    const normalizedMessage = String(rawMessage || '').trim().toLowerCase();

    if (
      normalizedMessage.includes('permission denied') ||
      normalizedMessage.includes('access denied')
    ) {
      return t(
        'mobile.ttlock.permissionDeniedActionMessage',
        'You do not have access to add this item for this lock. Please contact your building manager or admin.',
      );
    }

    if (ttlockNative.isTTLockCommandInProgressError(error)) {
      return smartLockCopy?.commandInProgressMessage || fallback;
    }

    if (ttlockNative.isTTLockNearbyError(error)) {
      return smartLockCopy?.lockUnavailableMessage || fallback;
    }

    if (ttlockNative.isTTLockBluetoothDisabledError(error)) {
      return t(
        'mobile.smartAccess.devices.bluetoothRequiredMessage',
        'Enable Bluetooth, then try again.',
      );
    }

    return ttlockNative.getTTLockUserFacingErrorMessage(error, fallback);
  };

  const getActionErrorTitle = error => {
    const rawMessage =
      typeof error === 'string'
        ? error
        : typeof error?.message === 'string'
          ? error.message
          : '';
    const normalizedMessage = String(rawMessage || '').trim().toLowerCase();

    if (
      normalizedMessage.includes('permission denied') ||
      normalizedMessage.includes('access denied')
    ) {
      return t('mobile.ttlock.permissionDeniedActionTitle', 'Access denied');
    }

    return t('mobile.ttlock.requestFailedTitle', 'Request failed');
  };

  const validateCardAssignmentPayload = ({
    residentId: residentIdValue,
    deviceId: deviceIdValue,
    lockId: lockIdValue,
    cardNumber: cardNumberValue,
    startDate,
    endDate,
  }) => {
    if (!String(residentIdValue || '').trim()) {
      return t(
        'mobile.ttlock.cardAssignResidentRequiredMessage',
        'Select a resident before assigning this card.',
      );
    }

    if (!/^\d+$/.test(String(cardNumberValue || '').trim())) {
      return t(
        'mobile.ttlock.invalidCardMessage',
        'Enter a valid numeric card number.',
      );
    }

    const normalizedCardNumber = Number(cardNumberValue);
    if (!Number.isSafeInteger(normalizedCardNumber) || normalizedCardNumber <= 0) {
      return t(
        'mobile.ttlock.invalidCardMessage',
        'Enter a valid numeric card number.',
      );
    }

    if (normalizedCardNumber > INT32_MAX) {
      return t(
        'mobile.ttlock.cardAssignCardNumberTooLargeMessage',
        'This card number is larger than the backend currently accepts. Please update the TTLock card assignment API to accept 64-bit card numbers.',
      );
    }

    if (!Number.isFinite(startDate) || !Number.isFinite(endDate) || endDate < startDate) {
      return t(
        'mobile.ttlock.cardAssignDateInvalidMessage',
        'Select a valid card date range.',
      );
    }

    return '';
  };

  const showLockUnavailableAlert = message => {
      const resolvedMessage =
        message === 'Please try again in a moment.'
          ? smartLockCopy?.commandInProgressMessage ||
            t(
              'mobile.ttlock.commandInProgressMessage',
              'Please re-initialize or try again in a moment.',
            )
          : message;
      Alert.alert(
      smartLockCopy?.lockUnavailableTitle || t('mobile.ttlock.lockUnavailableTitle', 'Lock unavailable'),
      resolvedMessage || smartLockCopy?.lockUnavailableMessage || t(
        'mobile.ttlock.lockUnavailableMessage',
        'This lock is not connected nearby right now. Move closer to the lock and try again.',
      ),
      [{text: t('common.mobile.common.ok', 'OK')}],
    );
  };

  const getUnavailableLockMessage = async error => {
    if (ttlockNative.isTTLockCommandInProgressError(error)) {
      return (
        smartLockCopy?.commandInProgressMessage ||
        t(
          'mobile.ttlock.commandInProgressMessage',
          'Please re-initialize or try again in a moment.',
        )
      );
    }

    const rawMessage =
      typeof error === 'string'
        ? error
        : typeof error?.message === 'string'
          ? error.message
          : '';

    if (
      rawMessage &&
      rawMessage.toLowerCase().includes('missing a backend device id')
    ) {
      return getLockNeedsInitializationMessage();
    }

    if (ttlockNative.isTTLockNearbyError(error)) {
      const lockStillConfigured = await isCurrentLockStillConfigured();
      return lockStillConfigured
        ? smartLockCopy?.lockUnavailableMessage ||
            t(
              'mobile.ttlock.lockUnavailableMessage',
              'This lock is not connected nearby right now. Move closer to the lock and try again.',
            )
        : getLockNeedsInitializationMessage();
    }

    return getActionErrorMessage(
      error,
      smartLockCopy?.lockUnavailableMessage ||
        t(
          'mobile.ttlock.lockUnavailableMessage',
          'This lock is not connected nearby right now. Move closer to the lock and try again.',
        ),
    );
  };

  const canStartAction = () => {
    if (activeAction) {
      return false;
    }

    return true;
  };

  const beginAction = actionId => {
    if (activeAction) {
      return null;
    }

    clearFingerprintLoaderTimeout();
    fingerprintTimedOutRef.current = false;
    closeInfoModal();
    const nextToken = actionTokenRef.current + 1;
    actionTokenRef.current = nextToken;
    setActiveAction(actionId);
    return nextToken;
  };

  const finishAction = actionToken => {
    if (actionTokenRef.current === actionToken) {
      setActiveAction(null);
    }
  };

  const scheduleFingerprintLoaderStop = actionToken => {
    clearFingerprintLoaderTimeout();
    fingerprintLoaderTimeoutRef.current = setTimeout(() => {
      fingerprintTimedOutRef.current = true;
      closeInfoModal();
      finishAction(actionToken);
      fingerprintLoaderTimeoutRef.current = null;
    }, FINGERPRINT_LOADER_MS);
  };

  const ensureNearbyLockAccess = async () => {
    try {
      const access = await ensureBleAccess();
      await ttlockNative.getLockTime(access.lockData, access.lockMac);
      return access;
    } catch (error) {
      showLockUnavailableAlert(await getUnavailableLockMessage(error));
      return null;
    }
  };

  const actionItems = [
    {
      id: 'passcodes',
      label: t('mobile.ttlock.actions.passcodes', 'Passcodes'),
      icon: () => <IconPasscode color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        console.log('[TTLockScreen] opening add-passcode modal');
        setPasscode('');
        setModalType('add-passcode');
      },
    },
    {
      id: 'battery',
      label: t('mobile.ttlock.actions.battery', 'Battery'),
      icon: () => <IconBattery color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        const access = await ensureNearbyLockAccess();
        if (!access) {
          return;
        }
        const actionToken = beginAction('battery');
        if (!actionToken) {
          return;
        }
        try {
          const result = await ttlockNative.getBatteryLevel(access.lockData, access.lockMac);
          if (actionTokenRef.current === actionToken) {
            openInfoModal({
              title: t('mobile.ttlock.batteryInfoTitle', 'Battery'),
              message: t('mobile.ttlock.batteryLevelMessage', 'Battery level: {{level}}%').replace('{{level}}', String(result?.battery ?? 0)),
            });
          }
        } catch (error) {
          if (actionTokenRef.current === actionToken) {
            Alert.alert(
              t('mobile.ttlock.batteryFailedTitle', 'Battery failed'),
              getActionErrorMessage(
                error,
                t('mobile.ttlock.batteryFailedMessage', 'Unable to read battery level.'),
              ),
            );
          }
        } finally {
          finishAction(actionToken);
        }
      },
    },
    {
      id: 'timesync',
      label: t('mobile.ttlock.actions.timeSync', 'Time Sync'),
      icon: () => <IconSync color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        const access = await ensureNearbyLockAccess();
        if (!access) {
          return;
        }
        const actionToken = beginAction('timesync');
        if (!actionToken) {
          return;
        }
        try {
          await ttlockNative.setLockTime(Date.now(), access.lockData, access.lockMac);
          if (actionTokenRef.current === actionToken) {
            openInfoModal({
              title: t('mobile.ttlock.timeSyncTitle', 'Time Sync'),
              message: t('mobile.ttlock.timeSyncSuccess', 'Lock time was updated successfully.'),
            });
          }
        } catch (error) {
          if (actionTokenRef.current === actionToken) {
            Alert.alert(
              t('mobile.ttlock.timeSyncFailedTitle', 'Time sync failed'),
              getActionErrorMessage(
                error,
                t('mobile.ttlock.timeSyncFailedMessage', 'Unable to sync lock time.'),
              ),
            );
          }
        } finally {
          finishAction(actionToken);
        }
      },
    },
    {
      id: 'autolock',
      label: t('mobile.ttlock.actions.autoLock', 'Auto Lock'),
      icon: () => <IconTimer color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        const access = await ensureNearbyLockAccess();
        if (!access) {
          return;
        }
        const actionToken = beginAction('autolock');
        if (!actionToken) {
          return;
        }
        try {
          await ttlockNative.setAutomaticLockingPeriod(10, access.lockData, access.lockMac);
          if (actionTokenRef.current === actionToken) {
            openInfoModal({
              title: t('mobile.ttlock.autoLockTitle', 'Auto Lock'),
              message: t('mobile.ttlock.autoLockSuccess', 'Auto lock was set to 10 seconds.'),
            });
          }
        } catch (error) {
          if (actionTokenRef.current === actionToken) {
            Alert.alert(
              t('mobile.ttlock.autoLockFailedTitle', 'Auto lock failed'),
              getActionErrorMessage(
                error,
                t('mobile.ttlock.autoLockFailedMessage', 'Unable to set auto lock.'),
              ),
            );
          }
        } finally {
          finishAction(actionToken);
        }
      },
    },
    {
      id: 'sound',
      label: muteEnabled
        ? t('mobile.ttlock.actions.soundOff', 'Sound Off')
        : t('mobile.ttlock.actions.soundOn', 'Sound On'),
      icon: () => <IconSound color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        const access = await ensureNearbyLockAccess();
        if (!access) {
          return;
        }
        const actionToken = beginAction('sound');
        if (!actionToken) {
          return;
        }
        try {
          const currentMuteState =
            typeof muteEnabled === 'boolean'
              ? muteEnabled
              : Boolean(
                  (await ttlockNative.getMuteModeState(
                    access.lockData,
                    access.lockMac,
                  ))?.enabled,
                );
          const nextMuteState = !Boolean(currentMuteState);
          const result = await ttlockNative.setMuteMode(
            nextMuteState,
            access.lockData,
            access.lockMac,
          );
          setMuteEnabled(Boolean(result?.enabled));
          if (actionTokenRef.current === actionToken) {
            openInfoModal({
              title: t('mobile.ttlock.soundTitle', 'Sound'),
              message:
                result?.enabled
                  ? t('mobile.ttlock.soundMuted', 'Lock sound is muted now.')
                  : t('mobile.ttlock.soundEnabled', 'Lock sound is enabled now.'),
            });
          }
        } catch (error) {
          if (actionTokenRef.current === actionToken) {
            Alert.alert(
              t('mobile.ttlock.soundFailedTitle', 'Sound failed'),
              getActionErrorMessage(
                error,
                t('mobile.ttlock.soundFailedMessage', 'Unable to update sound mode.'),
              ),
            );
          }
        } finally {
          finishAction(actionToken);
        }
      },
    },
    {
      id: 'fingerprints',
      label: t('mobile.ttlock.actions.fingerprints', 'Fingerprints'),
      icon: () => <IconFingerprint color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        setModalType('add-fingerprint');
      },
    },
    {
      id: 'ble-card',
      label: t('mobile.ttlock.actions.enrollCard', 'Enroll Card'),
      icon: () => <IconCard color={ADMIN_ACCENT} />,
      onPress: async () => {
        if (!canStartAction()) {
          return;
        }
        const access = await ensureNearbyLockAccess();
        if (!access) {
          return;
        }
        const actionToken = beginAction('ble-card');
        if (!actionToken) {
          return;
        }
        try {
          openInfoModal({
            title: t('mobile.ttlock.cardEnrollmentTitle', 'Card Enrollment'),
            message: t('mobile.ttlock.cardEnrollmentProgress', 'Hold the card near the lock reader to complete enrollment.'),
            loading: true,
          });
          scheduleFingerprintLoaderStop(actionToken);
          const startDate = Date.now();
          const endDate = startDate + FIVE_YEARS_MS;
          const result = await ttlockNative.addICCard(startDate, endDate, access.lockData, access.lockMac);
          clearFingerprintLoaderTimeout();
          const enrolledCardNumber = String(result?.cardNumber || '').trim();

          if (!enrolledCardNumber) {
            throw new Error(
              t(
                'mobile.ttlock.cardEnrollmentMissingNumber',
                'Card enrollment succeeded but no card number was returned.',
              ),
            );
          }

          closeInfoModal();
          const currentResidentId = await resolveResidentIdForAction();
          setPendingCardNumber(enrolledCardNumber);
          await loadResidentOptions(currentResidentId);
          setModalType('assign-card');
        } catch (error) {
          clearFingerprintLoaderTimeout();
          if (actionTokenRef.current === actionToken) {
            closeInfoModal();
            Alert.alert(
              t('mobile.ttlock.cardEnrollmentFailedTitle', 'Card enrollment failed'),
              getActionErrorMessage(
                error,
                t('mobile.ttlock.cardEnrollmentFailedMessage', 'Unable to enroll card.'),
              ),
            );
          }
        } finally {
          finishAction(actionToken);
        }
      },
    },
    // {
    //   id: 'delete-card',
    //   label: t('mobile.ttlock.actions.deleteCard', 'Delete Card'),
    //   icon: () => <IconCard color={ADMIN_ACCENT} />,
    //   onPress: () => {
    //     console.log('[TTLockScreen] opening delete-card modal');
    //     setCardNumber('');
    //     setModalType('delete-card');
    //   },
    // },
  ];

  const actionRows = [];
  for (let index = 0; index < actionItems.length; index += 2) {
    actionRows.push(actionItems.slice(index, index + 2));
  }

  const closeModal = (reason = 'unknown') => {
    console.log('[TTLockScreen] closing modal:', reason);
    setModalType(null);
    setPasscode('');
    setCardNumber('');
    setPendingCardNumber('');
    setResidentOptions([]);
    setSelectedResidentId('');
    setShowCardStartDatePicker(false);
    setShowCardEndDatePicker(false);
    setCardStartDate(normalizeToStartOfDay(new Date()));
    setCardEndDate(() => {
      const nextDate = new Date();
      nextDate.setFullYear(nextDate.getFullYear() + 5);
      return normalizeToEndOfDay(nextDate);
    });
  };

  const formatCardDate = value => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return '';
    }

    const locale =
      language === 'fr' ? 'fr-FR' :
      language === 'ar' ? 'ar-SA' :
      'en-GB';

    return value.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const onCardStartDateChange = (_event, selectedDate) => {
    setShowCardStartDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const nextStartDate = normalizeToStartOfDay(selectedDate);
    setCardStartDate(nextStartDate);

    if (cardEndDate.getTime() < nextStartDate.getTime()) {
      setCardEndDate(normalizeToEndOfDay(nextStartDate));
    }
  };

  const onCardEndDateChange = (_event, selectedDate) => {
    setShowCardEndDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const nextEndDate = normalizeToEndOfDay(selectedDate);
    if (nextEndDate.getTime() < cardStartDate.getTime()) {
      setCardEndDate(normalizeToEndOfDay(cardStartDate));
      return;
    }

    setCardEndDate(nextEndDate);
  };

  const handleSubmit = async actionType => {
    let actionToken = null;
    const resolvedActionType =
      typeof actionType === 'string'
        ? actionType
        : modalType;
    console.log('[TTLockScreen] handleSubmit called:', {
      actionType: resolvedActionType,
      rawActionType: actionType,
      modalType,
      passcodeLength: passcode.length,
      resolvedDeviceId,
      residentId,
      hasRouteBle: Boolean(routeLockData && mac),
      hasCachedBle: Boolean(bleAccess?.lockData && bleAccess?.lockMac),
    });
    try {
      actionToken = beginAction(resolvedActionType);
      if (!actionToken) {
        return;
      }

      if (resolvedActionType === 'add-passcode') {
        const trimmedPasscode = passcode.trim();
        console.log('[TTLockScreen] submitting passcode value:', trimmedPasscode);
        const now = Date.now();
        const startDate = now - PASSCODE_START_BUFFER_MS;
        const endDate = now + FIVE_YEARS_MS;
        const hasDirectBleAccess = Boolean(
          (routeLockData && mac) || (bleAccess?.lockData && bleAccess?.lockMac),
        );

        if (hasDirectBleAccess) {
          console.log('[TTLockScreen] creating BLE passcode');
          try {
            const access = await ensureNearbyLockAccess();
            if (access) {
              try {
                console.log('[TTLockScreen] syncing lock time before passcode creation', {now});
                await ttlockNative.setLockTime(now, access.lockData, access.lockMac);
              } catch (timeError) {
                console.log('[TTLockScreen] lock time sync failed before passcode creation:', timeError);
              }
              const result = await ttlockNative.createCustomPasscode(
                trimmedPasscode,
                startDate,
                endDate,
                access.lockData,
                access.lockMac,
              );
              const createdPasscode = result?.passcode || trimmedPasscode;
              console.log('[TTLockScreen] BLE passcode created:', {
                requestedPasscode: trimmedPasscode,
                createdPasscode,
                startDate,
                endDate,
              });
              setPasscode('');
              if (actionTokenRef.current === actionToken) {
                openInfoModal({
                  title: t('mobile.ttlock.passcodeCreatedTitle', 'Passcode Created'),
                  message: t('mobile.ttlock.passcodeCreatedBleMessage', 'Passcode {{code}} created. Use it on the lock keypad, not in the app lock button.')
                    .replace('{{code}}', String(createdPasscode)),
                });
              }
              return;
            }
          } catch (blePasscodeError) {
            console.log('[TTLockScreen] BLE passcode failed, falling back if backend mapping exists:', blePasscodeError);
          }
        }

        if (resolvedDeviceId && residentId) {
          console.log('[TTLockScreen] creating backend passcode');
          await addTTLockPasscode({
            residentId: String(residentId),
            deviceId: resolvedDeviceId,
            passcode: trimmedPasscode,
            startDate,
            endDate,
          });
          console.log('[TTLockScreen] backend passcode created:', {
            requestedPasscode: trimmedPasscode,
            startDate,
            endDate,
          });
          setPasscode('');
          if (actionTokenRef.current === actionToken) {
            openInfoModal({
              title: t('mobile.ttlock.passcodeCreatedTitle', 'Passcode Created'),
              message: t('mobile.ttlock.passcodeCreatedMessage', 'Passcode {{code}} created. Use it on the lock keypad to unlock.')
                .replace('{{code}}', trimmedPasscode),
            });
          }
        }

        if (!resolvedDeviceId || !residentId) {
          console.log('[TTLockScreen] passcode creation unavailable: missing BLE access and device mapping');
          throw new Error(
            t('mobile.ttlock.passcodeUnavailableMessage', 'This lock needs BLE access or a backend device mapping before a passcode can be created.'),
          );
        }
      }

      if (resolvedActionType === 'add-fingerprint') {
        const access = await ensureNearbyLockAccess();
        if (!access) {
          return;
        }

        closeModal('start-fingerprint');
        openInfoModal({
          title: t('mobile.ttlock.fingerprintEnrollmentTitle', 'Fingerprint Enrollment'),
          message: t('mobile.ttlock.fingerprintEnrollmentMessage', 'Touch the lock fingerprint sensor until enrollment finishes.'),
          loading: true,
        });
        scheduleFingerprintLoaderStop(actionToken);

        const startDate = Date.now();
        const endDate = startDate + FIVE_YEARS_MS;
        await ttlockNative.addFingerprint(startDate, endDate, access.lockData, access.lockMac);
        clearFingerprintLoaderTimeout();
      }

      if (resolvedActionType === 'assign-card') {
        const currentResidentId = String(selectedResidentId || '').trim();
        const fallbackResidentId = await resolveResidentIdForAction();
        console.log('[TTLockScreen] assign-card: resolved resident ids', {
          selectedResidentId: currentResidentId,
          fallbackResidentId,
          storeResidentId: residentId,
          residentIdFromStore,
        });
        const currentDeviceId = await getFinalDeviceIdForAssignment(
          currentResidentId || fallbackResidentId,
        );
        const currentLockId = await getFinalLockIdForAssignment(
          currentResidentId || fallbackResidentId,
        );
        const normalizedCardNumber = String(pendingCardNumber || '').trim();
        const startDate = cardStartDate.getTime();
        const endDate = cardEndDate.getTime();
        const residentIdToAssign = currentResidentId || fallbackResidentId || '';
        const lockIdToAssign = String(currentLockId || '').trim();
        const deviceIdToAssign = String(currentDeviceId || '').trim();
        const validationMessage = validateCardAssignmentPayload({
          residentId: residentIdToAssign,
          deviceId: deviceIdToAssign,
          lockId: lockIdToAssign,
          cardNumber: normalizedCardNumber,
          startDate,
          endDate,
        });

        console.log('[TTLockScreen] assigning card without local validation', {
          residentId: residentIdToAssign,
          deviceId: deviceIdToAssign,
          lockId: lockIdToAssign,
          cardNumber: normalizedCardNumber,
          startDate,
          endDate,
          validationMessage,
          resolvedDeviceId,
          routeDeviceId,
          bleDeviceId: bleAccess?.deviceId,
          routeParams: route?.params,
        });

        if (validationMessage) {
          console.log('[TTLockScreen] assign-card: skipping API call because validation failed', {
            residentIdToAssign,
            deviceIdToAssign,
            lockIdToAssign,
            normalizedCardNumber,
            startDate,
            endDate,
            validationMessage,
          });
          throw new Error(validationMessage);
        }

        console.log('[TTLockScreen] assign-card: calling addTTLockCard API', {
          residentIdToAssign,
          deviceIdToAssign,
          lockIdToAssign,
          normalizedCardNumber,
          startDate,
          endDate,
        });
        await addTTLockCard({
          residentId: residentIdToAssign,
          deviceId: deviceIdToAssign,
          cardNumber: Number(normalizedCardNumber),
          startDate,
          endDate,
        });

        if (actionTokenRef.current === actionToken) {
          closeModal('assign-card-success');
          openInfoModal({
            title: t('mobile.ttlock.cardAssignedTitle', 'Card Assigned'),
            message: t(
              'mobile.ttlock.cardAssignedMessage',
              'Card #{{number}} assigned successfully.',
            ).replace('{{number}}', normalizedCardNumber),
          });
        }
      }

      // if (resolvedActionType === 'delete-card') {
      //   const trimmedCardNumber = cardNumber.trim();
      //   console.log('[TTLockScreen] deleting card number:', trimmedCardNumber);
      //   if (!trimmedCardNumber || !/^\d+$/.test(trimmedCardNumber)) {
      //     Alert.alert(
      //       t('mobile.ttlock.invalidCardTitle', 'Invalid card number'),
      //       t('mobile.ttlock.invalidCardMessage', 'Enter a valid numeric card number.'),
      //     );
      //     return;
      //   }

      //   const currentDeviceId = await resolveDeviceIdForAction(await resolveResidentIdForAction());
      //   if (!currentDeviceId) {
      //     Alert.alert(
      //       t('mobile.ttlock.cardDeleteUnavailableTitle', 'Delete unavailable'),
      //       t('mobile.ttlock.cardDeleteUnavailableMessage', 'This lock is missing a backend device mapping for card deletion.'),
      //     );
      //     return;
      //   }

      //   await deleteTTLockCard({
      //     deviceId: String(currentDeviceId),
      //     cardNumber: Number(trimmedCardNumber),
      //   });

      //   if (actionTokenRef.current === actionToken) {
      //     closeModal('delete-card-success');
      //     openInfoModal({
      //       title: t('mobile.ttlock.cardDeletedTitle', 'Card Deleted'),
      //       message: t('mobile.ttlock.cardDeletedMessage', 'Card #{{number}} deleted successfully.')
      //         .replace('{{number}}', trimmedCardNumber),
      //     });
      //   }
      // }

      if (
        resolvedActionType !== 'add-passcode' &&
        resolvedActionType !== 'add-fingerprint' &&
        resolvedActionType !== 'assign-card' &&
        resolvedActionType !== 'delete-card'
      ) {
        closeModal();
      }
    } catch (error) {
      console.log('[TTLockScreen] handleSubmit failed:', error);
      const fallbackMessage =
        resolvedActionType === 'assign-card'
          ? t(
              'mobile.ttlock.cardAssignFailedMessage',
              'Unable to assign this card right now. Please try again.',
            )
          : t('mobile.ttlock.requestFailedMessage', 'Unable to complete this action.');
      Alert.alert(
        getActionErrorTitle(error),
        getActionErrorMessage(
          error,
          fallbackMessage,
        ),
      );
    } finally {
      if (actionToken) {
        finishAction(actionToken);
      }
    }
  };

  const renderModalTitle = () => {
    if (modalType === 'add-passcode') return t('mobile.ttlock.addPasscodeTitle', 'Add Passcode');
    if (modalType === 'add-fingerprint') return t('mobile.ttlock.fingerprintEnrollmentTitle', 'Fingerprint Enrollment');
    if (modalType === 'assign-card') return t('mobile.ttlock.assignCardTitle', 'Assign Card');
    // if (modalType === 'delete-card') return t('mobile.ttlock.deleteCardTitle', 'Delete Card');
    return '';
  };

  const renderModalField = () => {
    if (modalType === 'add-passcode') {
      return (
        <View>
          <TextInput
            style={styles.input}
            placeholder={t('mobile.ttlock.passcodePlaceholder', 'Enter {{min}}-{{max}} digit passcode')
              .replace('{{min}}', String(PASSCODE_MIN_LENGTH))
              .replace('{{max}}', String(PASSCODE_MAX_LENGTH))}
            placeholderTextColor={colors.textMuted}
            value={passcode}
            onChangeText={value => {
              const numericOnly = value.replace(/\D/g, '').slice(0, PASSCODE_MAX_LENGTH);
              console.log('[TTLockScreen] passcode input changed:', {
                raw: value,
                numericOnly,
                rawLength: value.length,
                numericLength: numericOnly.length,
              });
              setPasscode(numericOnly);
            }}
            keyboardType="number-pad"
            maxLength={PASSCODE_MAX_LENGTH}
            autoFocus
            blurOnSubmit={false}
            textContentType="oneTimeCode"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      );
    }

    if (modalType === 'add-fingerprint') {
      return (
        <View style={styles.modalInfoBox}>
          <Text style={styles.modalInfoText}>
            {t(
              'mobile.ttlock.fingerprintEnrollmentMessage',
              'Touch the lock fingerprint sensor until enrollment finishes.',
            )}
          </Text>
        </View>
      );
    }

    if (modalType === 'assign-card') {
      return (
        <View style={styles.cardAssignWrap}>
          <View style={styles.modalInfoBox}>
            <Text style={styles.modalInfoText}>
              {t(
                'mobile.ttlock.assignCardPrompt',
                'Select the resident for this card only.',
              )}
            </Text>
            <Text style={styles.cardNumberText}>
              {t('mobile.ttlock.cardNumberLabel', 'Card #{{number}}').replace(
                '{{number}}',
                pendingCardNumber || '-',
              )}
            </Text>
            {resolvedLockId ? (
              <Text style={styles.cardNumberText}>
                {t('mobile.ttlock.lockNumber', 'Lock #{{id}}').replace(
                  '{{id}}',
                  String(resolvedLockId),
                )}
              </Text>
            ) : null}
          </View>
          <View style={styles.cardDateRow}>
            <View style={styles.cardDateSection}>
              <Text style={styles.cardDateSectionTitle}>
                {t('mobile.ttlock.cardStartDateLabel', 'Start Date')}
              </Text>
              <TouchableOpacity
                style={styles.cardDateField}
                activeOpacity={0.85}
                onPress={() => setShowCardStartDatePicker(true)}>
                <Text style={styles.cardDateValue}>
                  {formatCardDate(cardStartDate) ||
                    t('mobile.ttlock.cardStartDatePlaceholder', 'Select start date')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardDateSection}>
              <Text style={styles.cardDateSectionTitle}>
                {t('mobile.ttlock.cardEndDateLabel', 'End Date')}
              </Text>
              <TouchableOpacity
                style={styles.cardDateField}
                activeOpacity={0.85}
                onPress={() => setShowCardEndDatePicker(true)}>
                <Text style={styles.cardDateValue}>
                  {formatCardDate(cardEndDate) ||
                    t('mobile.ttlock.cardEndDatePlaceholder', 'Select end date')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {residentOptionsLoading ? (
            <View style={styles.assigneeLoading}>
              <ActivityIndicator color={ADMIN_ACCENT} />
            </View>
          ) : (
            <ScrollView
              style={styles.assigneeList}
              contentContainerStyle={styles.assigneeListContent}
              showsVerticalScrollIndicator={false}>
              {residentOptions.length > 0 ? (
                residentOptions.map(item => {
                  const isSelected = item.residentId === selectedResidentId;
                  return (
                    <TouchableOpacity
                      key={item.residentId}
                      style={[
                        styles.assigneeItem,
                        isSelected ? styles.assigneeItemSelected : null,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedResidentId(item.residentId)}>
                      <View style={styles.assigneeTextWrap}>
                        <Text style={styles.assigneeName}>{item.name}</Text>
                        {item.subtitle ? (
                          <Text style={styles.assigneeSubtitle}>{item.subtitle}</Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <View style={styles.assigneeCheck}>
                          <Text style={styles.assigneeCheckText}>✓</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.assigneeEmptyState}>
                  <Text style={styles.assigneeEmptyText}>
                    {t(
                      'mobile.ttlock.noResidentsFound',
                      'No residents were found for this building.',
                    )}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      );
    }

    // if (modalType === 'delete-card') {
    //   return (
    //     <View>
    //       <TextInput
    //         style={styles.input}
    //         placeholder={t('mobile.ttlock.cardNumberPlaceholder', 'Enter card number')}
    //         placeholderTextColor={colors.textMuted}
    //         value={cardNumber}
    //         onChangeText={value => {
    //           const numericOnly = value.replace(/\D/g, '');
    //           console.log('[TTLockScreen] card number input changed:', {
    //             raw: value,
    //             numericOnly,
    //             rawLength: value.length,
    //             numericLength: numericOnly.length,
    //           });
    //           setCardNumber(numericOnly);
    //         }}
    //         keyboardType="number-pad"
    //         autoFocus
    //         blurOnSubmit={false}
    //         autoCorrect={false}
    //         autoCapitalize="none"
    //       />
    //     </View>
    //   );
    // }

    return null;
  };

  return (
    <ScreenWrapper title={smartLockCopy?.screenTitle || t('mobile.ttlock.screenTitle', 'TTLock')} onBackPress={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>{t('mobile.ttlock.lockActionsTitle', 'Lock Actions')}</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.lockName}>{lockName}</Text>
            {resolvedLockId ? (
              <Text style={styles.lockMeta}>
                {t('mobile.ttlock.lockNumber', 'Lock #{{id}}').replace('{{id}}', String(resolvedLockId))}
              </Text>
            ) : null}
            {resolvedDeviceId ? (
              <Text style={styles.lockMeta}>
                {t('mobile.ttlock.deviceLabel', 'Device: {{id}}').replace('{{id}}', String(resolvedDeviceId))}
              </Text>
            ) : null}
            {!resolvedDeviceId ? <Text style={styles.lockMeta}>{t('mobile.ttlock.bleOnlySession', 'BLE-only lock session')}</Text> : null}
            {mac ? <Text style={styles.lockMeta}>{mac}</Text> : null}
            <View style={styles.summaryWifiBadge}>
              <IconWifi />
            </View>
          </View>

          {actionRows.map((rowItems, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {rowItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.tile, activeAction && activeAction !== item.id ? styles.buttonDisabled : null]}
                  activeOpacity={0.8}
                  onPress={item.onPress}
                  disabled={Boolean(activeAction)}>
                  <View
                    style={[
                      styles.tileBox,
                      activeAction && activeAction !== item.id ? styles.tileBoxDisabled : null,
                    ]}>
                    {activeAction === item.id ? <ActivityIndicator color={ADMIN_ACCENT} /> : item.icon()}
                  </View>
                  <Text
                    style={[
                      styles.tileLabel,
                      activeAction && activeAction !== item.id ? styles.tileLabelDisabled : null,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {rowItems.length === 1 ? <View style={styles.tilePlaceholder} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={!!modalType}
        onRequestClose={() => {
          if (!activeAction) {
            closeModal('system-request-close');
          }
        }}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              if (!activeAction) {
                closeModal('backdrop-press');
              }
            }}
          />
          <View
            style={styles.sheet}
            onStartShouldSetResponder={() => true}
            onTouchEnd={() => {
              console.log('[TTLockScreen] touch inside modal sheet');
            }}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>{renderModalTitle()}</Text>
            <Text style={styles.modalSubtitle}>{lockName}</Text>
            {renderModalField()}
            {modalType !== 'cards' ? (
              <TouchableOpacity
                style={[styles.primaryButton, activeAction && styles.buttonDisabled]}
                activeOpacity={0.85}
                onPress={() => handleSubmit(modalType)}
                disabled={Boolean(activeAction)}>
                {activeAction ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {modalType === 'add-passcode'
                      ? t('mobile.ttlock.createPasscodeButton', 'Create Passcode')
                      : modalType === 'add-fingerprint'
                        ? t('mobile.ttlock.startFingerprintButton', 'Start Fingerprint')
                      : modalType === 'assign-card'
                        ? t('mobile.ttlock.assignCardButton', 'Assign Card')
                      // : modalType === 'delete-card'
                      //   ? t('mobile.ttlock.deleteCardButton', 'Delete Card')
                      : t('confirm', 'Submit')}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.secondaryButton, activeAction && styles.buttonDisabled]}
              onPress={() => closeModal('cancel-button')}
              disabled={Boolean(activeAction)}>
              <Text style={styles.secondaryButtonText}>{t('cancel', 'Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal transparent animationType="fade" visible={infoModal.visible} onRequestClose={closeInfoModal}>
        <View style={styles.infoOverlay}>
          <Pressable style={styles.backdrop} onPress={closeInfoModal} />
          <View style={styles.infoSheet}>
            <Text style={styles.infoTitle}>{infoModal.title || t('mobile.ttlock.informationTitle', 'Information')}</Text>
            <Text style={styles.infoMessage}>{infoModal.message}</Text>
            {infoModal.loading ? (
              <View style={styles.infoLoaderRow}>
                <ActivityIndicator color={ADMIN_ACCENT} />
                <Text style={styles.infoLoaderText}>{t('mobile.ttlock.waitingForLock', 'Waiting for the lock...')}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={closeInfoModal} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>{t('close', 'Close')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      {showCardStartDatePicker ? (
        <DateTimePicker
          value={cardStartDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={onCardStartDateChange}
        />
      ) : null}
      {showCardEndDatePicker ? (
        <DateTimePicker
          value={cardEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={cardStartDate}
          onChange={onCardEndDateChange}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 16,
    },
    actionsCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      padding: 20,
      shadowColor: isDark ? '#000' : '#111827',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDark ? 0.18 : 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    recordsCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      padding: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    summaryCard: {
      borderRadius: 18,
      backgroundColor: ADMIN_ACCENT_SOFT,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      padding: 16,
      paddingRight: 56,
      marginBottom: 16,
      position: 'relative',
    },
    lockName: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 4,
      paddingRight: 4,
    },
    lockMeta: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
      paddingRight: 4,
    },
    summaryWifiBadge: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: ADMIN_ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 14,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      minHeight: 102,
      paddingHorizontal: 6,
    },
    tilePlaceholder: {
      flex: 1,
      minHeight: 102,
      paddingHorizontal: 6,
    },
    tileBox: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: ADMIN_ACCENT_SOFT,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    tileBoxDisabled: {
      backgroundColor: 'rgba(148,163,184,0.18)',
      borderColor: 'rgba(148,163,184,0.30)',
    },
    tileLabel: {
      fontSize: 11.5,
      color: colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 16,
    },
    tileLabelDisabled: {
      color: colors.textMuted,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
    },
    recordsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    recordRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(93,175,164,0.18)',
    },
    recordLeft: {
      flex: 1,
    },
    recordTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 3,
    },
    recordMeta: {
      fontSize: 12,
      color: colors.textMuted,
    },
    recordDate: {
      fontSize: 11,
      color: colors.textSecondary,
      maxWidth: 110,
      textAlign: 'right',
    },
    refreshButton: {
      minWidth: 92,
      height: 38,
      borderRadius: 12,
      backgroundColor: ADMIN_ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    refreshButtonText: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: '800',
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 28,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 18,
      backgroundColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 6,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 16,
    },
    input: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      backgroundColor: ADMIN_ACCENT_SOFT,
      color: colors.textPrimary,
      paddingHorizontal: 14,
      fontSize: 14,
      marginBottom: 14,
    },
    modalInfoBox: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      backgroundColor: ADMIN_ACCENT_SOFT,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 14,
    },
    modalInfoText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textPrimary,
      fontWeight: '500',
      textAlign: 'center',
    },
    cardAssignWrap: {
      gap: 12,
      marginBottom: 14,
    },
    cardNumberText: {
      marginTop: 8,
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '700',
      textAlign: 'center',
    },
    cardDateRow: {
      gap: 10,
      marginBottom: 4,
    },
    cardDateSection: {
      gap: 6,
    },
    cardDateSectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textPrimary,
      paddingHorizontal: 2,
    },
    cardDateField: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      backgroundColor: ADMIN_ACCENT_SOFT,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    cardDateValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    assigneeList: {
      maxHeight: 280,
    },
    assigneeListContent: {
      gap: 10,
    },
    assigneeLoading: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    assigneeEmptyState: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      backgroundColor: ADMIN_ACCENT_SOFT,
      paddingHorizontal: 14,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    assigneeEmptyText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: '500',
    },
    assigneeItem: {
      minHeight: 58,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      backgroundColor: ADMIN_ACCENT_SOFT,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    assigneeItemSelected: {
      borderColor: ADMIN_ACCENT,
      backgroundColor: 'rgba(93,175,164,0.16)',
    },
    assigneeTextWrap: {
      flex: 1,
    },
    assigneeName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    assigneeSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    assigneeCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: ADMIN_ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    assigneeCheckText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },
    cardActionStack: {
      gap: 10,
      marginBottom: 10,
    },
    primaryButton: {
      height: 50,
      borderRadius: 14,
      backgroundColor: ADMIN_ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    secondaryButton: {
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ADMIN_ACCENT_SOFT,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
    },
    secondaryActionButton: {
      height: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ADMIN_ACCENT_SOFT,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
    },
    secondaryActionButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    infoOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.overlay,
      padding: 24,
    },
    infoSheet: {
      width: '100%',
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.24)',
      padding: 20,
      gap: 14,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    infoMessage: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    infoLoaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingTop: 4,
      paddingBottom: 8,
    },
    infoLoaderText: {
      fontSize: 13,
      fontWeight: '600',
      color: ADMIN_ACCENT_DARK,
    },
  });
