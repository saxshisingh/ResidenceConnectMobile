import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Platform,
  Share,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';

import { createStyles } from './LocationFlow.styles';
import SettingIcon from '../../../../assets/Icons/icon setting.svg';
import RefreshIcon from '../../../../assets/Icons/Vector.svg';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function LocationMapViewScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mapStyles = useMemo(() => createMapStyles(colors), [colors]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = (asRefresh = false) => {
    if (asRefresh) {
      setRefreshing(true);
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setPermissionGranted(true);
        setLoading(false);
        setRefreshing(false);
      },
      () => {
        setLoading(false);
        setRefreshing(false);
        Alert.alert(
          t('location.mobile.locationError', 'Location Error'),
          t('location.mobile.unableToFetchLocation', 'Unable to fetch your current location.')
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 },
    );
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
          return;
        }
      } else {
        const status = await (Geolocation as any).requestAuthorization?.('whenInUse');
        const normalizedStatus = String(status || '').toLowerCase();

        if (
          !status ||
          normalizedStatus === 'granted' ||
          normalizedStatus === 'authorized' ||
          normalizedStatus === 'wheninuse' ||
          normalizedStatus === 'always'
        ) {
          getCurrentLocation();
          return;
        }

        setPermissionGranted(false);
        setLoading(false);
        Alert.alert(
          t('location.mobile.permissionRequired', 'Permission Required'),
          t(
            'location.mobile.permissionRequiredMessage',
            'Location permission is required to show your live map.',
          ),
        );
        return;
      }

      setPermissionGranted(false);
      setLoading(false);
      Alert.alert(
        t('location.mobile.permissionRequired', 'Permission Required'),
        t('location.mobile.permissionRequiredMessage', 'Location permission is required to show your live map.'),
      );
    } catch {
      setPermissionGranted(false);
      setLoading(false);
      Alert.alert(
        t('common.error', 'Error'),
        t('location.mobile.unableToRequestPermission', 'Unable to request location permission.')
      );
    }
  };

  const openInMaps = async () => {
    if (!location) return;

    const { latitude, longitude } = location;
    const url = Platform.select({
      ios: `https://maps.apple.com/?ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    if (!url) return;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        t('common.error', 'Error'),
        t('location.mobile.unableToOpenMaps', 'Unable to open maps on this device.')
      );
      return;
    }
    Linking.openURL(url);
  };

  const shareLocation = async () => {
    if (!location) return;

    const { latitude, longitude } = location;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      setSharing(true);
      await Share.share({
        message: `${t('location.mobile.liveLocationShareLabel', 'My live location')}:\n${googleMapsUrl}`,
      });
    } catch {
      Alert.alert(
        t('common.error', 'Error'),
        t('location.mobile.unableToShareLocation', 'Unable to share location right now.')
      );
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t('location.mobile.liveLocation', 'Live Location')} onBackPress={() => navigation.goBack()}>
        <View style={mapStyles.centered}>
          <ThemedLoader size="large" />
          <Text style={mapStyles.loaderText}>{t('location.mobile.fetchingLocation', 'Fetching current location...')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!permissionGranted || !location) {
    return (
      <ScreenWrapper title={t('location.mobile.liveLocation', 'Live Location')} onBackPress={() => navigation.goBack()}>
        <View style={mapStyles.centered}>
          <Text style={mapStyles.errorTitle}>{t('location.mobile.locationUnavailable', 'Location unavailable')}</Text>
          <Text style={mapStyles.errorText}>
            {t('location.mobile.allowLocationAccess', 'Please allow location access to use live map sharing.')}
          </Text>
          <TouchableOpacity style={styles.mapActionBtn} onPress={requestLocationPermission}>
            <Text style={styles.mapActionText}>{t('location.mobile.grantPermission', 'Grant Permission')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={t('location.mobile.liveLocation', 'Live Location')}
      onBackPress={() => navigation.goBack()}
      rightIcon={
        <TouchableOpacity onPress={() => navigation.navigate('ShareSettings')}>
          <SettingIcon width={20} height={20} />
        </TouchableOpacity>
      }
    >
      <View style={styles.page}>
        <View style={styles.mapActionRow}>
          <TouchableOpacity
            style={[styles.mapActionBtn, sharing && mapStyles.disabledButton]}
            onPress={shareLocation}
            disabled={sharing}
          >
            {sharing ? (
              <ThemedLoader size="small" tone="onPrimary" />
            ) : (
              <Text style={styles.mapActionText}>{t('location.mobile.sendLocation', 'Send Location')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => getCurrentLocation(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <ThemedLoader size="small" tone="onPrimary" />
            ) : (
              <RefreshIcon width={18} height={18} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshBtn} onPress={openInMaps}>
            <Text style={mapStyles.mapEmoji}>{t('location.mobile.openMaps', 'OPEN')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={mapStyles.sectionTitle}>{t('location.mobile.currentLocation', 'Current location')}</Text>
        <View style={mapStyles.detailsCard}>
          <View style={mapStyles.detailRow}>
            <Text style={mapStyles.detailLabel}>{t('location.mobile.latitudeShort', 'Lat')}</Text>
            <Text style={mapStyles.detailValue}>{location.latitude.toFixed(6)}</Text>
          </View>
          <View style={mapStyles.detailRow}>
            <Text style={mapStyles.detailLabel}>{t('location.mobile.longitudeShort', 'Lng')}</Text>
            <Text style={mapStyles.detailValue}>{location.longitude.toFixed(6)}</Text>
          </View>
          <View style={mapStyles.detailRow}>
            <Text style={mapStyles.detailLabel}>{t('location.mobile.updated', 'Updated')}</Text>
            <Text style={mapStyles.detailValue}>{new Date().toLocaleTimeString()}</Text>
          </View>
          <Text style={mapStyles.helperText}>
            {t(
              'location.mobile.nativeMapsHelper',
              'Use Open to launch the default maps app on this device.'
            )}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const createMapStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loaderText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  mapEmoji: {
    fontSize: 10,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.75,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helperText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
