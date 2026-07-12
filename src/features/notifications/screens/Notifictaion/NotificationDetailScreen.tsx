// NotificationDetailScreen.tsx — Elegantly Redesigned
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { createStyles } from './Notifiction.styles';
import BellIcon from '../../../../assets/Icons/illustration.svg';
import { getNotificationById } from '../../services/notificationService';
import { useAppDispatch } from '../../../../redux/hooks';
import { fetchNotifications } from '../../state/notificationSlice';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';

export default function NotificationDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { t, language } = useI18n();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);

  const { notificationId, residentId, notification: passedNotification } =
    route.params || {};

  const [notification, setNotification] = useState<any>(
    passedNotification || null,
  );
  const [loading] = useState(false);
  const [markedAsSeen, setMarkedAsSeen] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (passedNotification) {
      setNotification(passedNotification);
      if (!passedNotification.isSeen && !markedAsSeen) {
        markAsSeen();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsSeen = async () => {
    if (!notificationId || !residentId) return;
    try {
      const updatedNotification = await getNotificationById(
        notificationId,
        residentId,
      );
      setMarkedAsSeen(true);
      if (updatedNotification) {
        setNotification(updatedNotification);
      } else {
        setNotification((current: any) =>
          current
            ? {
                ...current,
                isSeen: true,
                seenAt: current.seenAt || new Date().toISOString(),
              }
            : current,
        );
      }
      dispatch(fetchNotifications(residentId));
    } catch (error: any) {
      console.error('Error marking as seen:', error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale =
      language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
    return date.toLocaleString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ScreenWrapper
        title={t('notification.view.title', 'Notification Details')}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <ThemedLoader size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!notification) {
    return (
      <ScreenWrapper
        title={t('notification.view.title', 'Notification Details')}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {t('notification.view.notFound', 'Notification not found')}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>
              {t('notification.view.goBack', 'Go Back')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={t('notification.view.title', 'Notification Details')}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Detail hero card ── */}
        <View style={[styles.contentCard, { backgroundColor: colors.surface, width: contentWidth, alignSelf: 'center' }]}>

          {/* Icon + seen badge row */}
          <View style={styles.iconSection}>
            <View style={styles.largeIconCircle}>
              <BellIcon width={36} height={36} />
            </View>
            {/* {notification.isSeen && (
              <View style={styles.seenBadge}>
                <Text style={styles.seenText}>
                  {t('notification.view.readStatus', 'Read')}
                </Text>
              </View>
            )} */}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {notification.title}
          </Text>

          {/* Date pill */}
          <View style={styles.metaRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillIcon}>•</Text>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {formatDate(notification.createdOn)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Message label */}
          <Text style={[styles.contentLabel, { color: colors.textMuted }]}>
            {t('notification.view.messageLabel', 'MESSAGE')}
          </Text>

          {/* Message body */}
          <Text style={[styles.content, { color: colors.textSecondary }]}>
            {notification.content}
          </Text>
          {notification.mediaPath ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPreviewImageUri(notification.mediaPath)}
            >
              <Image
                source={{ uri: notification.mediaPath }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={!!previewImageUri}
        onRequestClose={() => setPreviewImageUri(null)}
      >
        {previewImageUri ? (
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity
              style={styles.imagePreviewBackdrop}
              activeOpacity={1}
              onPress={() => setPreviewImageUri(null)}
            />
            <View style={styles.imagePreviewFrame}>
              <TouchableOpacity
                style={styles.imagePreviewClose}
                onPress={() => setPreviewImageUri(null)}
                accessibilityRole="button"
              >
                <Text style={styles.imagePreviewCloseText}>X</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: previewImageUri }}
                style={styles.imagePreviewImage}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : null}
      </Modal>
    </ScreenWrapper>
  );
}
