import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import Warning1 from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 10_54_10 AM 2.svg';
import { getSOSAlertById, SOSAlertDetail } from '../../services/alertService';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

// ─── Icons ────────────────────────────────────────────────────────────────────

const LocationIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" fill="#94A3B8" />
  </Svg>
);

const PersonIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="#94A3B8" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="#94A3B8" />
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatValue = (v: unknown) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
};

const getUrgencyMeta = (value: string | undefined, t: (key: string, fallback?: string) => string) => {
  switch ((value || '').toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return { label: t('alert.mobile.common.urgent', 'Urgent'), color: '#DC2626', bg: '#FEF2F2', darkBg: 'rgba(220,38,38,0.15)' };
    case 'medium':
    case 'important':
      return { label: t('alert.mobile.common.important', 'Important'), color: '#D97706', bg: '#FFFBEB', darkBg: 'rgba(217,119,6,0.15)' };
    default:
      return { label: t('alert.mobile.common.regular', 'Regular'), color: '#2563EB', bg: '#EFF6FF', darkBg: 'rgba(37,99,235,0.15)' };
  }
};

const getStatusMeta = (status: number | undefined, t: (key: string, fallback?: string) => string) => {
  switch (status) {
    case 1:  return { label: t('alert.mobile.common.active', 'Active'), color: '#16A34A', bg: 'rgba(22,163,74,0.15)' };
    case 2:  return { label: t('alert.mobile.common.resolved', 'Resolved'), color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' };
    default: return { label: t('alert.mobile.common.pending', 'Pending'), color: '#D97706', bg: 'rgba(217,119,6,0.15)' };
  }
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({
  icon,
  label,
  value,
  isLast,
  styles,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
  styles: any;
}) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueRow}>
      {icon}
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const createDetailStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  row: {
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AlertDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const detailStyles = useMemo(() => createDetailStyles(colors), [colors]);

  const { alertId, alert: passedAlert } = route.params || {};
  const [alert, setAlert] = useState<SOSAlertDetail | null>(passedAlert || null);
  const [loading, setLoading] = useState(Boolean(alertId));
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!alertId) { setLoading(false); setError(t('alert.mobile.detail.errorMissingId', 'Alert ID is missing')); return; }
    (async () => {
      try {
        setLoading(true); setError(null);
        setAlert(await getSOSAlertById(alertId));
      } catch (err: any) {
        setError(err?.message || t('alert.mobile.detail.errorLoadFailed', 'Failed to load alert detail'));
      } finally {
        setLoading(false);
      }
    })();
  }, [alertId, route.params]);

  const formatDate = (ds?: string) => {
    if (!ds) return t('common.notAvailable', 'N/A');
    const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
    return new Date(ds).toLocaleString(locale, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <ScreenWrapper title={t('alert.mobile.detail.title', 'Alert Details')} onBackPress={() => navigation.goBack()}>
        <View style={styles.centerState}>
          <ThemedLoader size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !alert) {
    return (
      <ScreenWrapper title={t('alert.mobile.detail.title', 'Alert Details')} onBackPress={() => navigation.goBack()}>
        <View style={styles.centerState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || t('alert.mobile.detail.notFound', 'Alert not found')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const urgency = getUrgencyMeta(alert?.urgencyLevel, t);
  const status  = getStatusMeta((alert as any)?.status, t);

  return (
    <ScreenWrapper title={t('alert.mobile.detail.title', 'Alert Details')} onBackPress={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Dark Hero Card ── */}
        <View style={styles.heroCard}>
          {/* Urgency stripe */}
          <View style={[styles.heroStripe, { backgroundColor: urgency.color }]} />

          <View style={styles.heroInner}>
            {/* Icon */}
            <View style={[styles.heroIconCircle, { backgroundColor: urgency.darkBg }]}>
              <Warning1 width={32} height={32} />
            </View>

            {/* Badges */}
            <View style={styles.heroBadgeRow}>
              <View style={[styles.heroBadge, { backgroundColor: urgency.darkBg }]}>
                <Text style={[styles.heroBadgeText, { color: urgency.color }]}>
                  {urgency.label}
                </Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.heroBadgeText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.heroBadgeText, { color: '#94A3B8' }]}>
                  {(alert as any)?.alertCode}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.heroTitle}>
              {alert.title || (alert as any)?.alertCode || t('alert.mobile.common.untitled', 'Untitled Alert')}
            </Text>

            {/* Message */}
            {(alert.message || alert.notes) ? (
              <Text style={styles.heroMessage}>
                {alert.message || alert.notes}
              </Text>
            ) : null}

            {/* Delivery stats */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{(alert as any)?.totalDelivered ?? 0}</Text>
                <Text style={styles.heroStatLabel}>{t('alert.mobile.detail.delivered', 'Delivered')}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{(alert as any)?.totalSeen ?? 0}</Text>
                <Text style={styles.heroStatLabel}>{t('alert.mobile.detail.seen', 'Seen')}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatDate}>
                  {formatDate(alert.createdAt || (alert as any)?.alertDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Detail Rows ── */}
        <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detailCardTitle, { color: colors.textMuted }]}>{t('alert.mobile.detail.incidentInformation', 'Incident Information')}</Text>

          {[
            { label: t('alert.mobile.detail.reportedBy', 'Reported By'), value: formatValue((alert as any)?.createdByName), icon: <PersonIcon /> },
            { label: t('alert.mobile.detail.mobile', 'Mobile'), value: formatValue((alert as any)?.mobile), icon: <PhoneIcon /> },
            { label: t('alert.mobile.detail.unit', 'Unit'), value: formatValue((alert as any)?.unit || alert.apartmentUnit) },
            { label: t('alert.mobile.detail.block', 'Block'), value: formatValue(alert.blockName) },
            { label: t('alert.mobile.detail.location', 'Location'), value: formatValue(alert.location), icon: <LocationIcon /> },
            { label: t('alert.mobile.detail.alertCode', 'Alert Code'), value: formatValue((alert as any)?.alertCode) },
            { label: t('alert.mobile.detail.notes', 'Notes'), value: formatValue(alert.notes) },
          ]
            .filter(r => r.value !== null)
            .map((r, i, arr) => (
              <DetailRow
                key={r.label}
                label={r.label}
                value={r.value!}
                icon={r.icon}
                isLast={i === arr.length - 1}
                styles={detailStyles}
              />
            ))}
        </View>
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

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorIcon: { fontSize: 48 },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Hero
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#1E293B',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  heroStripe: {
    height: 4,
  },
  heroInner: {
    padding: 20,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 10,
    lineHeight: 28,
  },
  heroMessage: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    fontWeight: '500',
    marginBottom: 20,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    gap: 0,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  heroStatDate: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Detail card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    shadowColor: colors.overlay,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  detailCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
});
