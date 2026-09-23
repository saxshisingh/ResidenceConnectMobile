import {
  apiFetch,
} from '../../../shared/api/apiClient';

import {
  API_BASE_URL,
} from '../../../config/api';

import {
  getMessaging,
  requestPermission,
  getToken,
  getAPNSToken,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {Platform} from 'react-native';

/* ============================================================
 * TYPES
 * ============================================================ */

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  createdOn: string;

  notificationType?: string;

  isSeen: boolean;
  seenAt?: string;

  deliveredAt?: string;
  isDelivered?: boolean;

  mediaPath?: string;
  createdBy?: string;
}

interface NotificationResponse {
  status: boolean;
  message: string;
  data: any[];
}

interface SingleNotificationResponse {
  status: boolean;
  message: string;
  data: NotificationItem;
}

/* ============================================================
 * MEDIA URL
 * ============================================================ */

const normalizeMediaUrl = (
  path?: string | null,
): string => {
  const cleanPath =
    String(path || '').trim();

  if (!cleanPath) {
    return '';
  }

  /*
   * Already an absolute URL.
   */
  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  /*
   * Remove leading slashes.
   */
  const normalizedPath =
    cleanPath.replace(/^\/+/, '');

  return `${API_BASE_URL}/${normalizedPath}`;
};

/* ============================================================
 * NORMALIZE NOTIFICATION
 * ============================================================ */

const normalizeNotification = (
  item: any,
): NotificationItem => {
  return {
    ...item,

    mediaPath:
      normalizeMediaUrl(
        item?.mediaPath ||
          item?.MediaPath ||
          item?.image ||
          item?.Image ||
          item?.attachment ||
          item?.Attachment ||
          '',
      ) || undefined,
  };
};

/* ============================================================
 * FCM DEVICE TOKEN REGISTRATION
 * ============================================================ */

/**
 * Sends the FCM token to the backend.
 *
 * The backend gets the authenticated user ID
 * from the JWT, so userId is not sent in the body.
 */
export const registerDeviceToken =
  async (
    deviceToken: string,
  ): Promise<boolean> => {
    try {
      if (!deviceToken) {
        console.warn(
          '[FCM] Cannot register empty device token',
        );

        return false;
      }

      const payload = {
        deviceToken,
        platform: Platform.OS,
      };

      console.log(
        '[FCM] Registering device token',
        {
          platform: Platform.OS,
        },
      );

      const response = await apiFetch(
        `${API_BASE_URL}/api/notifications/device-token`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          `Device token registration failed: ${response.status} ${errorText}`,
        );
      }

      console.log(
        '[FCM] Device token registered successfully',
      );

      return true;
    } catch (error) {
      console.error(
        '[FCM] Failed to register device token:',
        error,
      );

      return false;
    }
  };

/* ============================================================
 * REGISTER FOR PUSH NOTIFICATIONS
 * ============================================================ */

/**
 * Registers the device with FCM.
 *
 * iOS flow:
 *
 *   Permission
 *      ↓
 *   APNs registration
 *      ↓
 *   APNs token
 *      ↓
 *   FCM token
 *      ↓
 *   Backend
 *
 * Android flow:
 *
 *   Permission
 *      ↓
 *   FCM token
 *      ↓
 *   Backend
 */
export const registerForPushNotifications =
  async (
    userId: string,
  ): Promise<string | null> => {
    try {
      if (!userId) {
        console.warn(
          '[FCM] Cannot register push notifications without user ID',
        );

        return null;
      }

      const messaging =
        getMessaging();

      console.log(
        '[FCM] ========================================',
      );

      console.log(
        '[FCM] Starting push notification registration',
      );

      console.log(
        '[FCM] Platform:',
        Platform.OS,
      );

      console.log(
        '[FCM] User ID:',
        userId,
      );

      /* ========================================================
       * iOS APNs REGISTRATION
       * ======================================================== */

      if (Platform.OS === 'ios') {
        console.log(
          '[FCM][iOS] Registering device for remote messages...',
        );

        /*
         * Required before requesting an FCM token
         * on iOS when auto-registration is not already active.
         */
        await registerDeviceForRemoteMessages(
          messaging,
        );

        console.log(
          '[FCM][iOS] Device registered for remote messages',
        );

        /*
         * Get APNs token.
         */
        const apnsToken =
          await getAPNSToken(
            messaging,
          );

        if (!apnsToken) {
          console.warn(
            '[FCM][iOS] APNs token is NOT available',
          );

          console.warn(
            '[FCM][iOS] FCM token registration cannot continue reliably',
          );

          return null;
        }

        console.log(
          '[FCM][iOS] APNs token received successfully',
        );
      }

      /* ========================================================
       * NOTIFICATION PERMISSION
       * ======================================================== */

      console.log(
        '[FCM] Requesting notification permission...',
      );

      const authStatus =
        await requestPermission(
          messaging,
        );

      const enabled =
        authStatus ===
          AuthorizationStatus.AUTHORIZED ||
        authStatus ===
          AuthorizationStatus.PROVISIONAL;

      console.log(
        '[FCM] Notification authorization status:',
        authStatus,
      );

      if (!enabled) {
        console.warn(
          '[FCM] Notification permission was not granted',
        );

        return null;
      }

      console.log(
        '[FCM] Notification permission granted',
      );

      /* ========================================================
       * GET FCM TOKEN
       * ======================================================== */

      console.log(
        '[FCM] Requesting FCM token...',
      );

      const token =
        await getToken(
          messaging,
        );

      if (!token) {
        console.warn(
          '[FCM] FCM token was not available',
        );

        return null;
      }

      console.log(
        '[FCM] FCM token received successfully',
      );

      console.log(
        '[FCM] FCM token preview:',
        `${token.substring(0, 12)}...`,
      );

      /* ========================================================
       * REGISTER TOKEN WITH BACKEND
       * ======================================================== */

      const registered =
        await registerDeviceToken(
          token,
        );

      if (!registered) {
        console.error(
          '[FCM] FCM token could not be registered with backend',
        );

        return null;
      }

      console.log(
        '[FCM] ========================================',
      );

      console.log(
        '[FCM] Push notification registration completed',
      );

      console.log(
        '[FCM] Platform:',
        Platform.OS,
      );

      console.log(
        '[FCM] ========================================',
      );

      return token;
    } catch (error) {
      console.error(
        '[FCM] Failed to register push notifications:',
        error,
      );

      return null;
    }
  };

/* ============================================================
 * FETCH NOTIFICATIONS BY RESIDENT
 * ============================================================ */

export const fetchNotificationsByResident =
  async (
    residentId: string,
  ): Promise<NotificationItem[]> => {
    if (!residentId) {
      console.warn(
        '[Notification] Cannot fetch notifications without residentId',
      );

      return [];
    }

    try {
      console.log(
        '[Notification] Fetching notifications for resident:',
        residentId,
      );

      const res = await apiFetch(
        `${API_BASE_URL}/api/notifications/by-resident/${residentId}`,
        {
          method: 'GET',
        },
      );

      if (!res.ok) {
        const text = await res.text();

        throw new Error(
          text ||
            `Failed to fetch notifications (${res.status})`,
        );
      }

      const json: NotificationResponse =
        await res.json();

      const notifications: NotificationItem[] =
        [];

      if (
        json?.data &&
        Array.isArray(json.data)
      ) {
        json.data.forEach(
          (item: any) => {
            /*
             * Backend may return:
             *
             * {
             *   notifications: [...]
             * }
             */
            if (
              item?.notifications &&
              Array.isArray(
                item.notifications,
              )
            ) {
              notifications.push(
                ...item.notifications.map(
                  normalizeNotification,
                ),
              );
            }

            /*
             * Backend may also directly return
             * notification objects.
             */
            else if (
              item &&
              typeof item === 'object' &&
              item.id
            ) {
              notifications.push(
                normalizeNotification(item),
              );
            }
          },
        );
      }

      console.log(
        '[Notification] Notifications fetched:',
        notifications.length,
      );

      return notifications;
    } catch (error) {
      console.error(
        '[Notification] Failed to fetch notifications:',
        error,
      );

      throw error;
    }
  };

/* ============================================================
 * GET NOTIFICATION BY ID / MARK AS SEEN
 * ============================================================ */

export const getNotificationById =
  async (
    id: string,
    residentId: string,
  ): Promise<NotificationItem | null> => {
    if (!id || !residentId) {
      console.warn(
        '[Notification] Missing notification id or residentId',
      );

      return null;
    }

    try {
      console.log(
        '[Notification] Getting notification:',
        id,
      );

      const res = await apiFetch(
        `${API_BASE_URL}/api/notifications/${id}/seen/${residentId}`,
        {
          method: 'POST',
        },
      );

      if (!res.ok) {
        const text = await res.text();

        throw new Error(
          text ||
            `Failed to fetch notification (${res.status})`,
        );
      }

      /*
       * Read response body exactly once.
       */
      const rawText =
        await res.text();

      const normalizedText =
        rawText.trim().toLowerCase();

      /*
       * Backend may return:
       *
       * ""
       * "seen"
       */
      if (
        !normalizedText ||
        normalizedText === 'seen'
      ) {
        return null;
      }

      try {
        const json:
          SingleNotificationResponse =
          JSON.parse(rawText);

        if (!json?.data) {
          return null;
        }

        return normalizeNotification(
          json.data,
        );
      } catch (parseError) {
        console.warn(
          '[Notification] Unable to parse notification response:',
          parseError,
        );

        return null;
      }
    } catch (error) {
      console.error(
        '[Notification] Failed to get notification:',
        error,
      );

      throw error;
    }
  };

/* ============================================================
 * GET UNREAD NOTIFICATION COUNT
 * ============================================================ */

export const getUnreadNotificationCount =
  async (
    residentId: string,
  ): Promise<number> => {
    if (!residentId) {
      return 0;
    }

    const notifications =
      await fetchNotificationsByResident(
        residentId,
      );

    return notifications.filter(
      notification =>
        !notification.isSeen,
    ).length;
  };