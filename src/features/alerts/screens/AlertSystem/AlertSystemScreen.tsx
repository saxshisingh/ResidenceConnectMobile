import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Warning1 from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 10_54_10 AM 2.svg';
import WarningIcon from '../../../../assets/Icons/warning.svg';
import { getSOSAlerts } from '../../services/alertService';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import EmptyState from '../../../../components/EmptyState';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';

const getUrgencyMeta = (level: string | undefined, t: (key: string, fallback?: string) => string) => {
  switch ((level || '').toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return { label: t('alert.mobile.common.urgent', 'Urgent'), color: '#DC2626', bg: '#FEF2F2' };
    case 'medium':
    case 'important':
      return { label: t('alert.mobile.common.important', 'Important'), color: '#D97706', bg: '#FFFBEB' };
    default:
      return { label: t('alert.mobile.common.regular', 'Regular'), color: '#2563EB', bg: '#EFF6FF' };
  }
};

const getStatusMeta = (status: number | undefined, t: (key: string, fallback?: string) => string) => {
  switch (status) {
    case 1:
      return { label: t('alert.mobile.common.active', 'Active'), color: '#16A34A', bg: '#DCFCE7' };
    case 2:
      return { label: t('alert.mobile.common.resolved', 'Resolved'), color: '#64748B', bg: '#F1F5F9' };
    default:
      return { label: t('alert.mobile.common.pending', 'Pending'), color: '#D97706', bg: '#FFFBEB' };
  }
};

const formatRelativeDate = (
  dateString: string | undefined,
  t: (key: string, fallback?: string) => string,
  language: string,
) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
  if (diffDays === 0) {
    return `${t('alert.mobile.common.today', 'Today')}, ${d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
  if (diffDays === 1) return t('alert.mobile.common.yesterday', 'Yesterday');
  if (diffDays < 7) return t('alert.mobile.common.daysAgo', '{{count}} days ago').replace('{{count}}', String(diffDays));
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

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
        <View style={styles.cardTopRow}>
          <View style={[styles.cardIconCircle, { backgroundColor: urgency.bg }]}>
            <Warning1 width={20} height={20} />
          </View>
          <View style={styles.cardBadges}>
            <View style={[styles.pill, { backgroundColor: urgency.bg }]}>
              <Text style={[styles.pillText, { color: urgency.color }]}>{urgency.label}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: status.bg }]}>
              <Text style={[styles.pillText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {alert.title || alert.alertCode || t('alert.mobile.common.untitled', 'Untitled Alert')}
        </Text>
        {alert.message ? (
          <Text style={[styles.cardMessage, { color: colors.textSecondary }]} numberOfLines={2}>{alert.message}</Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
            {[alert.blockName, alert.unit].filter(Boolean).join(' • ')}
          </Text>
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>{formatRelativeDate(alert.createdAt, t, language)}</Text>
        </View>

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
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function AlertSystemScreen() {
  const navigation = useNavigation<any>();
  const { language, t } = useI18n();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchAlerts();
    }, []),
  );

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getSOSAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const urgentCount  = alerts.filter(a => ['high','critical','urgent'].includes((a.urgencyLevel||'').toLowerCase())).length;
  const activeCount  = alerts.filter(a => a.status === 1).length;

  return (
    <ScreenWrapper
      title={t('home.mobile.residenceNews', 'Residence News')}
      onBackPress={() => navigation.goBack()}
      rightIcon={
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AlertMyBlock')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.heroBanner}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>
              {t('home.mobile.residenceNews', 'Residence News')}
            </Text>
            <Text style={styles.heroSubtitle}>
              {t(
                'alert.mobile.system.heroSubtitle',
                "Stay informed about your building's safety alerts",
              )}
            </Text>
          </View>

          {alerts.length > 0 && (
            <View style={styles.heroStats}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipNum}>{alerts.length}</Text>
                <Text style={styles.heroChipLabel}>{t('alert.mobile.system.total', 'Total')}</Text>
              </View>
              <View style={[styles.heroChip, styles.heroChipRed]}>
                <Text style={[styles.heroChipNum, { color: '#DC2626' }]}>{urgentCount}</Text>
                <Text style={[styles.heroChipLabel, { color: '#DC2626' }]}>
                  {t('alert.mobile.common.urgent', 'Urgent')}
                </Text>
              </View>
              <View style={[styles.heroChip, styles.heroChipGreen]}>
                <Text style={[styles.heroChipNum, { color: '#16A34A' }]}>{activeCount}</Text>
                <Text style={[styles.heroChipLabel, { color: '#16A34A' }]}>
                  {t('alert.mobile.common.active', 'Active')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.noticeCard, { backgroundColor: colors.backgroundAlt, borderLeftColor: colors.primary }]}>
          <Text style={styles.noticeIcon}>!</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>
              {t('alert.mobile.system.emergencyTitle', 'Emergency Use Only')}
            </Text>
            <Text style={styles.noticeText}>
              {t('alert.mobile.system.emergencyText',
                'Triggering an alert will notify all relevant residents and the management team immediately.')}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('alert.mobile.system.allResidenceNews', 'All Residence News')}
        </Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ThemedLoader size="small" />
            <Text style={styles.loadingText}>
              {t('alert.mobile.system.loadingAlerts', 'Loading alerts...')}
            </Text>
          </View>
        ) : alerts.length > 0 ? (
          alerts.map((alert, index) => (
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
          ))
        ) : (
          <EmptyState
            title={t('alert.mobile.system.noResidenceNewsYet', 'No residence news yet')}
            description={t(
              'alert.mobile.system.noAlertsYetDesc',
              'Recent emergency alerts will appear here.',
            )}
            illustration={<WarningIcon width={64} height={64} />}
            compact
          />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  heroBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  heroTextBlock: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    lineHeight: 18,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
  },
  heroChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  heroChipRed: {
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  heroChipGreen: {
    backgroundColor: 'rgba(22,163,74,0.12)',
  },
  heroChipNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  noticeCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  noticeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 3,
  },
  noticeText: {
    fontSize: 12,
    color: '#A16207',
    lineHeight: 17,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: colors.overlay,
    shadowOpacity: 0.13,
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
  cardBadges: {
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
    gap: 8,
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
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
