import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Circle, Path } from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { loadInbox, markConversationReadLocally } from '../../state/chatSlice';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import type { ThemeColors } from '../../../../theme/colors';

const EmptyIcon = ({ color, accent }: { color: string; accent: string }) => (
  <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
    <Circle
      cx={36}
      cy={36}
      r={34}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="5 3"
    />
    <Path
      d="M22 28a4 4 0 014-4h20a4 4 0 014 4v14a4 4 0 01-4 4H34l-8 6v-6h-4V28z"
      stroke={accent}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Circle cx={29} cy={35} r={2} fill={accent} />
    <Circle cx={36} cy={35} r={2} fill={accent} />
    <Circle cx={43} cy={35} r={2} fill={accent} />
  </Svg>
);

const getInitials = (name?: string) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p: string) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const AVATAR_PAIRS = [
  { bg: '#DBEAFE', fg: '#1D4ED8' },
  { bg: '#FCE7F3', fg: '#9D174D' },
  { bg: '#D1FAE5', fg: '#065F46' },
  { bg: '#FEF3C7', fg: '#92400E' },
  { bg: '#EDE9FE', fg: '#5B21B6' },
  { bg: '#FFEDD5', fg: '#C2410C' },
];

const getAvatarColors = (name?: string) => {
  const idx = ((name || '?').charCodeAt(0) || 0) % AVATAR_PAIRS.length;
  return AVATAR_PAIRS[idx];
};

const formatTimestamp = (
  ts: string | undefined,
  t: (key: string, fallback?: string) => string,
) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return t('chat.mobile.yesterday', 'Yesterday');
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    statsPill: {
      alignSelf: 'center',
      backgroundColor: colors.surfaceMuted,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 7,
      marginTop: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.3,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 32,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 76,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 4,
      backgroundColor: 'transparent',
    },
    avatarWrapper: {
      position: 'relative',
      marginRight: 14,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    onlineDot: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: '#22C55E',
      borderWidth: 2,
      borderColor: colors.background,
    },
    content: {
      flex: 1,
      gap: 5,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    nameUnread: {
      fontWeight: '800',
      color: colors.textPrimary,
    },
    time: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textMuted,
      flexShrink: 0,
    },
    timeUnread: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    preview: {
      fontSize: 13,
      color: colors.textMuted,
      flex: 1,
      fontWeight: '500',
      lineHeight: 18,
    },
    previewUnread: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.textPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      flexShrink: 0,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.onPrimary,
      letterSpacing: 0.2,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
      gap: 14,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    emptySubtext: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      fontWeight: '500',
    },
  });

const Avatar = ({
  item,
  failedImages,
  onError,
  styles,
}: {
  item: any;
  failedImages: Record<string, boolean>;
  onError: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
}) => {
  const imageUri = item.profilePhoto ? String(item.profilePhoto).trim() : '';
  const showImage = !!imageUri && !failedImages[item.conversationId];
  const { bg, fg } = getAvatarColors(item.userName);

  if (showImage) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.avatar}
        onError={() => onError(item.conversationId)}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: bg }]}>
      <Text style={[styles.avatarInitials, { color: fg }]}>
        {getInitials(item.userName)}
      </Text>
    </View>
  );
};

const InboxItem = ({
  item,
  onPress,
  failedImages,
  onImageError,
  styles,
  t,
}: {
  item: any;
  onPress: () => void;
  failedImages: Record<string, boolean>;
  onImageError: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, fallback?: string) => string;
}) => {
  const hasUnread = item.unreadCount > 0;
  const timeLabel = formatTimestamp(item.lastMessageAt, t);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.avatarWrapper}>
        <Avatar
          item={item}
          failedImages={failedImages}
          onError={onImageError}
          styles={styles}
        />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={[styles.time, hasUnread && styles.timeUnread]}>{timeLabel}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
            {item.lastMessage || t('chat.mobile.noMessagesYet', 'No messages yet')}
          </Text>

          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ChatScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const inbox = useSelector((state: any) => state.chat.inbox);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(loadInbox() as any);
  }, [dispatch]);

  const handleImageError = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  const totalUnread = useMemo(
    () => (inbox || []).reduce((sum: number, i: any) => sum + (i.unreadCount || 0), 0),
    [inbox],
  );
  const conversationLabel = t(
    inbox.length === 1 ? 'chat.mobile.conversationSingle' : 'chat.mobile.conversationPlural',
    inbox.length === 1 ? 'conversation' : 'conversations',
  );

  return (
    <ScreenWrapper title={t('chat.mobile.title', 'Messaging')}>
      <View style={styles.screen}>
        {inbox?.length > 0 && (
          <View style={styles.statsPill}>
            <Text style={styles.statsText}>
              {`${inbox.length} ${conversationLabel}`}
              {totalUnread > 0
                ? `  -  ${t('chat.mobile.unreadCount', '{{count}} unread').replace('{{count}}', String(totalUnread))}`
                : ''}
            </Text>
          </View>
        )}

        <FlatList
          data={inbox}
          keyExtractor={(item: any) => item.conversationId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }: any) => (
            <InboxItem
              item={item}
              onPress={() => {
                dispatch(markConversationReadLocally(item.conversationId));
                navigation.navigate('ChatDetail', {
                  conversationId: item.conversationId,
                  receiverId: item.userId,
                  name: item.userName,
                });
              }}
              failedImages={failedImages}
              onImageError={handleImageError}
              styles={styles}
              t={t}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <EmptyIcon color={colors.border} accent={colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {t('chat.mobile.noConversationsTitle', 'No conversations yet')}
              </Text>
              <Text style={styles.emptySubtext}>
                {t(
                  'chat.mobile.noConversationsDescription',
                  'Your messages will appear here once you start chatting',
                )}
              </Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default ChatScreen;
