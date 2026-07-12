import React, {useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet, useWindowDimensions} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';

import CarIcon from '../../../../assets/Icons/Group 169.svg';

import {useAppSelector, useAppDispatch} from '../../../../redux/hooks';
import {fetchParkingSlots} from '../../state/parkingSlice';
import ThemedLoader from '../../../../components/ThemedLoader';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import EmptyState from '../../../../components/EmptyState';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';

const ChevronRight = ({color}: {color: string}) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ParkingDetails({navigation}: any) {
  const {colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {width} = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const dispatch = useAppDispatch();
  const {slots, loading} = useAppSelector(state => state.parking);
  const user = useAppSelector((state: any) => state.auth.user);

  useFocusEffect(
    useCallback(() => {
      if (user?.data?.residentId) {
        dispatch(fetchParkingSlots(user.data.residentId));
      }
    }, [dispatch, user?.data?.residentId]),
  );

  if (loading && slots.length === 0) {
    return (
      <ScreenWrapper
        title={t('parking.mobile.detailsTitle', 'Parking Details')}
        onBackPress={() => navigation.goBack()}>
        <View style={styles.loaderWrap}>
          <ThemedLoader size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  const renderCard = (item: any) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, {width: contentWidth}]}
      onPress={() =>
        navigation.push('AddParkingDetail', {mode: 'view', parkingData: item})
      }>
      <View style={styles.accentBar} />

      <View style={styles.iconBox}>
        <CarIcon width={22} height={22} />
      </View>

      <View style={styles.cardTextWrap}>
        <Text style={styles.slotNumber}>{item.slotNumber}</Text>
        <Text style={styles.slotMeta}>
          {t('parking.form.fields.level.label', 'Level')} {item.level} •{' '}
          {item.blockName}
        </Text>
        {item.vehicleNumber ? (
          <View style={styles.vehiclePill}>
            <Text style={styles.vehiclePillText}>{item.vehicleNumber}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chevronBox}>
        <ChevronRight color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper
      title={t('parking.mobile.detailsTitle', 'Parking Details')}
      onBackPress={() => navigation.goBack()}>
      <View style={[styles.heroCard, {width: contentWidth, alignSelf: 'center'}]}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroTopRow}>
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <Text style={styles.heroIconText}>P</Text>
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>
                {t('parking.mobile.detailsTitle', 'Parking Details')}
              </Text>
              <Text style={styles.heroSub}>
                {t('parking.mobile.assignedSlots', 'Your assigned parking slots')}
              </Text>
            </View>
          </View>

          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{slots.length}</Text>
            <Text style={styles.heroStatLabel}>
              {t('parking.mobile.slotsCountLabel', 'SLOTS')}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={slots}
        keyExtractor={item => item.parkingAssignmentId}
        renderItem={({item}) => renderCard(item)}
        contentContainerStyle={[styles.listContent, {alignItems: 'center'}]}
        refreshing={loading}
        onRefresh={() => {
          if (user?.data?.residentId) {
            dispatch(fetchParkingSlots(user.data.residentId));
          }
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={t('parking.mobile.noSlots', 'No parking found')}
            compact
          />
        }
      />
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    loaderWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 10,
      borderRadius: 24,
      padding: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.overlay,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    heroCircle1: {
      position: 'absolute',
      top: -50,
      right: -32,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(243,126,0,0.12)',
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -26,
      left: -24,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(232,119,34,0.08)',
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    heroContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    heroIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroIconText: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.onPrimary,
    },
    heroTextWrap: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    heroSub: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    heroStat: {
      minWidth: 74,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: 'center',
      backgroundColor: 'rgba(243,126,0,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(243,126,0,0.18)',
    },
    heroStatNum: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
    },
    heroStatLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: 2,
      letterSpacing: 0.5,
    },
    listContent: {
      paddingTop: 8,
      paddingBottom: 120,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingRight: 14,
      paddingLeft: 0,
      overflow: 'hidden',
      shadowColor: colors.overlay,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    accentBar: {
      width: 5,
      alignSelf: 'stretch',
      backgroundColor: colors.primary,
      marginRight: 12,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: 'rgba(243,126,0,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardTextWrap: {
      flex: 1,
    },
    slotNumber: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 3,
    },
    slotMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 6,
      lineHeight: 17,
    },
    vehiclePill: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(243,126,0,0.10)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    vehiclePillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    chevronBox: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
