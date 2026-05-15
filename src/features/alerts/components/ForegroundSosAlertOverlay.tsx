import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useI18n } from '../../../i18n';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { navigationRef } from '../../../navigation/navigationRef';
import {
  ForegroundSosAlertPayload,
  setForegroundSosAlertListener,
} from './foregroundSosAlertBus';

const WarningMark = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8v5m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const ArrowIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M13 6l6 6-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const getUrgencyMeta = (level: string | undefined, t: (key: string, fallback?: string) => string) => {
  switch ((level || '').toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return {
        label: t('alert.mobile.common.urgent', 'Urgent'),
        accent: '#DC2626',
        soft: '#FEE2E2',
        title: t('alert.mobile.block.topAccentText', 'Emergency Alert'),
      };
    case 'medium':
    case 'important':
      return {
        label: t('alert.mobile.common.important', 'Important'),
        accent: '#D97706',
        soft: '#FEF3C7',
        title: t('alert.mobile.overlay.priorityTitle', 'Priority Alert'),
      };
    default:
      return {
        label: t('alert.mobile.common.regular', 'Regular'),
        accent: '#2563EB',
        soft: '#DBEAFE',
        title: t('alert.mobile.overlay.updateTitle', 'Residence Update'),
      };
  }
};

export default function ForegroundSosAlertOverlay() {
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [payload, setPayload] = useState<ForegroundSosAlertPayload | null>(null);

  useEffect(() => {
    setForegroundSosAlertListener(next => {
      setPayload(next);
    });

    return () => setForegroundSosAlertListener(null);
  }, []);

  const close = () => setPayload(null);

  if (!payload) return null;

  const urgency = getUrgencyMeta(payload.urgencyLevel, t);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => undefined}
        >
          <View style={[styles.topBar, { backgroundColor: urgency.accent }]} />

          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: urgency.soft }]}>
              <WarningMark color={urgency.accent} />
            </View>

            <View style={styles.headerTextWrap}>
              <Text style={[styles.kicker, { color: urgency.accent }]}>
                {urgency.title}
              </Text>
              <Text style={[styles.heading, { color: colors.textPrimary }]}>
                {payload.title}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: urgency.soft }]}>
              <Text style={[styles.badgeText, { color: urgency.accent }]}>
                {urgency.label}
              </Text>
            </View>
          </View>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {payload.message}
          </Text>

          {!!payload.location && (
            <View style={[styles.locationBox, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.locationLabel, { color: colors.textMuted }]}>
                {t('alert.mobile.detail.location', 'Location')}
              </Text>
              <Text style={[styles.locationText, { color: colors.textPrimary }]}>
                {payload.location}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.surfaceMuted }]}
              onPress={close}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                {t('alert.mobile.overlay.dismiss', 'Dismiss')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: urgency.accent }]}
              onPress={() => {
                close();
                if (navigationRef.isReady()) {
                  (navigationRef as any).navigate('AlertDetail', {
                    alertId: payload.alertId,
                    alert: payload.alert,
                  });
                }
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>{t('alert.mobile.overlay.viewDetails', 'View Details')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.56)',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    card: {
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.24,
      shadowRadius: 22,
      elevation: 18,
      padding: 18,
    },
    topBar: {
      height: 6,
      borderRadius: 999,
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextWrap: {
      flex: 1,
    },
    kicker: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    heading: {
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 25,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginTop: 2,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    message: {
      marginTop: 16,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500',
    },
    locationBox: {
      marginTop: 16,
      borderRadius: 16,
      padding: 14,
    },
    locationLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    locationText: {
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 20,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
    },
    secondaryBtn: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
    },
    primaryBtn: {
      flex: 1.35,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
