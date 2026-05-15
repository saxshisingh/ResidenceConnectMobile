import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import ScreenWrapper from '../../../components/ScreenWrapper';
import ThemedLoader from '../../../components/ThemedLoader';
import EmptyState from '../../../components/EmptyState';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { loadNeighbors } from '../state/neighborsSlice';
import type { Neighbor } from '../services/neighborsService';
import NeighborsIcon from '../../../assets/Icons/groups_2.svg';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { useI18n } from '../../../i18n';
import { API_BASE_URL } from '../../../config/api';

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const IconDoor = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="2"
      width="18"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth="1.8"
    />
    <Circle cx="15.5" cy="12" r="1.2" fill={color} />
  </Svg>
);

const IconBuilding = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21h18M5 21V7l7-4 7 4v14"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Rect
      x="9"
      y="13"
      width="2.5"
      height="3.5"
      rx="0.4"
      stroke={color}
      strokeWidth="1.4"
    />
    <Rect
      x="12.5"
      y="13"
      width="2.5"
      height="3.5"
      rx="0.4"
      stroke={color}
      strokeWidth="1.4"
    />
    <Rect x="9.2" y="8" width="2" height="2" rx="0.3" fill={color} />
    <Rect x="12.8" y="8" width="2" height="2" rx="0.3" fill={color} />
  </Svg>
);

const IconHome = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconPerson = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" />
    <Path
      d="M4 21c0-4 3.6-7 8-7s8 3 8 7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

const IconPaw = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="14" r="4" stroke={color} strokeWidth="1.8" />
    <Circle cx="6.5" cy="9" r="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="17.5" cy="9" r="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="9" cy="6" r="1.5" stroke={color} strokeWidth="1.5" />
    <Circle cx="15" cy="6" r="1.5" stroke={color} strokeWidth="1.5" />
  </Svg>
);

const IconLayers = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7l10 5 10-5-10-5z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12l10 5 10-5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M2 17l10 5 10-5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

const IconFlash = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconWater = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3C12 3 6 10 6 14.5A6 6 0 0018 14.5C18 10 12 3 12 3z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconGas = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 3v7a4 4 0 11-8 0V7a4 4 0 018 0v10a6 6 0 1012 0V9a2 2 0 00-2-2h-1"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconChat = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconChevronRight = ({ size = 18, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconClose = ({ size = 16, color = '#888' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const IconGrid = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
    <Rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
    <Rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
    <Rect
      x="14"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
    />
  </Svg>
);

const IconCity = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21h18M5 21V9l5-6 5 6v12M15 21V12h4v9"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Rect x="8" y="13" width="2" height="3" rx="0.4" fill={color} />
    <Rect x="11" y="13" width="2" height="3" rx="0.4" fill={color} />
  </Svg>
);

const IconCheckCircle = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <Path
      d="M8 12l3 3 5-5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconGroup = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.8" />
    <Circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.6" />
    <Path
      d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M19 14c2 .7 3.5 2.5 3.5 5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </Svg>
);

const IconCar = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 16l1.5-5a2 2 0 011.9-1.4h7.2a2 2 0 011.9 1.4L19 16"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 16h16v3a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7.5" cy="16.5" r="1.1" fill={color} />
    <Circle cx="16.5" cy="16.5" r="1.1" fill={color} />
  </Svg>
);

const IconParking = ({ size = 16, color = '#5DAFA4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 21V4h6a4 4 0 010 8H7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MyNeighborsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const { neighbors, loading, error } = useAppSelector(
    state => state.neighbors,
  );
  const user = useAppSelector(state => state.auth.user);
  const residentId = user?.data?.residentId;
  const [selectedNeighbor, setSelectedNeighbor] = useState<Neighbor | null>(
    null,
  );
  const [avatarLoadFailed, setAvatarLoadFailed] = useState<Record<string, boolean>>({});
  const neighborLabels = useMemo(() => {
    if (language === 'ar') {
      return {
        residence: 'السكن',
        occupancy: 'الإشغال',
        maxResidents: 'الحد الأقصى للسكان',
        utilityInformation: 'معلومات العدادات',
        waterMeter: 'عداد المياه',
        gasMeter: 'عداد الغاز',
        electricityMeter: 'عداد الكهرباء',
      };
    }

    if (language === 'fr') {
      return {
        residence: 'Residence',
        occupancy: 'Occupation',
        maxResidents: 'Residents max.',
        utilityInformation: 'Informations des compteurs',
        waterMeter: "Compteur d'eau",
        gasMeter: 'Compteur de gaz',
        electricityMeter: "Compteur d'electricite",
      };
    }

    return null;
  }, [language]);

  useEffect(() => {
    if (residentId) dispatch(loadNeighbors(residentId));
  }, [dispatch, residentId]);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return t('notAvailable', 'N/A');
    if (typeof value === 'boolean') return value ? t('common.values.yes', 'Yes') : t('common.values.no', 'No');
    return String(value);
  };

  const getNeighborName = (item: Neighbor) => {
    const full = [item?.firstName, item?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return (
      full ||
      item?.neighbourName ||
      item?.neighborName ||
      item?.name ||
      t('neighbors.mobile.neighbor', 'Neighbor')
    );
  };

  const getNeighborUnit = (item: Neighbor) =>
    item?.neighbourApartmentNumber ||
    item?.apartmentUnit ||
    item?.apartmentNumber ||
    '-';

  const normalizeImageUrl = (path?: string | null) => {
    const value = String(path || '').trim();
    if (!value) return '';
    if (['null', 'undefined', 'n/a', 'na'].includes(value.toLowerCase())) return '';
    if (value.startsWith('http')) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  const pickFirstValue = (item: Neighbor | null, keys: (keyof Neighbor | string)[]) => {
    if (!item) return null;
    for (const key of keys) {
      const value = (item as any)?.[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return value;
      }
    }
    return null;
  };

  const getNeighborPhoto = (item: Neighbor | null) =>
    normalizeImageUrl(
      String(
        pickFirstValue(item, [
          'neighbourPhoto',
          'neighborPhoto',
          'profilePhoto',
          'profileImage',
          'photo',
          'imageUrl',
        ]) || '',
      ),
    );

  const getNeighborKey = (item: Neighbor | null) =>
    String(
      item?.residentId ||
      item?.userId ||
      item?.residentUserId ||
      `${getNeighborName(item as Neighbor)}-${getNeighborUnit(item as Neighbor)}`
    );

  const normalizeList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map(item => String(item ?? '').trim())
        .filter(item => item && item !== '-1');
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map(item => item.trim())
        .filter(item => item && item !== '-1');
    }

    return [];
  };

  const extractListFromObjects = (value: unknown, keys: string[]) => {
    if (!Array.isArray(value)) return [];

    return value
      .map(item => {
        if (item === null || item === undefined) return '';
        if (typeof item !== 'object') return String(item).trim();

        for (const key of keys) {
          const candidate = (item as any)?.[key];
          if (candidate !== null && candidate !== undefined) {
            const normalized = String(candidate).trim();
            if (normalized && normalized !== '-1') return normalized;
          }
        }

        return '';
      })
      .filter(item => item && item !== '-1');
  };

  const getVehicleNumbers = (item: Neighbor | null) => {
    const list = normalizeList(item?.vehicleNumbersList);
    if (list.length > 0) return list;

    const csvList = normalizeList(item?.vehicleNumbers);
    if (csvList.length > 0) return csvList;

    const objectList = extractListFromObjects(
      item?.vehicles || item?.vehicleDetails || item?.residentVehicles || item?.neighbourVehicles,
      [
        'vehicleNumber',
        'vehicleNo',
        'vehicleRegistrationNumber',
        'vehicleNumberPlate',
        'registrationNumber',
        'plateNumber',
      ],
    );
    if (objectList.length > 0) return objectList;

    const singleValue = getVehicleNumber(item);
    return singleValue ? [String(singleValue)] : [];
  };

  const getVehicleTypes = (item: Neighbor | null) => {
    const list = normalizeList(item?.vehicleTypeList);
    if (list.length > 0) return list;

    const csvList = normalizeList(item?.vehicleTypes);
    if (csvList.length > 0) return csvList;

    const objectList = extractListFromObjects(
      item?.vehicles || item?.vehicleDetails || item?.residentVehicles || item?.neighbourVehicles,
      ['vehicleType', 'typeOfVehicle', 'vehicleCategory', 'category', 'type'],
    );
    if (objectList.length > 0) return objectList;

    const singleValue = getVehicleType(item);
    return singleValue ? [String(singleValue)] : [];
  };

  const getParkingSlots = (item: Neighbor | null) => {
    const list = normalizeList(item?.parkingSlotsList);
    if (list.length > 0) return list;

    const csvList = normalizeList(item?.parkingSlots);
    if (csvList.length > 0) return csvList;

    const objectList = extractListFromObjects(
      item?.parkingDetails || item?.parkings,
      ['parkingSlot', 'parkingSlotNumber', 'slotNumber', 'parkingNumber', 'assignedParkingSlot'],
    );
    if (objectList.length > 0) return objectList;

    const singleValue = getParkingSlot(item);
    return singleValue && String(singleValue).trim() !== '-1'
      ? [String(singleValue)]
      : [];
  };

  const getDisplayList = (values: string[]) => (values.length > 0 ? values : ['0']);

  const getVehicleCount = (item: Neighbor | null) => {
    const rawCount =
      item?.noOfVehicles ??
      item?.noOfVehicle ??
      item?.vehicleCount ??
      item?.totalVehicles ??
      item?.numberOfVehicles;
    const parsedCount =
      rawCount === null || rawCount === undefined || rawCount === ''
        ? NaN
        : Number(rawCount);

    if (Number.isFinite(parsedCount) && parsedCount >= 0) {
      return parsedCount;
    }

    return Math.max(
      getVehicleNumbers(item).length,
      getVehicleTypes(item).length,
      Array.isArray(item?.vehicles) ? item.vehicles.length : 0,
      Array.isArray(item?.vehicleDetails) ? item.vehicleDetails.length : 0,
      Array.isArray(item?.residentVehicles) ? item.residentVehicles.length : 0,
      Array.isArray(item?.neighbourVehicles) ? item.neighbourVehicles.length : 0,
    );
  };

  const getVehicleNumber = (item: Neighbor | null) =>
    pickFirstValue(item, [
      'vehicleNumber',
      'vehicleNo',
      'vehicleRegistrationNumber',
      'vehicleNumberPlate',
      'registrationNumber',
      'plateNumber',
    ]);

  const getVehicleType = (item: Neighbor | null) =>
    pickFirstValue(item, ['vehicleType', 'typeOfVehicle']);

  const getParkingSlot = (item: Neighbor | null) =>
    pickFirstValue(item, [
      'parkingSlot',
      'parkingSlotNumber',
      'slotNumber',
      'parkingNumber',
      'assignedParkingSlot',
    ]);

  const getParkingType = (item: Neighbor | null) =>
    pickFirstValue(item, ['parkingType', 'assignmentType']);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const palette = [
      '#5DAFA4',
      '#4A9B8E',
      '#3D8A7E',
      '#2E7A6F',
      '#6BBFB3',
      '#7ECDC2',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  };

  const handleOpenChat = (item: Neighbor) => {
    const receiverId =
      item?.userId ||
      item?.ttLockUserId ||
      item?.neighbourUserId ||
      item?.neighborUserId ||
      item?.residentUserId;
    if (!receiverId) {
      Alert.alert(
        t('common.error', 'Error'),
        t('neighbors.mobile.chatUnavailable', 'Chat is not available for this neighbor right now.'),
      );
      return;
    }
    navigation.navigate('ChatDetail', {
      receiverId: String(receiverId),
      conversationId: item?.conversationId,
      name: getNeighborName(item),
    });
  };

  // ── Neighbor card ──────────────────────────────────────────
  const renderNeighborCard = (item: Neighbor) => {
    const name = getNeighborName(item);
    const unit = getNeighborUnit(item);
    const avatarColor = getAvatarColor(name);
    const cardKey = getNeighborKey(item);
    const isOccupied = item?.occupacyStatus === 'Occupied';
    const neighborPhoto = getNeighborPhoto(item);
    const showAvatarPhoto = Boolean(neighborPhoto) && !avatarLoadFailed[cardKey];

    return (
      <TouchableOpacity
        key={cardKey}
        style={[styles.card, { width: contentWidth, alignSelf: 'center' }]}
        activeOpacity={0.82}
        onPress={() => setSelectedNeighbor(item)}
      >
        {/* Avatar */}
        {showAvatarPhoto ? (
          <Image
            source={{ uri: neighborPhoto }}
            style={styles.avatar}
            onError={() =>
              setAvatarLoadFailed(prev => ({ ...prev, [cardKey]: true }))
            }
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        )}

        {/* Main info */}
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaChip}>
              <IconDoor size={11} color={colors.primary} />
              <Text style={styles.metaChipText}>{unit}</Text>
            </View>
            {item?.floorNumber ? (
              <View style={styles.metaChip}>
                <IconLayers size={11} color={colors.primary} />
                <Text style={styles.metaChipText}>
                  {t('profile.mobile.floor', 'Floor')} {item.floorNumber}
                </Text>
              </View>
            ) : null}
            {item?.apartmentType ? (
              <View style={styles.metaChip}>
                <IconHome size={11} color={colors.primary} />
                <Text style={styles.metaChipText}>{item.apartmentType}</Text>
              </View>
            ) : null}
          </View>
          {item?.occupacyStatus ? (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isOccupied
                    ? 'rgba(93,175,164,0.12)'
                    : 'rgba(200,200,200,0.18)',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOccupied ? '#5DAFA4' : '#aaa' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOccupied ? '#3A8F86' : colors.textMuted },
                ]}
              >
                {item.occupacyStatus}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.chatBtn}
            activeOpacity={0.8}
            onPress={() => handleOpenChat(item)}
          >
            <IconChat size={14} color="#fff" />
            <Text style={styles.chatBtnText}>{t('chat', 'Chat')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoBtn}
            activeOpacity={0.8}
            onPress={() => setSelectedNeighbor(item)}
          >
            <IconChevronRight size={17} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Detail section helper ─────────────────────────────────
  const DetailSection = ({
    sectionIcon,
    title,
    rows,
  }: {
    sectionIcon: React.ReactNode;
    title: string;
    rows: { label: string; value: unknown; rowIcon: React.ReactNode }[];
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>{sectionIcon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={[
              styles.detailRow,
              i < rows.length - 1 && styles.detailRowBorder,
            ]}
          >
            <View style={styles.detailLabelRow}>
              {row.rowIcon}
              <Text style={styles.detailLabel}>{row.label}</Text>
            </View>
            <Text
              style={[
                styles.detailValue,
                Array.isArray(row.value) && styles.detailValueMultiline,
              ]}
            >
              {Array.isArray(row.value)
                ? getDisplayList(
                    row.value
                      .map(item => String(item ?? '').trim())
                      .filter(Boolean),
                  ).join('\n')
                : formatValue(row.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <ScreenWrapper
      title={t('neighbors.mobile.title', 'My Neighbors')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {loading && (
          <View style={styles.center}>
            <ThemedLoader size="large" />
            <Text style={styles.loadingText}>{t('neighbors.mobile.loading', 'Loading neighbors...')}</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {neighbors.length === 0 ? (
              <View style={styles.center}>
                <EmptyState
                  title={t('neighbors.mobile.emptyTitle', 'No neighbors found')}
                  description={t('neighbors.mobile.emptyDesc', 'Neighbor profiles will appear here once available.')}
                  illustration={<NeighborsIcon width={120} height={120} />}
                />
              </View>
            ) : (
              neighbors.map(item => renderNeighborCard(item))
            )}
          </ScrollView>
        )}
      </View>

      {/* ── Detail modal ── */}
      <Modal
        transparent
        animationType="slide"
        statusBarTranslucent
        visible={Boolean(selectedNeighbor)}
        onRequestClose={() => setSelectedNeighbor(null)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setSelectedNeighbor(null)} />
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              {selectedNeighbor ? (() => {
                const selectedKey = getNeighborKey(selectedNeighbor);
                const selectedPhoto = getNeighborPhoto(selectedNeighbor);
                const showSelectedPhoto = Boolean(selectedPhoto) && !avatarLoadFailed[selectedKey];

                if (showSelectedPhoto) {
                  return (
                    <Image
                      source={{ uri: selectedPhoto }}
                      style={styles.sheetAvatar}
                      onError={() =>
                        setAvatarLoadFailed(prev => ({ ...prev, [selectedKey]: true }))
                      }
                    />
                  );
                }

                return (
                  <View
                    style={[
                      styles.sheetAvatar,
                      {
                        backgroundColor: getAvatarColor(
                          getNeighborName(selectedNeighbor),
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.sheetAvatarText}>
                      {getInitials(getNeighborName(selectedNeighbor))}
                    </Text>
                  </View>
                );
              })() : null}
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetName}>
                  {selectedNeighbor ? getNeighborName(selectedNeighbor) : ''}
                </Text>
                <Text style={styles.sheetSub}>
                  {selectedNeighbor?.residenceName || ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedNeighbor(null)}
              >
                <IconClose size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Quick stat strip */}
            {selectedNeighbor && (
              <View style={styles.statStrip}>
                {[
                  {
                    icon: <IconDoor size={18} color={colors.primary} />,
                    label: t('neighbors.mobile.unit', 'Unit'),
                    value: getNeighborUnit(selectedNeighbor),
                  },
                  {
                    icon: <IconLayers size={18} color={colors.primary} />,
                    label: t('profile.mobile.floor', 'Floor'),
                    value: selectedNeighbor.floorNumber || '-',
                  },
                  {
                    icon: <IconHome size={18} color={colors.primary} />,
                    label: t('neighbors.mobile.type', 'Type'),
                    value: selectedNeighbor.apartmentType || '-',
                  },
                  {
                    icon: <IconPaw size={18} color={colors.primary} />,
                    label: t('neighbors.mobile.pets', 'Pets'),
                    value: selectedNeighbor.petOwnership ? t('common.values.yes', 'Yes') : t('common.values.no', 'No'),
                  },
                ].map(stat => (
                  <View key={stat.label} style={styles.statItem}>
                    {stat.icon}
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              bounces
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetScroll}
            >
              {selectedNeighbor && (
                <>
                  <DetailSection
                    sectionIcon={
                      <IconBuilding size={14} color={colors.primary} />
                    }
                    title={t('neighbors.mobile.apartmentDetails', 'Apartment Details')}
                    rows={[
                      {
                        label: t('neighbors.mobile.unitFlat', 'Unit / Flat'),
                        value: selectedNeighbor.apartmentUnit,
                        rowIcon: (
                          <IconDoor size={13} color={colors.textMuted} />
                        ),
                      },
                      {
                        label: t('profile.mobile.floor', 'Floor'),
                        value: selectedNeighbor.floorNumber,
                        rowIcon: (
                          <IconLayers size={13} color={colors.textMuted} />
                        ),
                      },
                      {
                        label: t('neighbors.mobile.blockTower', 'Block / Tower'),
                        value: selectedNeighbor.blockName,
                        rowIcon: (
                          <IconGrid size={13} color={colors.textMuted} />
                        ),
                      },
                      {
                        label: t('neighbors.mobile.apartmentType', 'Apt. Type'),
                        value: selectedNeighbor.apartmentType,
                        rowIcon: (
                          <IconHome size={13} color={colors.textMuted} />
                        ),
                      },
                      {
                        label:
                          neighborLabels?.residence ||
                          t('neighbors.mobile.residence', 'Residence'),
                        value: selectedNeighbor.residenceName,
                        rowIcon: (
                          <IconCity size={13} color={colors.textMuted} />
                        ),
                      },
                      {
                        label:
                          neighborLabels?.occupancy ||
                          t('neighbors.mobile.occupancy', 'Occupancy'),
                        value: selectedNeighbor.occupacyStatus,
                        rowIcon: (
                          <IconCheckCircle size={13} color={colors.textMuted} />
                        ),
                      },
                      {
                        label:
                          neighborLabels?.maxResidents ||
                          t('neighbors.mobile.maxResidents', 'Max Residents'),
                        value: selectedNeighbor.maxAllowedResidents,
                        rowIcon: (
                          <IconGroup size={13} color={colors.textMuted} />
                        ),
                      },
                    ]}
                  />
                  <DetailSection
                    sectionIcon={<IconCar size={14} color={colors.primary} />}
                    title={t('neighbors.mobile.vehicleParkingInfo', 'Vehicle & Parking')}
                    rows={[
                      {
                        label: t('neighbors.mobile.totalVehicles', 'Total Vehicles'),
                        value: getVehicleCount(selectedNeighbor),
                        rowIcon: <IconCar size={13} color={colors.textMuted} />,
                      },
                      {
                        label: t('neighbors.mobile.vehicleNumber', 'Vehicle Number'),
                        value: getDisplayList(getVehicleNumbers(selectedNeighbor)),
                        rowIcon: <IconCar size={13} color={colors.textMuted} />,
                      },
                      {
                        label: t('neighbors.mobile.parkingSlots', 'Parking Slot'),
                        value: getDisplayList(getParkingSlots(selectedNeighbor)),
                        rowIcon: <IconParking size={13} color={colors.textMuted} />,
                      },
                    ]}
                  />
                  {(selectedNeighbor.waterMeterNo ||
                    selectedNeighbor.gasMeterNo ||
                    selectedNeighbor.electricityMeterNo) && (
                    <DetailSection
                      sectionIcon={<IconFlash size={14} color={colors.primary} />}
                      title={
                        neighborLabels?.utilityInformation ||
                        t(
                          'neighbors.mobile.utilityInformation',
                          'Utility Information',
                        )
                      }
                      rows={[
                        {
                          label:
                            neighborLabels?.waterMeter ||
                            t('neighbors.mobile.waterMeter', 'Water Meter'),
                          value: selectedNeighbor.waterMeterNo,
                          rowIcon: <IconWater size={13} color={colors.textMuted} />,
                        },
                        {
                          label:
                            neighborLabels?.gasMeter ||
                            t('neighbors.mobile.gasMeter', 'Gas Meter'),
                          value: selectedNeighbor.gasMeterNo,
                          rowIcon: <IconGas size={13} color={colors.textMuted} />,
                        },
                        {
                          label:
                            neighborLabels?.electricityMeter ||
                            t(
                              'neighbors.mobile.electricityMeter',
                              'Electricity Meter',
                            ),
                          value: selectedNeighbor.electricityMeterNo,
                          rowIcon: <IconFlash size={13} color={colors.textMuted} />,
                        },
                      ].filter(row => row.value)}
                    />
                  )}
                </>
              )}
            </ScrollView>

            {/* Chat CTA */}
            {selectedNeighbor && (
              <View style={styles.sheetFooter}>
                <TouchableOpacity
                  style={styles.sheetChatBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedNeighbor(null);
                    handleOpenChat(selectedNeighbor);
                  }}
                >
                  <IconChat size={18} color="#fff" />
                  <Text style={styles.sheetChatBtnText}>
                    {t('neighbors.mobile.chatWith', 'Chat with {{name}}').replace('{{name}}', selectedNeighbor.firstName || getNeighborName(selectedNeighbor))}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 28,
      gap: 10,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 260,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 13,
      color: colors.textMuted,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
    },

    // ── Card ──
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    cardName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.1,
    },
    cardMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: 'rgba(93,175,164,0.10)',
    },
    metaChipText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginLeft: 8,
      justifyContent: 'flex-end',
    },
    chatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
      maxWidth: '100%',
    },
    chatBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
      flexShrink: 1,
    },
    infoBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(93,175,164,0.3)',
      backgroundColor: 'rgba(93,175,164,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Modal sheet ──
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      height: '92%',
      flexShrink: 1,
      overflow: 'hidden',
      paddingBottom: 0,
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
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    sheetAvatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetAvatarText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#fff',
    },
    sheetHeaderText: {
      flex: 1,
    },
    sheetName: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.2,
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

    // ── Stat strip ──
    statStrip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: 'rgba(93,175,164,0.05)',
    },
    statItem: {
      flex: 1,
      minWidth: 72,
      alignItems: 'center',
      gap: 3,
    },
    statValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '500',
    },

    sheetScroll: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 40,
      gap: 12,
    },

    // ── Detail section ──
    section: {
      marginBottom: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    sectionIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: 'rgba(93,175,164,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
    },
    sectionBody: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 11,
      gap: 8,
    },
    detailRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      flex: 1,
    },
    detailLabel: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
      flexShrink: 1,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'right',
      width: '100%',
      maxWidth: '100%',
    },
    detailValueMultiline: {
      lineHeight: 20,
    },

    // ── Sheet footer ──
    sheetFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sheetChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 15,
    },
    sheetChatBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },
  });
