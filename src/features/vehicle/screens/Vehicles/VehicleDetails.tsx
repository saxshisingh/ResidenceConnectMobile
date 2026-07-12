// VehicleDetails.tsx — Elegantly Redesigned
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, Alert, StyleSheet, useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenWrapper         from '../../../../components/ScreenWrapper';
import EmptyState            from '../../../../components/EmptyState';
import CarIcon               from '../../../../assets/Icons/Group 169.svg';
import EditIcon              from '../../../../assets/Icons/Edit_duotone.svg';
import DeleteIcon            from '../../../../assets/Icons/Trash.svg';
import VehicleIllustration   from '../../../../assets/Icons/Vehicle.svg';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { deleteVehicleThunk, fetchVehicles } from '../../state/vehicleSlice';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n }    from '../../../../i18n';

const ChevronRight = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const PlusIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function VehicleDetails({ navigation }: any) {
  const dispatch   = useAppDispatch();
  const { colors } = useAppTheme();
  const { t }      = useI18n();
  const styles     = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 520);
  const { vehicles } = useAppSelector(state => state.vehicles);
  const user         = useAppSelector((state: any) => state.auth.user);
  const residentId   = user?.data?.residentId;

  const handleDelete = (vehicleItem: any) => {
    const vehicleId = vehicleItem?.vehicleId;
    if (!vehicleId) {
      Alert.alert(t('common.error','Error'), t('vehicle.list.deleteError','Failed to delete vehicle'));
      return;
    }
    Alert.alert(
      t('vehicle.list.deleteTitle','Delete Vehicle'),
      t('vehicle.list.deleteConfirm','Are you sure you want to delete this vehicle?'),
      [
        { text: t('common.cancel','Cancel'), style: 'cancel' },
        {
          text: t('common.delete','Delete'), style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteVehicleThunk(vehicleId)).unwrap();
              if (residentId) dispatch(fetchVehicles(residentId));
              Alert.alert(t('common.success','Success'), t('vehicle.list.deleteSuccess','Vehicle deleted successfully'));
            } catch {
              Alert.alert(t('common.error','Error'), t('vehicle.list.deleteError','Failed to delete vehicle'));
            }
          },
        },
      ],
    );
  };

  const renderVehicle = (vehicleItem: any) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { width: contentWidth }]}
      onPress={() => navigation.push('AddEditVehicleDetail', { mode: 'view', vehicleData: vehicleItem })}
    >
      {/* amber left accent bar */}
      <View style={styles.accentBar} />

      {/* icon box */}
      <View style={styles.iconBox}>
        <CarIcon width={22} height={22} />
      </View>

      {/* text */}
      <View style={{ flex: 1 }}>
        <Text style={styles.vehicleNumber}>{vehicleItem.vehicleNumber}</Text>
        <Text style={styles.vehicleType}>{vehicleItem.vehicleType}</Text>
        {vehicleItem.color ? (
          <View style={styles.colorPill}>
            <View style={[styles.colorDot, { backgroundColor: vehicleItem.color?.toLowerCase() === 'white' ? '#E5E7EB' : vehicleItem.color?.toLowerCase() || '#9CA3AF' }]} />
            <Text style={styles.colorPillText}>{vehicleItem.color}</Text>
          </View>
        ) : null}
      </View>

      {/* action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}
          onPress={() => navigation.navigate('AddEditVehicleDetail', { mode: 'edit', vehicleData: vehicleItem })}
        >
          <EditIcon width={15} height={15} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
          onPress={() => handleDelete(vehicleItem)}
        >
          <DeleteIcon width={15} height={15} />
        </TouchableOpacity>
      </View>

      <View style={styles.chevronBox}>
        <ChevronRight color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper
      title={t('home.mobile.myVehicle','Vehicles')}
      onBackPress={() => navigation.goBack()}
    >
      {/* ── hero card ── */}
      <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroContent}>
          <View style={styles.heroIconBox}>
            <Text style={{ fontSize: 18 }}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{t('home.mobile.myVehicle','Vehicles')}</Text>
            <Text style={styles.heroSub}>
              {t('vehicle.mobile.manageVehicles','Your registered vehicles')}
            </Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={[styles.heroStat, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.heroStatNum}>{vehicles.length}</Text>
            <Text style={styles.heroStatLabel}>
              {t('vehicle.mobile.vehiclesCountLabel','VEHICLES')}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={vehicles}
          keyExtractor={item => item.vehicleId}
          renderItem={({ item }) => renderVehicle(item)}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120, alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={t('vehicle.mobile.emptyTitle','No vehicles found')}
              description={t('vehicle.mobile.emptyDescription','Add your vehicle details to get started.')}
              illustration={<VehicleIllustration width={130} height={130} />}
            />
          }
        />

        <TouchableOpacity
          style={[styles.addButton, { width: contentWidth, alignSelf: 'center', marginBottom: Math.max(insets.bottom, 16) + 8 }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddEditVehicleDetail', { mode: 'add' })}
        >
          <PlusIcon />
          <Text style={styles.addButtonText}>{t('vehicle.list.add','Add Vehicle')}</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    // Hero
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20, marginTop: 12, marginBottom: 8,
      borderRadius: 20, padding: 18, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    heroCircle1: {
      position: 'absolute', top: -50, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(245,158,11,0.10)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(245,158,11,0.07)',
    },
    heroContent: {
      flexDirection: 'row', alignItems: 'center',
      gap: 12, marginBottom: 14,
    },
    heroIconBox: {
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    heroTitle: {
      fontSize: 18, fontWeight: '800', color: '#FFFFFF',
      marginBottom: 2, letterSpacing: -0.3,
    },
    heroSub:  { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    heroStats: { flexDirection: 'row', gap: 8 },
    heroStat: {
      flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    },
    heroStatNum:   { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
    heroStatLabel: {
      fontSize: 9, fontWeight: '700',
      color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 0.5,
    },

    // Vehicle card
    card: {
      flexDirection: 'row', alignItems: 'center',
      flexWrap: 'wrap',
      backgroundColor: colors.surface,
      marginHorizontal: 20, marginBottom: 10,
      borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
      paddingVertical: 14, paddingRight: 12, paddingLeft: 0,
      overflow: 'hidden',
      shadowColor: colors.overlay, shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    accentBar: {
      width: 4, alignSelf: 'stretch',
      backgroundColor: '#F59E0B',
      marginRight: 12,
    },
    iconBox: {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12,
    },
    vehicleNumber: {
      fontSize: 15, fontWeight: '700',
      color: colors.textPrimary, marginBottom: 2,
    },
    vehicleType: {
      fontSize: 12, color: colors.textSecondary, marginBottom: 5,
    },
    colorPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      alignSelf: 'flex-start',
      backgroundColor: colors.backgroundAlt,
      borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2,
    },
    colorDot: {
      width: 8, height: 8, borderRadius: 4,
    },
    colorPillText: {
      fontSize: 10, fontWeight: '600', color: colors.textSecondary,
    },
    actions: { flexDirection: 'row', gap: 6, marginRight: 8 },
    actionBtn: {
      width: 30, height: 30, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center',
    },
    chevronBox: {
      width: 26, height: 26, borderRadius: 7,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center', justifyContent: 'center',
    },

    // Add button
    addButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, marginHorizontal: 20, marginBottom: 28,
      height: 54, backgroundColor: '#F59E0B', borderRadius: 16,
      shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    },
    addButtonText: {
      color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3,
    },
  });
