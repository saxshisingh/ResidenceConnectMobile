import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { createStyles } from './LocationFlow.styles';
import LocationIcon from '../../../../assets/Icons/Location.svg';
import SettingIcon from '../../../../assets/Icons/icon setting.svg';
import WebIcon from '../../../../assets/Icons/mdi_world-wide-web.svg';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

export default function LocationSharingScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sharingOn, setSharingOn] = useState(false);

  const handleToggle = () => {
    if (!sharingOn) {
      Alert.alert(
        t('location.mobile.startSharing', 'Start Location Sharing'),
        t('location.mobile.visibleToSelected', 'Your location will be visible to selected contacts.'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('location.mobile.start', 'Start'),
            onPress: () => setSharingOn(true),
          },
        ],
      );
    } else {
      Alert.alert(
        t('location.mobile.stopSharing', 'Stop Location Sharing'),
        t('location.mobile.noLongerVisible', 'Your location will no longer be visible.'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('location.mobile.stop', 'Stop'),
            style: 'destructive',
            onPress: () => setSharingOn(false),
          },
        ],
      );
    }
  };

  return (
    <ScreenWrapper
      title={t('location.mobile.title', 'Location Sharing')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.page}>
        <Text style={styles.headerSubtitle}>
          {t('location.mobile.subtitle', 'Share your real-time location with trusted members')}
        </Text>

        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={styles.locationIconCircle}>
              <LocationIcon width={20} height={20} />
            </View>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>
                {t('location.mobile.title', 'Location Sharing')}{' '}
                <Text style={sharingOn ? styles.liveGreen : styles.liveGray}>
                  {sharingOn ? t('location.mobile.live', '- Live') : t('location.mobile.off', '- Off')}
                </Text>
              </Text>
              <Text style={styles.toggleDesc}>
                {sharingOn
                  ? t('location.mobile.visibleToSelectedShort', 'Your location is visible to selected contacts')
                  : t('location.mobile.enableShare', 'Enable to share your location')}
              </Text>
            </View>
          </View>
          <Switch
            value={sharingOn}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>

        {sharingOn && (
          <View style={styles.activeShareCard}>
            <View style={styles.activeShareHeader}>
              <Text style={styles.activeShareTitle}>{t('location.mobile.activeSharing', 'Active Sharing')}</Text>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => navigation.navigate('ShareSettings')}
              >
                <Text style={styles.changeBtnText}>{t('common.change', 'Change')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.activeShareText}>
              {t('location.mobile.sharingWith', 'Sharing with')}:{' '}
              <Text style={styles.boldText}>
                {t('location.mobile.defaultSharingWith', 'Maria, Father, Security')}
              </Text>
            </Text>
            <Text style={styles.activeShareTime}>
              {t('location.mobile.duration', 'Duration')}: {t('location.mobile.untilTurnedOff', 'Until turned off')}
            </Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ShareSettings')}
          >
            <View style={styles.actionIconCircle}>
              <SettingIcon width={24} height={24} />
            </View>
            <Text style={styles.actionCardTitle}>{t('common.manage', 'Manage')}</Text>
            <Text style={styles.actionCardDesc}>{t('location.mobile.shareSettings', 'Share Settings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LocationMapView')}
          >
            <View style={[styles.actionIconCircle, styles.mapIconCircle]}>
              <WebIcon width={24} height={24} />
            </View>
            <Text style={styles.actionCardTitle}>{t('common.view', 'View')}</Text>
            <Text style={styles.actionCardDesc}>{t('location.mobile.currentLocation', 'Current Location')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('location.mobile.privacySecurity', 'Privacy and Security')}</Text>
          <Text style={styles.infoText}>
            {t(
              'location.mobile.privacyBullets',
              '- Only selected contacts can see your location\n- You control who sees and for how long\n- Stop sharing anytime with one tap\n- Location history is not stored'
            )}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}
