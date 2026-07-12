import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import AddParking from '../../../../assets/Icons/AddParking.svg';
import {useAppSelector} from '../../../../redux/hooks';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';

const ParkingPlusIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke="#fff"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ParkingInfo({navigation}: any) {
  const {colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAppSelector((state: any) => state.auth.user);

  return (
    <ScreenWrapper
      title={t('home.mobile.parking', 'Parking')}
      onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <Text style={styles.heroIconText}>P</Text>
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>
                {t('home.mobile.parking', 'Parking')}
              </Text>
              <Text style={styles.heroSub}>
                {t(
                  'parking.mobile.manageSlots',
                  'Manage your parking slot assignments',
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.illustrationWrap}>
            <View style={styles.illustrationHalo} />
            <AddParking width={220} height={160} />
          </View>

          <Text style={styles.emptyTitle}>
            {t('parking.mobile.emptyTitle', 'No parking slots assigned')}
          </Text>
          <Text style={styles.emptyDesc}>
            {t(
              'parking.mobile.emptyDescription',
              'Add your parking details to manage slot assignments and vehicle info.',
            )}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('AddParkingDetail', {
              mode: 'add',
              parkingData: {
                residenceId: user?.data?.residenceId,
                blockId: user?.data?.blockId,
                userId: user?.data?.userId,
              },
            })
          }>
          <ParkingPlusIcon />
          <Text style={styles.addButtonText}>
            {t('parking.mobile.addParkingInformation', 'Add Parking Information')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
    },
    heroCard: {
      backgroundColor: colors.surface,
      marginBottom: 20,
      borderRadius: 24,
      padding: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    heroCircle1: {
      position: 'absolute',
      top: -48,
      right: -36,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(243,126,0,0.12)',
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -28,
      left: -28,
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: 'rgba(232,119,34,0.08)',
    },
    heroContent: {
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
      marginBottom: 3,
      letterSpacing: -0.3,
    },
    heroSub: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
      lineHeight: 18,
    },
    emptyCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 22,
      paddingVertical: 26,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
      marginBottom: 20,
    },
    illustrationWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      width: '100%',
      minHeight: 180,
      position: 'relative',
    },
    illustrationHalo: {
      position: 'absolute',
      width: 210,
      height: 210,
      borderRadius: 105,
      backgroundColor: 'rgba(243,126,0,0.10)',
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    emptyDesc: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
      fontWeight: '400',
      color: colors.textMuted,
      maxWidth: 280,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      height: 54,
      backgroundColor: colors.primary,
      borderRadius: 16,
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.22,
      shadowRadius: 10,
      elevation: 5,
    },
    addButtonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
  });
