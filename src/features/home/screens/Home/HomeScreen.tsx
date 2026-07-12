/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { createStyles } from './HomeScreen.styles';
import { useNavigation } from '@react-navigation/native';

import NeighborsIcon from '../../../../assets/Icons/groups_2.svg';
import NotificationImp from '../../../../assets/Icons/notification_important.svg';
import MaintenanceIcon from '../../../../assets/Icons/build.svg';
import AccessIcon from '../../../../assets/Icons/accessibility.svg';
import PostsIcon from '../../../../assets/Icons/group.svg';
import BillsIcon from '../../../../assets/Icons/Folder_file_alt_fill.svg';
import SecurityIcon from '../../../../assets/Icons/Lock_fill.svg';
import ParkingIcon from '../../../../assets/Icons/local_parking.svg';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { checkUnreadNotifications } from '../../../notifications/state/notificationSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import { API_BASE_URL } from '../../../../config/api';
import { fetchDuesSummaryByResident } from '../../../bills/services/billsService';
import { fetchMaintenanceHistory } from '../../../maintenance/state/maintenanceSlice';
import { getSOSAlerts } from '../../../alerts/services/alertService';

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

const CallLogsIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({
  width = 24, height = 24, color,
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill={color ?? 'currentColor'} />
    <Path d="M15 2h5c.55 0 1 .45 1 1v5" stroke={color ?? 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M14 5h4M14 8h3" stroke={color ?? 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const HeaderBellIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8.6C18 5.5 15.31 3 12 3S6 5.5 6 8.6v2.09c0 .44-.18 1.1-.39 1.47l-1.1 1.83c-.45.76-.54 1.6-.25 2.34.29.74.94 1.28 1.77 1.56 1.85.62 3.9.94 5.97.94s4.12-.32 5.97-.94c.83-.28 1.48-.82 1.77-1.56.29-.74.2-1.58-.25-2.34l-1.1-1.83c-.21-.37-.39-1.03-.39-1.47V8.6Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9.5 19a2.9 2.9 0 0 0 5 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Stat pill icons ────────────────────────────────────────────────────────────

const AlertStatIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9v4M12 17h.01" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MaintenanceStatIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DuesStatIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ──────────────────────────────────────────────────────────────────────────────

const MENU_ICON_SIZE = 28;

const FEATURE_COLORS: Record<string, { icon: string; bg: string }> = {
  'call-logs':    { icon: '#8B5CF6', bg: '#EDE9FE' },
  'smart-access': { icon: '#22C55E', bg: '#F0FDF4' },
  'posts':        { icon: '#0EA5E9', bg: '#E0F2FE' },
  'my-bills':     { icon: '#10B981', bg: '#ECFDF5' },
  'maintenance':  { icon: '#E87722', bg: '#FFF0E0' },
  'security':     { icon: '#2563EB', bg: '#EFF6FF' },
  'alerts':       { icon: '#EF4444', bg: '#FEE2E2' },
  'parking':      { icon: '#7C3AED', bg: '#F5F3FF' },
};

type SearchRoute = { id: string; label: string; routeName: string; keywords?: string[] };

const chunkItems = <T,>(items: T[], size: number) => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
};

const normalizeImageUrl = (path?: string) => {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return '';
  if (['null', 'undefined', 'n/a', 'na'].includes(cleanPath.toLowerCase())) return '';
  if (cleanPath.startsWith('http')) return cleanPath;
  return `${API_BASE_URL}/${cleanPath.replace(/^\/+/, '')}`;
};

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [duesSummary, setDuesSummary] = useState({
    totalDueAmount: 0, dueBillCount: 0, paidBillCount: 0, overdueBillCount: 0,
  });
  const [alertCount, setAlertCount] = useState(0);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { colors, resolvedTheme } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors, resolvedTheme === 'dark'), [colors, resolvedTheme]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);

  const user = useSelector((state: any) => state.auth.user);
  const loading = useSelector((state: any) => state.auth.loading);
  const { unreadCount } = useAppSelector(state => state.notifications || { unreadCount: 0 });
  const maintenanceHistory = useAppSelector(state => state.maintenance.history);
  const residentId = user?.data?.residentId;

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const id = residentId || await AsyncStorage.getItem('residentId');
        if (id) dispatch(checkUnreadNotifications(id));
      } catch {}
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [dispatch, residentId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const id = residentId || await AsyncStorage.getItem('residentId');
        if (!id) return;
        dispatch(fetchMaintenanceHistory(id));
        const [summary, alerts] = await Promise.all([
          fetchDuesSummaryByResident(id),
          getSOSAlerts(),
        ]);
        if (!cancelled) {
          setDuesSummary(summary);
          setAlertCount(Array.isArray(alerts) ? alerts.length : 0);
        }
      } catch {
        if (!cancelled) {
          setDuesSummary({ totalDueAmount: 0, dueBillCount: 0, paidBillCount: 0, overdueBillCount: 0 });
          setAlertCount(0);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [dispatch, residentId]);

  const userData = user?.data;
  const firstName = userData?.firstName || '';
  const lastName = userData?.lastName || '';
  const residenceName = userData?.residenceName || '';
  const apartmentUnit = userData?.apartmentUnit || '';
  const profileImage = normalizeImageUrl(
    userData?.profilePhoto || userData?.profileImage || userData?.photo || userData?.imageUrl || '',
  );
  const showProfileImage = Boolean(profileImage) && !avatarLoadFailed;
  const maintenanceHistoryCount = maintenanceHistory.length;

  const menuItems = [
    { id: 'call-logs',    label: t('calllogs.mobile.title', 'Call Logs'),       icon: (s: number) => <CallLogsIcon width={s} height={s} color={FEATURE_COLORS['call-logs'].icon} />,   onPress: () => navigation.navigate('CallLogs') },
    { id: 'smart-access', label: t('mobile.smartAccess.title', 'Smart Access'), icon: (s: number) => <AccessIcon width={s} height={s} />,                                                onPress: () => navigation.navigate('SmartAccess') },
    { id: 'posts',        label: t('home.mobile.posts', 'Posts'),                icon: (s: number) => <PostsIcon width={s} height={s} />,                                                 onPress: () => navigation.navigate('Community') },
    { id: 'my-bills',     label: t('home.mobile.myBills', 'My Bills'),           icon: (s: number) => <BillsIcon width={s} height={s} />,                                                 onPress: () => navigation.navigate('MyBills') },
    { id: 'maintenance',  label: t('home.mobile.maintenance', 'Maintenance'),    icon: (s: number) => <MaintenanceIcon width={s} height={s} />,                                           onPress: () => navigation.navigate('MaintenanceHistory') },
    { id: 'security',     label: t('home.mobile.security', 'Security'),          icon: (s: number) => <SecurityIcon width={s} height={s} />,                                              onPress: () => navigation.navigate('Security') },
    { id: 'alerts',       label: t('home.mobile.alerts', 'Alerts'),              icon: (s: number) => <NotificationImp width={s} height={s} />,                                           onPress: () => navigation.navigate('AlertSystem') },
    { id: 'parking',      label: t('home.mobile.parking', 'Parking'),            icon: (s: number) => <ParkingIcon width={s} height={s} />,                                               onPress: () => navigation.navigate('Parking') },
  ];

  const menuRows = chunkItems(menuItems, 3);
  const normalizedSearch = searchText.trim().toLowerCase();

  const searchableRoutes = useMemo<SearchRoute[]>(() => [
    { id: 'home',                 label: t('home.mobile.home', 'Home'),                       routeName: 'Home',               keywords: ['dashboard'] },
    { id: 'chat',                 label: t('chat.mobile.title', 'Chat'),                      routeName: 'Chat',               keywords: ['message', 'messages'] },
    { id: 'community',            label: t('communityBoard.mobile.title', 'Community Board'), routeName: 'Community',          keywords: ['posts', 'favorite'] },
    { id: 'profile',              label: t('profile.mobile.title', 'Profile'),                routeName: 'Profile',            keywords: ['account', 'settings'] },
    { id: 'my-neighbors',         label: t('neighbors.mobile.title', 'My Neighbors'),         routeName: 'MyNeighbors',        keywords: ['neighbors', 'residents'] },
    { id: 'notifications',        label: t('notification.mobile.title', 'Notifications'),     routeName: 'Notification',       keywords: ['alerts', 'updates'] },
    { id: 'call-logs',            label: t('calllogs.mobile.title', 'Call Logs'),             routeName: 'CallLogs',           keywords: ['calls'] },
    { id: 'smart-access',         label: t('mobile.smartAccess.title', 'Smart Access'),       routeName: 'SmartAccess',        keywords: ['door', 'access'] },
    { id: 'smart-access-history', label: t('smartAccess.mobile.history', 'Smart Access History'), routeName: 'SmartAccessHistory', keywords: ['history', 'logs'] },
    { id: 'unlock-door',          label: t('smartAccess.mobile.unlockDoor', 'Unlock Door'),   routeName: 'UnlockDoor',         keywords: ['door', 'entry'] },
    { id: 'my-bills',             label: t('home.mobile.myBills', 'My Bills'),                routeName: 'MyBills',            keywords: ['bills', 'payments'] },
    { id: 'maintenance',          label: t('home.mobile.maintenance', 'Maintenance'),         routeName: 'MaintenanceHistory', keywords: ['service', 'repair'] },
    { id: 'security',             label: t('home.mobile.security', 'Security'),               routeName: 'Security',           keywords: ['guard', 'safety'] },
    { id: 'alerts',               label: t('home.mobile.alerts', 'Alerts'),                   routeName: 'AlertSystem',        keywords: ['emergency', 'block'] },
    { id: 'parking',              label: t('home.mobile.parking', 'Parking'),                 routeName: 'Parking',            keywords: ['vehicle', 'car'] },
    { id: 'vehicle',              label: t('vehicle.mobile.title', 'Vehicle'),                routeName: 'Vehicle',            keywords: ['car', 'transport'] },
    { id: 'documents',            label: t('documents.mobile.title', 'Documents'),            routeName: 'Documents',          keywords: ['files', 'pdf'] },
    { id: 'location-sharing',     label: t('location.mobile.sharing', 'Location Sharing'),    routeName: 'LocationSharing',    keywords: ['map', 'location'] },
    { id: 'profile-settings',     label: t('settings.mobile.title', 'Profile Settings'),      routeName: 'ProfileSettings',    keywords: ['settings', 'preferences'] },
    { id: 'edit-profile',         label: t('profile.mobile.editProfile', 'Edit Profile'),     routeName: 'EditProfile',        keywords: ['profile', 'account'] },
    { id: 'language',             label: t('language.mobile.title', 'Language'),              routeName: 'Language',           keywords: ['locale', 'translation'] },
  ], [t]);

  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return searchableRoutes.filter(item =>
      item.label.toLowerCase().includes(normalizedSearch) ||
      item.keywords?.some(k => k.toLowerCase().includes(normalizedSearch)),
    );
  }, [normalizedSearch, searchableRoutes]);

  const hasNoSearchResults = normalizedSearch.length > 0 && searchResults.length === 0;

  if (loading || !userData) {
    return (
      <View
        style={[
          styles.container,
          styles.loaderContainer,
          { backgroundColor: colors.background },
        ]}>
        <ThemedLoader size="large" />
      </View>
    );
  }

  return (
    <ScreenWrapper showHeader={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces>

          {/* ── HERO ── */}
          <View style={[styles.hero, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />

            {/* Top row */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  {showProfileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} onError={() => setAvatarLoadFailed(true)} />
                  ) : (
                    <Text style={styles.avatarText}>{getInitials(firstName, lastName)}</Text>
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                  <Text style={styles.greeting}>{t('home.mobile.hello', 'Hello!')} 👋</Text>
                  <Text style={styles.name} numberOfLines={2}>{firstName} {lastName}</Text>
                  <View style={styles.locationBadge}>
                    <Text style={styles.locationText} numberOfLines={2}>{residenceName} • {apartmentUnit}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notification')}>
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
                <HeaderBellIcon color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* ── STAT PILLS — icons + tappable ── */}
            <View style={styles.statsRow}>

              <TouchableOpacity
                style={[styles.statPill, { backgroundColor: '#EF4444' }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AlertSystem')}
              >
               
               
                 <Text style={styles.statNum}>{alertCount}</Text>
                  <View style={styles.statBottomRow}>
                  <View style={styles.statIconWrap}><AlertStatIcon /></View>
                  <Text style={styles.statLabel}>{t('home.mobile.alertsLabel', 'ALERTS')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statPill, { backgroundColor: '#F59E0B' }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MaintenanceHistory')}
              >
               

                 <Text style={styles.statNum}>{maintenanceHistoryCount}</Text>
                                 <View style={styles.statBottomRowTight}>
                  <View style={styles.statIconWrap}><MaintenanceStatIcon /></View>
                  <Text style={styles.statLabelCompact} numberOfLines={1}>
                    {t('home.mobile.maintenanceLabel', 'MAINTENANCE')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statPill, { backgroundColor: '#10B981' }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MyBills')}
              >
                

                <Text style={styles.statNum}>{`DZD ${duesSummary.totalDueAmount.toLocaleString('fr-DZ')}`}</Text>
                                <View style={styles.statBottomRow}>
                  {/* <View style={styles.statIconWrap}><DuesStatIcon /></View> */}
                  <Text style={styles.statLabel}>{t('home.mobile.duesLabel', 'DUES')}</Text>
                </View>
              </TouchableOpacity>

            </View>
          </View>

          <View style={[styles.contentWrapper, { width: contentWidth, alignSelf: 'center' }]}>

            {/* ── SEARCH BAR ── */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder={t('common.search', 'Search services, neighbors...')}
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={() => {
                  if (searchResults[0]) { navigation.navigate(searchResults[0].routeName); setSearchText(''); }
                }}
                returnKeyType="search"
              />
            </View>

            {/* ── SEARCH RESULTS ── */}
            {normalizedSearch.length > 0 && (
              <View style={[styles.searchSuggestions, { backgroundColor: colors.surface }]}>
                {hasNoSearchResults ? (
                  <View style={styles.noResultsWrap}>
                    <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                      {t('home.mobile.noSearchResults', 'No matching items found.')}
                    </Text>
                  </View>
                ) : (
                  searchResults.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.searchSuggestionItem, { borderBottomColor: colors.border }]}
                      onPress={() => { navigation.navigate(item.routeName); setSearchText(''); }}
                    >
                      <Text style={[styles.searchSuggestionText, { color: colors.textPrimary }]}>{item.label}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* ── MY NEIGHBORS — FULL WIDTH ── */}
            <TouchableOpacity
              style={styles.neighborCard}
              onPress={() => navigation.navigate('MyNeighbors')}
              activeOpacity={0.85}
            >
              <View style={styles.neighborTextCol}>
                <Text style={styles.neighborLabel}>
                  {t('neighbors.mobile.title', 'My Neighbors')}
                </Text>
                <Text style={styles.neighborSub}>
                  {t('neighbors.mobile.viewAllResidents', 'View all residents in your building')}
                </Text>
                <View style={styles.neighborCtaRow}>
                  <Text style={styles.neighborCta}>{t('common.viewAll', 'View All')}</Text>
                  <Text style={styles.neighborArrow}>  →</Text>
                </View>
              </View>
              <View style={styles.neighborIconBox}>
                <NeighborsIcon width={56} height={56} />
              </View>
            </TouchableOpacity>

            {/* ── SECTION TITLE ── */}
            {/* <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t('home.mobile.allFeatures', 'All Features')}
            </Text> */}

            {/* ── MENU GRID ── */}
            <View style={styles.menuGrid}>
              {menuRows.map((row, rowIndex) => (
                <View
                  key={`row-${rowIndex}`}
                  style={[
                    styles.menuRow,
                    row.length < 3 && styles.menuRowCentered,
                  ]}>
                  {row.map(item => (
                    <MenuItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      icon={item.icon}
                      onPress={item.onPress}
                      colors={colors}
                      styles={styles}
                    />
                  ))}
                  {row.length < 3
                    ? Array.from({ length: 3 - row.length }).map((_, fillerIndex) => (
                        <View
                          key={`row-${rowIndex}-filler-${fillerIndex}`}
                          style={styles.menuItemSpacer}
                        />
                      ))
                    : null}
                </View>
              ))}
            </View>

          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

function MenuItem({
  id, icon, label, size = MENU_ICON_SIZE, onPress, colors, styles,
}: {
  id: string;
  icon: (size: number) => React.ReactNode;
  label: string;
  size?: number;
  onPress?: () => void;
  colors: { surface: string; textSecondary: string; overlay: string };
  styles: any;
}) {
  const featureColor = FEATURE_COLORS[id] ?? { icon: '#E87722', bg: '#FFF0E0' };
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIconContainer, { backgroundColor: featureColor.bg }]}>
        {icon(size)}
      </View>
      <Text style={[styles.menuLabel, { color: colors.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
