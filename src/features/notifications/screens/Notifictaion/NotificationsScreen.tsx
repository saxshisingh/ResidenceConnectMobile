/* eslint-disable react/no-unstable-nested-components */
// NotificationsScreen.tsx — Elegantly Redesigned
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { createStyles } from './Notifiction.styles';
import BellIcon from '../../../../assets/Icons/illustration.svg';
import EmptyImage from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 08_43_34 AM 1.svg';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchNotifications } from '../../state/notificationSlice';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { t, language } = useI18n();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);

  const { notifications, loading, hasFetched } = useAppSelector(
    state => state.notifications,
  );

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const residentId = user?.data?.residentId;
        if (residentId) {
          dispatch(fetchNotifications(residentId));
        } else {
          console.error('No resident ID found');
        }
      };
      load();
    }, [dispatch, user?.data?.residentId]),
  );

  const showLoader = loading && !hasFetched;
  const isEmpty = hasFetched && !loading && notifications.length === 0;

  const formatDate = (date: string) => {
    const locale =
      language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
    return new Date(date).toLocaleDateString(locale);
  };

  const handleNotificationPress = (item: any) => {
    const residentId = user?.data?.residentId;
    if (!residentId) return;
    navigation.navigate('NotificationDetail', {
      notificationId: item.id,
      residentId,
      notification: item,
    });
  };

  return (
    <ScreenWrapper
      title={t('notification.list.title', 'Notifications')}
      onBackPress={() => navigation.goBack()}
    >
      {/* ── Hero header card ── */}
      <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroContent}>
          <View style={styles.heroIconBox}>
            <BellIcon width={22} height={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {t('notification.list.title', 'Notifications')}
            </Text>
            <Text style={styles.heroSub}>
              {t('notification.list.subtitle', 'Your latest updates & alerts')}
            </Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={[styles.heroStat, { backgroundColor: '#E87722' }]}>
            <Text style={styles.heroStatNum}>{notifications.length}</Text>
            <Text style={styles.heroStatLabel}>
              {t('notification.list.total', 'TOTAL')}
            </Text>
          </View>
          <View style={[styles.heroStat, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.heroStatNum}>
              {notifications.filter((n: any) => !n.isSeen).length}
            </Text>
            <Text style={styles.heroStatLabel}>
              {t('notification.list.unread', 'UNREAD')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, isEmpty && { flexGrow: 1 }]}
      >
        {/* ── Loading ── */}
        {showLoader && (
          <ThemedLoader size="large" style={{ marginTop: 40 }} />
        )}

        {/* ── Empty state ── */}
        {isEmpty && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <EmptyImage />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {t('notification.list.emptyTitle', 'No Notifications')}
              {'\n'}
              {t('notification.list.emptyTitleSuffix', 'Right Now')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              {t(
                'notification.list.emptyDescription',
                "We'll notify you when something important comes up.",
              )}
            </Text>
          </View>
        )}

        {/* ── Notification list ── */}
        {!showLoader && !isEmpty && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, width: contentWidth, alignSelf: 'center', marginHorizontal: 0 }]}>
              {t('notification.list.recent', 'RECENT')}
            </Text>

            {notifications.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  !item.isSeen && styles.notificationCardUnread,
                  { backgroundColor: colors.surface, width: contentWidth, alignSelf: 'center' },
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.8}
              >
                {/* Unread accent bar */}
                {!item.isSeen && (
                  <View style={styles.unreadBar} />
                )}

                <View style={[styles.iconCircle, { backgroundColor: '#FFF0E0' }]}>
                  <BellIcon width={20} height={20} />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationTopRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        { color: colors.textPrimary },
                        !item.isSeen && styles.notificationTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {!item.isSeen && <View style={styles.unreadDot} />}
                  </View>
                  <Text
                    style={[styles.notificationDesc, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.content}
                  </Text>
                  <Text style={[styles.time, { color: colors.textMuted }]}>
                    {formatDate(item.createdOn)}
                  </Text>
                </View>

                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

    </ScreenWrapper>
  );
}
