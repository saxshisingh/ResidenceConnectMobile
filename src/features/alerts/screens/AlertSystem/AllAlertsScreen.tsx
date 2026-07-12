import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Warning1 from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 10_54_10 AM 2.svg';
import WarningIcon from '../../../../assets/Icons/warning.svg';
import { getSOSAlerts } from '../../services/alertService';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import EmptyState from '../../../../components/EmptyState';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUrgencyMeta = (level: string | undefined, t: (key: string, fallback?: string) => string) => {
  switch ((level || '').toLowerCase()) {
    case 'critical': case 'high': case 'urgent':
      return { label: t('alert.mobile.common.urgent', 'Urgent'), color: '#DC2626', bg: '#FEF2F2' };
    case 'medium':   case 'important':
      return { label: t('alert.mobile.common.important', 'Important'), color: '#D97706', bg: '#FFFBEB' };
    default:
      return { label: t('alert.mobile.common.regular', 'Regular'), color: '#2563EB', bg: '#EFF6FF' };
  }
};

const getStatusMeta = (status: number | undefined, t: (key: string, fallback?: string) => string) => {
  switch (status) {
    case 1:  return { label: t('alert.mobile.common.active', 'Active'), color: '#16A34A', bg: '#DCFCE7' };
    case 2:  return { label: t('alert.mobile.common.resolved', 'Resolved'), color: '#64748B', bg: '#F1F5F9' };
    default: return { label: t('alert.mobile.common.pending', 'Pending'), color: '#D97706', bg: '#FFFBEB' };
  }
};

const formatRelativeDate = (
  ds: string | undefined,
  t: (key: string, fallback?: string) => string,
  language: string,
) => {
  if (!ds) return '';
  const d = new Date(ds);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
  if (diff === 0) {
    return `${t('alert.mobile.common.today', 'Today')}, ${d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
  if (diff === 1) return t('alert.mobile.common.yesterday', 'Yesterday');
  if (diff < 7) {
    return t('alert.mobile.common.daysAgo', '{{count}} days ago').replace('{{count}}', String(diff));
  }
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Alert Card ───────────────────────────────────────────────────────────────

const AlertCard = ({
  alert,
  onPress,
  t,
  language,
  styles,
}: {
  alert: any;
  onPress: () => void;
  t: (key: string, fallback?: string) => string;
  language: string;
  styles: any;
}) => {
  const { colors } = useAppTheme();
  const urgency = getUrgencyMeta(alert.urgencyLevel, t);
  const status  = getStatusMeta(alert.status, t);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]} onPress={onPress} activeOpacity={0.78}>
      <View style={[styles.cardAccent, { backgroundColor: urgency.color }]} />

      <View style={styles.cardBody}>
        {/* Top */}
        <View style={styles.cardTopRow}>
          <View style={[styles.cardIconCircle, { backgroundColor: urgency.bg }]}>
            <Warning1 width={20} height={20} />
          </View>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: urgency.bg }]}>
              <Text style={[styles.pillText, { color: urgency.color }]}>{urgency.label}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: status.bg }]}>
              <Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {alert.title || alert.alertCode || t('alert.mobile.common.untitled', 'Untitled Alert')}
        </Text>

        {/* Message */}
        {(alert.message || alert.notes) ? (
          <Text style={[styles.cardMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {alert.message || alert.notes}
          </Text>
        ) : null}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
            📍 {alert.blockName}  ·  {alert.unit}
          </Text>
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>{formatRelativeDate(alert.createdAt, t, language)}</Text>
        </View>

        {/* Delivery stats */}
        {(alert.totalDelivered > 0 || alert.totalSeen > 0) && (
          <View style={styles.statsRow}>
            <View style={[styles.statChip, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.textPrimary }]}>{alert.totalDelivered}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('alert.mobile.detail.delivered', 'Delivered')}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.textPrimary }]}>{alert.totalSeen}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('alert.mobile.detail.seen', 'Seen')}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
              <Text style={[styles.statCode, { color: colors.textSecondary }]}>{alert.alertCode}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AllAlertsScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useI18n();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setAlerts(await getSOSAlerts());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const urgentCount  = alerts.filter(a => ['high','critical','urgent'].includes((a.urgencyLevel||'').toLowerCase())).length;
  const resolvedCount = alerts.filter(a => a.status === 2).length;

  return (
    <ScreenWrapper
      title={t('alert.mobile.system.allAlertsTitle', 'All Alerts')}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />}
      >
        {/* ── Summary band ── */}
        {alerts.length > 0 && !loading && (
          <View style={styles.summaryBand}>
            <View style={[styles.summaryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.summaryNum}>{alerts.length}</Text>
              <Text style={styles.summaryLabel}>{t('alert.mobile.system.total', 'Total')}</Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryNum, { color: '#DC2626' }]}>{urgentCount}</Text>
              <Text style={[styles.summaryLabel, { color: '#DC2626' }]}>
                {t('alert.mobile.common.urgent', 'Urgent')}
              </Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryNum, { color: '#64748B' }]}>{resolvedCount}</Text>
              <Text style={[styles.summaryLabel, { color: '#64748B' }]}>
                {t('alert.mobile.common.resolved', 'Resolved')}
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ThemedLoader size="large" />
            <Text style={styles.loadingText}>
              {t('alert.mobile.system.loadingAlerts', 'Loading alerts…')}
            </Text>
          </View>
        ) : alerts.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {t('alert.mobile.system.alertsFound', '{{count}} alerts found').replace(
                '{{count}}',
                String(alerts.length),
              )}
            </Text>
            {alerts.map((alert, index) => (
              <AlertCard
                key={alert.alertId || alert.sosAlertId || index}
                alert={alert}
                t={t}
                language={language}
                styles={styles}
                onPress={() =>
                  navigation.navigate('AlertDetail', {
                    alertId: alert.alertId || alert.sosAlertId || alert.id,
                    alert,
                  })
                }
              />
            ))}
          </>
        ) : (
          <EmptyState
            title={t('alert.mobile.system.noAlertsFound', 'No alerts found')}
            description={t('alert.mobile.system.noAlertsFoundDesc', 'All emergency alerts will appear here.')}
            illustration={<WarningIcon width={72} height={72} />}
          />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Summary
  summaryBand: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.overlay,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
  },
  summaryNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: colors.overlay,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  cardDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  // Loading
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
