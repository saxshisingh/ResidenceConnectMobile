import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import VehicleIcon from '../../../../assets/Icons/Vehicle.svg';
import CarIcon from '../../../../assets/Icons/Car.svg';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';

const PlusIcon = () => (
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

export default function VehicleInfo({navigation}: any) {
  const {colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWrapper
      title={t('home.mobile.myVehicle', 'Vehicles')}
      onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <CarIcon width={22} height={22} />
            </View>
            <View>
              <Text style={styles.heroTitle}>
                {t('home.mobile.myVehicle', 'Vehicles')}
              </Text>
              <Text style={styles.heroSub}>
                {t(
                  'vehicle.mobile.manageVehicles',
                  'Manage your registered vehicles',
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.illustrationWrap}>
          <VehicleIcon width={240} height={240} />
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            {t('vehicle.mobile.emptyTitle', 'No vehicles added yet')}
          </Text>
          <Text style={[styles.emptyDesc, {color: colors.textMuted}]}>
            {t(
              'vehicle.mobile.emptyDescription',
              'Add your vehicle details to manage parking and access easily.',
            )}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('AddEditVehicleDetail', {mode: 'add'})
          }>
          <PlusIcon />
          <Text style={styles.addButtonText}>
            {t('vehicle.list.add', 'Add Vehicle')}
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
      backgroundColor: colors.background,
    },
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 20,
      borderRadius: 20,
      padding: 18,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    heroCircle1: {
      position: 'absolute',
      top: -50,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(245,158,11,0.10)',
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: 'rgba(245,158,11,0.07)',
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    heroIconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    heroSub: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '500',
    },
    illustrationWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    emptyDesc: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 32,
      height: 54,
      backgroundColor: '#F59E0B',
      borderRadius: 16,
      shadowColor: '#F59E0B',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
  });
