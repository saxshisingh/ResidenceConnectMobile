import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { useAppSelector } from '../../../../redux/hooks';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import type { ThemeColors } from '../../../../theme/colors';
import {
  getSecurityCallLogs,
  SecurityCallLog,
} from '../../services/callLogsService';

const PhoneIncomingIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 2v6m0 0l-3-3m3 3l3-3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneOutgoingIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 8V2m0 0l-3 3m3-3l3 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneMissedIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 11l5-5m0 0h-4m4 0V2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EmptyStateIcon = ({ color }: { color: string }) => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <Circle
      cx={32}
      cy={32}
      r={30}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="4 3"
    />
    <Path
      d="M42 38.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 0124.11 24h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L28.09 31.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0142 38.92z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M38 20l6-6m0 0h-4m4 0v4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const getInitials = (name: string) => {
  const parts = String(name || '').trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return String(name || '?')[0].toUpperCase();
};

type CallType = 'incoming' | 'outgoing' | 'missed' | string;

const getCallMeta = (type: CallType) => {
  const normalized = String(type || '').toLowerCase();
  if (normalized.includes('miss')) {
    return {
      labelKey: 'calllogs.mobile.types.missed',
      fallback: 'Missed',
      color: '#EF4444',
      bg: '#FEF2F2',
      icon: PhoneMissedIcon,
    };
  }
  if (normalized.includes('out')) {
    return {
      labelKey: 'calllogs.mobile.types.outgoing',
      fallback: 'Outgoing',
      color: '#3B82F6',
      bg: '#EFF6FF',
      icon: PhoneOutgoingIcon,
    };
  }
  return {
    labelKey: 'calllogs.mobile.types.incoming',
    fallback: 'Incoming',
    color: '#10B981',
    bg: '#ECFDF5',
    icon: PhoneIncomingIcon,
  };
};

const AVATAR_PALETTE = [
  ['#1E3A5F', '#DBEAFE'],
  ['#4A1942', '#F3E8FF'],
  ['#1A3A2A', '#DCFCE7'],
  ['#3B1F08', '#FEF3C7'],
  ['#1F2937', '#F3F4F6'],
];

const getAvatarColors = (name: string) => {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
};

const createCardStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 16,
      marginBottom: 10,
      paddingVertical: 14,
      paddingRight: 14,
      paddingLeft: 0,
      overflow: 'hidden',
      shadowColor: colors.overlay,
      shadowOpacity: 0.13,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    accentBar: {
      width: 4,
      alignSelf: 'stretch',
      borderRadius: 2,
      marginRight: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    content: {
      flex: 1,
      gap: 3,
    },
    name: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.1,
    },
    details: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    time: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      flexShrink: 0,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });

const CallLogCard = React.memo(
  ({ item, colors }: { item: SecurityCallLog; colors: ThemeColors }) => {
    const styles = useMemo(() => createCardStyles(colors), [colors]);
    const { t } = useI18n();
    const meta = getCallMeta(item.type);
    const CallIcon = meta.icon;
    const [avatarFg, avatarBg] = getAvatarColors(item.name);

    return (
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: meta.color }]} />

        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarFg }]}>
            {getInitials(item.name)}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.details ? (
            <Text style={styles.details} numberOfLines={1}>
              {item.details}
            </Text>
          ) : null}
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: meta.bg }]}>
          <CallIcon color={meta.color} />
          <Text style={[styles.badgeText, { color: meta.color }]}>
            {t(meta.labelKey, meta.fallback)}
          </Text>
        </View>
      </View>
    );
  },
);

const createScreenStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingTop: 16,
      paddingBottom: 32,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginHorizontal: 20,
      marginBottom: 10,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 32,
    },
    stateText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      color: colors.textMuted,
    },
    errorIcon: {
      fontSize: 48,
      color: colors.textMuted,
    },
    retryBtn: {
      marginTop: 4,
      paddingHorizontal: 28,
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    retryBtnText: {
      color: colors.onPrimary,
      fontWeight: '700',
      fontSize: 14,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptySubtext: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

export default function CallLogsScreen({ navigation }: any) {
  const user = useAppSelector(state => state.auth.user);
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createScreenStyles(colors), [colors]);
  const userId = user?.data?.userId;

  const [callLogs, setCallLogs] = useState<SecurityCallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCallLogs = useCallback(
    async (isRefresh = false) => {
      if (!userId) {
        setCallLogs([]);
        setError(t('common.mobile.userNotFound', 'User information not found.'));
        return;
      }

      try {
        setError(null);
        isRefresh ? setRefreshing(true) : setLoading(true);
        const response = await getSecurityCallLogs(String(userId));
        setCallLogs(response);
      } catch (e: any) {
        setError(
          e?.message || t('calllogs.mobile.errorLoad', 'Failed to load call logs'),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t, userId],
  );

  useFocusEffect(
    useCallback(() => {
      loadCallLogs();
    }, [loadCallLogs]),
  );

  return (
    <ScreenWrapper
      title={t('calllogs.mobile.title', 'Call Logs')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>
              {t('calllogs.mobile.loading', 'Loading call logs...')}
            </Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerState}>
            <Text style={styles.errorIcon}>!</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadCallLogs()}>
              <Text style={styles.retryBtnText}>
                {t('common.mobile.common.retry', 'Retry')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={callLogs}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              callLogs.length > 0 ? (
                <Text style={styles.sectionLabel}>
                  {t(
                    callLogs.length === 1
                      ? 'calllogs.mobile.recordSingle'
                      : 'calllogs.mobile.recordPlural',
                    callLogs.length === 1 ? '1 Record' : '{{count}} Records',
                  ).replace('{{count}}', String(callLogs.length))}
                </Text>
              ) : null
            }
            renderItem={({ item }) => <CallLogCard item={item} colors={colors} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <EmptyStateIcon color={colors.border} />
                <Text style={styles.emptyTitle}>
                  {t('calllogs.mobile.emptyTitle', 'No call logs yet')}
                </Text>
                <Text style={styles.emptySubtext}>
                  {t(
                    'calllogs.mobile.emptyDescription',
                    'Security call activity will appear here',
                  )}
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadCallLogs(true)}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
