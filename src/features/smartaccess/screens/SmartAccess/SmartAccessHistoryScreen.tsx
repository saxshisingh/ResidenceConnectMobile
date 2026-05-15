import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

import BackButton from '../../../../components/BackButton';
import DoorFrontIcon from '../../../../assets/Icons/door_front.svg';
import DoorSlidingIcon from '../../../../assets/Icons/door_sliding.svg';
import MapsHomeWorkIcon from '../../../../assets/Icons/maps_home_work.svg';
import AccessFallbackIcon from '../../../../assets/Icons/image 88.svg';
import {useAppSelector} from '../../../../redux/hooks';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';
import type {ThemeColors} from '../../../../theme/colors';
import {
  getResidentAccessLogs,
  type ResidentAccessLog,
} from '../../services/accessDeviceService';

type AccessIconComponent = React.ComponentType<any>;

const ACCESS_ICON_MAP: Record<string, AccessIconComponent> = {
  main: DoorFrontIcon,
  entrance: DoorFrontIcon,
  door: DoorFrontIcon,
  gate: DoorSlidingIcon,
  lobby: MapsHomeWorkIcon,
  lift: MapsHomeWorkIcon,
  elevator: MapsHomeWorkIcon,
};

const getAccessIcon = (title: string): AccessIconComponent => {
  const normalized = String(title || '').toLowerCase();
  const matchedKey = Object.keys(ACCESS_ICON_MAP).find(key => normalized.includes(key));
  return matchedKey ? ACCESS_ICON_MAP[matchedKey] : AccessFallbackIcon;
};

const formatTimestamp = (
  value: string | undefined,
  t: (key: string, fallback?: string) => string,
) => {
  if (!value) {
    return t('mobile.smartAccess.history.timeUnavailable', 'Time unavailable');
  }

  const asNumber = Number(value);
  const date =
    Number.isFinite(asNumber) && asNumber > 0
      ? new Date(asNumber)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getStatusTone = (status: string) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('fail') || normalized.includes('error')) {
    return 'danger';
  }
  return 'success';
};

const RefreshActionIcon = ({
  color,
  size = 16,
}: {
  color: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11a8 8 0 10-2.34 5.66M20 11V4m0 7h-7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SmartAccessHistoryScreen() {
  const navigation = useNavigation<any>();
  const {colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAppSelector(state => state.auth.user);
  const residentId = user?.data?.residentId;

  const [logs, setLogs] = useState<ResidentAccessLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const loadLogs = async () => {
    if (!residentId) {
      setLogs([]);
      setLogsError(
        t('mobile.smartAccess.history.missingResident', 'Resident ID is missing for this account.'),
      );
      return;
    }

    try {
      setLoadingLogs(true);
      setLogsError(null);
      const nextLogs = await getResidentAccessLogs(String(residentId));
      setLogs(nextLogs);
    } catch (error: any) {
      setLogsError(
        error?.message || t('mobile.smartAccess.history.loadError', 'Unable to load smart access history.'),
      );
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs().catch(() => null);
  }, [residentId, t]);

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="smartAccessHistoryBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.gradientTop} />
            <Stop offset="100%" stopColor={colors.gradientBottom} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#smartAccessHistoryBg)" />
      </Svg>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton onPress={() => navigation.goBack()} color={colors.textPrimary} />
            <Text style={styles.headerTitle}>
              {t('mobile.smartAccess.history.title', 'Access History')}
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={() => loadLogs()}>
            {loadingLogs ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshActionIcon color={colors.primary} size={16} />
            )}
          </TouchableOpacity>
        </View>

        {loadingLogs && logs.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.loaderRing}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.stateTitle}>
              {t('mobile.smartAccess.history.loadingTitle', 'Loading history')}
            </Text>
            <Text style={styles.stateSubtitle}>
              {t(
                'mobile.smartAccess.history.loadingDescription',
                'Pulling your access events from the server.',
              )}
            </Text>
          </View>
        ) : null}

        {!loadingLogs && logsError ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <Text style={styles.stateIconText}>!</Text>
            </View>
            <Text style={styles.stateTitle}>
              {t('mobile.smartAccess.history.errorTitle', 'Unable to load history')}
            </Text>
            <Text style={styles.stateSubtitle}>{logsError}</Text>
          </View>
        ) : null}

        {!loadingLogs && !logsError && logs.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconWrap}>
              <Text style={styles.stateIconText}>+</Text>
            </View>
            <Text style={styles.stateTitle}>
              {t('mobile.smartAccess.history.emptyTitle', 'No history yet')}
            </Text>
            <Text style={styles.stateSubtitle}>
              {t(
                'mobile.smartAccess.history.emptyDescription',
                'Your smart access actions will appear here after you use lock or unlock.',
              )}
            </Text>
          </View>
        ) : null}

        {logs.length > 0 ? (
          <View style={styles.logList}>
            {logs.map(log => {
              const IconComponent = getAccessIcon(log.title);
              const tone = getStatusTone(log.status);

              return (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logCardLeft}>
                    <View style={styles.logIconCircle}>
                      <IconComponent width={24} height={24} />
                    </View>

                    <View style={styles.logInfo}>
                      <Text style={styles.logTitle}>{log.title}</Text>
                      {log.subtitle ? (
                        <Text style={styles.logSubtitle}>{log.subtitle}</Text>
                      ) : null}
                      <Text style={styles.logTimestamp}>
                        {formatTimestamp(log.timestamp, t)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.logStatusPill,
                      tone === 'danger' ? styles.logStatusDanger : styles.logStatusSuccess,
                    ]}
                  >
                    <Text
                      style={[
                        styles.logStatusText,
                        tone === 'danger'
                          ? styles.logStatusDangerText
                          : styles.logStatusSuccessText,
                      ]}
                    >
                      {`${log.action} • ${log.status}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 58,
      paddingBottom: 40,
      gap: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      flexShrink: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      marginLeft: -2,
    },
    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    stateCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 28,
      alignItems: 'center',
    },
    loaderRing: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    stateIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    stateIconText: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    stateTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
      textAlign: 'center',
    },
    stateSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
      textAlign: 'center',
    },
    logList: {
      gap: 14,
    },
    logCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    logCardLeft: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'center',
    },
    logIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logInfo: {
      flex: 1,
      gap: 3,
    },
    logTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    logSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    logTimestamp: {
      fontSize: 11,
      color: colors.textMuted,
    },
    logStatusPill: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
    },
    logStatusSuccess: {
      backgroundColor: colors.surfaceMuted,
      borderColor: 'rgba(243,126,0,0.20)',
    },
    logStatusDanger: {
      backgroundColor: 'rgba(220,38,38,0.08)',
      borderColor: 'rgba(220,38,38,0.20)',
    },
    logStatusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    logStatusSuccessText: {
      color: colors.primary,
    },
    logStatusDangerText: {
      color: colors.danger,
    },
  });
