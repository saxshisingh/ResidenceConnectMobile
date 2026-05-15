// ProfileScreen.tsx — Elegantly Redesigned
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { createStyles } from './ProfileScreen.styles';

import SettingIcon  from '../../../../assets/Icons/material-symbols_settings-outline.svg';
import ParkingIcon  from '../../../../assets/Icons/local_parking.svg';
import CarIcon      from '../../../../assets/Icons/directions_car_filled.svg';
import FamilyIcon   from '../../../../assets/Icons/family_restroom.svg';
import UploadIcon   from '../../../../assets/Icons/upload_file.svg';
import LogoutIcon   from '../../../../assets/Icons/circum_logout.svg';

import { useAppDispatch } from '../../../../redux/hooks';
import { logout }         from '../../../auth/state/authSlice';
import { fetchProfile }   from '../../state/editProfileSlice';
import { useSelector }    from 'react-redux';
import ScreenWrapper      from '../../../../components/ScreenWrapper';
import ThemedLoader       from '../../../../components/ThemedLoader';
import { useAppTheme }    from '../../../../theme/ThemeProvider';
import { useI18n }        from '../../../../i18n';
import { API_BASE_URL }   from '../../../../config/api';
import { fetchParkingSlots } from '../../../parking/state/parkingSlice';
import { fetchVehicles } from '../../../vehicle/state/vehicleSlice';
import { fetchFamilyMembers } from '../../../member/state/familySlice';
import { navigationRef } from '../../../../navigation/navigationRef';

// ─── helpers ─────────────────────────────────
const getInitials = (f?: string, l?: string) =>
  `${f?.[0] ?? ''}${l?.[0] ?? ''}`.toUpperCase();

const normalizeImageUrl = (path?: string) => {
  const p = String(path || '').trim();
  if (!p) return '';
  if (['null','undefined','n/a','na'].includes(p.toLowerCase())) return '';
  if (p.startsWith('http')) return p;
  return `${API_BASE_URL}/${p.replace(/^\/+/, '')}`;
};

// ─── tiny inline SVG icons ────────────────────
const PhoneIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015 12.84a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const PetIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx={8}  cy={6}  r={2} fill={color}/>
    <Circle cx={16} cy={6}  r={2} fill={color}/>
    <Circle cx={6}  cy={12} r={2} fill={color}/>
    <Circle cx={18} cy={12} r={2} fill={color}/>
    <Path d="M12 18c2.5 0 4.5-1.5 5.5-3.5.5-1-.5-2-1.5-2h-8c-1 0-2 1-1.5 2 1 2 3 3.5 5.5 3.5z" fill={color}/>
  </Svg>
);
const WaterIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const ElectricityIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const GasIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2c1 3-1 6-1 6s4 2 4 6c0 3-2 6-5 6s-5-3-5-6c0-2 1-4 2-5-1.5.5-3 2-3 5 0 4 3 7 6 7s6-3 6-7c0-5-4-8-4-12z" fill={color} strokeWidth={1}/>
  </Svg>
);
const BuildingIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─────────────────────────────────────────────
export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const [profileImageLoadFailed, setProfileImageLoadFailed] = React.useState(false);

  const user    = useSelector((state: any) => state.auth.user);
  const loading = useSelector((state: any) => state.auth.loading);
  const parkingSlots = useSelector((state: any) => state.parking?.slots ?? []);
  const vehicles = useSelector((state: any) => state.vehicles?.vehicles ?? []);
  const familyMembers = useSelector((state: any) => state.familyMembers?.items ?? []);
  const residentId = user?.data?.residentId;
  const residentMobile = user?.data?.mobileNumber || user?.data?.mobile || '';
  const familyLabels = useMemo(() => {
    if (language === 'ar') {
      return {
        short: '\u0627\u0644\u0639\u0627\u0626\u0644\u0629',
        manage: '\u0625\u062f\u0627\u0631\u0629 \u0623\u0641\u0631\u0627\u062f \u0627\u0644\u0639\u0627\u0626\u0644\u0629',
      };
    }
    if (language === 'fr') {
      return {
        short: 'Famille',
        manage: 'Gerer les membres de la famille',
      };
    }
    return {
      short: 'Family',
      manage: 'Manage Family Members',
    };
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      if (!residentId) return;
      dispatch(fetchParkingSlots(residentId));
      dispatch(fetchVehicles(residentId));
      dispatch(fetchFamilyMembers(residentId));
    }, [dispatch, residentId]),
  );

  const handleLogout = () => {
    Alert.alert(
      t('profile.mobile.logoutTitle', 'Logout'),
      t('profile.mobile.logoutConfirm', 'Are you sure you want to logout?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('profile.mobile.logoutTitle', 'Logout'),
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
    );
  };

  if (loading || !user?.data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedLoader size="large" />
      </View>
    );
  }

  const { firstName, lastName } = user.data;
  const profilePhoto = normalizeImageUrl(user.data.profilePhoto || user.data.photo);
  const showPhoto = Boolean(profilePhoto && !profileImageLoadFailed);
  const heroQuickLinks = [
    {
      id: 'parking',
      label: t('home.mobile.parking', 'Parking'),
      value: parkingSlots.length,
      icon: <ParkingIcon width={18} height={18} />,
      backgroundColor: '#7C3AED',
      onPress: () => navigation.navigate('Parking'),
    },
    {
      id: 'vehicle',
      label: t('vehicle.mobile.title', 'Vehicles'),
      value: vehicles.length,
      icon: <CarIcon width={18} height={18} />,
      backgroundColor: '#2563EB',
      onPress: () => navigation.navigate('Vehicle'),
    },
    {
      id: 'family',
      label: familyLabels.short,
      value: familyMembers.length,
      icon: <FamilyIcon width={18} height={18} />,
      backgroundColor: '#22C55E',
      onPress: () => navigation.navigate('Familydetial'),
    },
  ];

  // menu items — each has its own color
  const menuItems = [
    {
      id: 'parking',
      label: t('profile.mobile.parkingInfo', 'Parking Information'),
      icon: <ParkingIcon width={20} height={20} />,
      color: '#7C3AED', bg: '#F5F3FF',
      onPress: () => navigation.navigate('Parking'),
    },
    {
      id: 'vehicle',
      label: t('profile.mobile.vehicleDetails', 'Vehicle Details'),
      icon: <CarIcon width={20} height={20} />,
      color: '#F59E0B', bg: '#FEF3C7',
      onPress: () => navigation.navigate('Vehicle'),
    },
    {
      id: 'family',
      label: familyLabels.manage,
      icon: <FamilyIcon width={20} height={20} />,
      color: '#22C55E', bg: '#F0FDF4',
      onPress: () => navigation.navigate('Familydetial'),
    },
    {
      id: 'docs',
      label: t('profile.mobile.uploadDocuments', 'Documents'),
      icon: <UploadIcon width={20} height={20} />,
      color: '#8B5CF6', bg: '#EDE9FE',
      onPress: () => navigation.navigate('Documents'),
    },
    {
      id: 'settings',
      label: t('settings.mobile.title', 'Settings'),
      icon: <SettingIcon width={20} height={20} />,
      color: '#6B7280', bg: '#F3F4F6',
      onPress: () => navigation.navigate('ProfileSettings'),
    },
  ];

  return (
    <ScreenWrapper
      title={t('profile.mobile.title', 'My Profile')}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD ── */}
        <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Avatar + name row */}
          <View style={styles.heroTop}>
            <View style={styles.avatarRing}>
              <View style={[styles.initialsContainer, { backgroundColor: showPhoto ? 'transparent' : '#E87722' }]}>
                {showPhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={styles.avatarImage}
                    onError={() => setProfileImageLoadFailed(true)}
                  />
                ) : (
                  <Text style={styles.avatarText}>{getInitials(firstName, lastName)}</Text>
                )}
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{user.data.firstName} {user.data.lastName}</Text>
              <Text style={styles.heroEmail}>{user.data.email}</Text>
              <View style={styles.heroBadge}>
                <BuildingIcon color="#94A3B8" />
                <Text style={styles.heroBadgeText}>
                  {user.data.apartmentUnit} · {user.data.blockName} · {t('profile.mobile.floor', 'Floor')} {user.data.floorNumber}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.heroStats}>
            {heroQuickLinks.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.heroStat, { backgroundColor: item.backgroundColor }]}
                activeOpacity={0.85}
                onPress={item.onPress}
              >
                <View style={styles.heroStatTopRow}>
                  <View style={styles.heroStatIconBox}>
                    {item.icon}
                  </View>
                  <Text style={styles.heroStatLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </View>
                <Text style={styles.heroStatNum}>{item.value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Edit profile button — full, orange, icon */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              dispatch(fetchProfile(user.data.residentId));
              navigation.navigate('EditProfile');
            }}
            activeOpacity={0.85}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
              <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="#fff"/>
            </Svg>
            <Text style={styles.editBtnText}>{t('profile.mobile.editProfile', 'Edit Profile')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── UTILITY METERS ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, width: contentWidth, alignSelf: 'center', marginHorizontal: 0 }]}>
          {t('profile.mobile.utilityMeters', 'UTILITY METERS')}
        </Text>

        <View style={[styles.utilityCard, { backgroundColor: colors.surface, width: contentWidth, alignSelf: 'center' }]}>
          <View style={[styles.utilityItem, { borderColor: '#38BDF8' + '40' }]}>
            <View style={[styles.utilityIconBox, { backgroundColor: '#F0F9FF' }]}>
              <WaterIcon color="#38BDF8" />
            </View>
            <Text style={[styles.utilityLabel, { color: colors.textMuted }]}>
              {t('profile.mobile.water', 'Water')}
            </Text>
            <Text style={[styles.utilityValue, { color: colors.textPrimary }]}>
              {user.data.waterMeterNo || '—'}
            </Text>
          </View>

          <View style={[styles.utilityDivider, { backgroundColor: colors.border }]} />

          <View style={[styles.utilityItem, { borderColor: '#FDE047' + '40' }]}>
            <View style={[styles.utilityIconBox, { backgroundColor: '#FEFCE8' }]}>
              <ElectricityIcon color="#EAB308" />
            </View>
            <Text style={[styles.utilityLabel, { color: colors.textMuted }]}>
              {t('profile.mobile.electricity', 'Electricity')}
            </Text>
            <Text style={[styles.utilityValue, { color: colors.textPrimary }]}>
              {user.data.electricityMeterNo || '—'}
            </Text>
          </View>

          <View style={[styles.utilityDivider, { backgroundColor: colors.border }]} />

          <View style={[styles.utilityItem, { borderColor: '#FB923C' + '40' }]}>
            <View style={[styles.utilityIconBox, { backgroundColor: '#FFF7ED' }]}>
              <GasIcon color="#F97316" />
            </View>
            <Text style={[styles.utilityLabel, { color: colors.textMuted }]}>
              {t('profile.mobile.gas', 'Gas')}
            </Text>
            <Text style={[styles.utilityValue, { color: colors.textPrimary }]}>
              {user.data.gasMeterNo || '—'}
            </Text>
          </View>
        </View>

        {/* ── CONTACT INFO PILLS ── */}
        <View style={[styles.contactRow, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={[styles.contactPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <PhoneIcon color="#E87722" />
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>{residentMobile}</Text>
          </View>
          <View style={[styles.contactPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <PetIcon color="#22C55E" />
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              {t('profile.mobile.pet', 'Pet')}: {user?.data?.petOwnership ? t('common.values.yes', 'Yes') : t('common.values.no', 'No')}
            </Text>
          </View>
        </View>

        {/* ── ACCOUNT MENU ── */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, width: contentWidth, alignSelf: 'center', marginHorizontal: 0 }]}>
          {t('profile.mobile.accountSection', 'ACCOUNT')}
        </Text>

        <View style={[styles.menuList, { width: contentWidth, alignSelf: 'center', marginHorizontal: 0 }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
                i === menuItems.length - 1 && { marginBottom: 0 },
              ]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              {/* colored icon box */}
              <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                {item.icon}
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              {/* chevron */}
              <View style={styles.menuChevron}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── LOGOUT ── */}
        <TouchableOpacity style={[styles.logoutBtn, { width: contentWidth, alignSelf: 'center' }]} onPress={handleLogout} activeOpacity={0.85}>
          <View style={styles.logoutIconBox}>
            <LogoutIcon width={18} height={18} />
          </View>
          <Text style={styles.logoutText}>{t('profile.mobile.logout', 'Log Out')}</Text>
          <View style={[styles.menuChevron, { backgroundColor: '#FEE2E2' }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}
