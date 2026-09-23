import {apiFetch} from '../../../shared/api/apiClient';
import {API_BASE_URL} from '../../../config/api';

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
  const cleanPath = String(path || '').trim();

  if (!cleanPath) {
    return '';
  }

  // Already an absolute URL.
  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  // Remove leading slashes.
  const normalizedPath = cleanPath.replace(/^\/+/, '');

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
 * from the JWT.
 */
export const registerDeviceToken = async (
  deviceToken: string,
): Promise<boolean> => {
  try {
    console.log(
      '[FCM][Backend] Starting device token registration',
    );

    if (!deviceToken) {
      console.error(
        '[FCM][Backend] Device token is empty',
      );

      return false;
    }

    const payload = {
      deviceToken,
      platform: Platform.OS,
      deviceId: null,
    };

    console.log(
      '[FCM][Backend] Platform:',
      Platform.OS,
    );

    console.log(
      '[FCM][Backend] Sending token to backend...',
    );

    const response = await apiFetch(
      `${API_BASE_URL}/api/notifications/device-token`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    console.log(
      '[FCM][Backend] HTTP status:',
      response.status,
    );

    const responseText = await response.text();

    console.log(
      '[FCM][Backend] Response:',
      responseText,
    );

    if (!response.ok) {
      console.error(
        '[FCM][Backend] Registration failed',
      );

      return false;
    }

    console.log(
      '[FCM][Backend] Device token registered successfully',
    );

    return true;
  } catch (error: any) {
    console.error(
      '[FCM][Backend] Registration exception:',
      error?.message ?? error,
    );

    console.error(
      '[FCM][Backend] Error code:',
      error?.code,
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
 * iOS:
 *
 *   Permission
 *       ↓
 *   APNs registration
 *       ↓
 *   APNs token
 *       ↓
 *   FCM token
 *       ↓
 *   Backend
 *
 * Android:
 *
 *   FCM token
 *       ↓
 *   Backend
 */
export const registerForPushNotifications = async (
  userId: string,
): Promise<string | null> => {
  try {
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

    if (!userId) {
      console.error(
        '[FCM] User ID is missing',
      );

      return null;
    }

    const messaging = getMessaging();

    /* ========================================================
     * ANDROID
     * ======================================================== */

    if (Platform.OS === 'android') {
      console.log(
        '[FCM][Android] Requesting FCM token...',
      );

      const token = await getToken(messaging);

      if (!token) {
        console.error(
          '[FCM][Android] FCM token not available',
        );

        return null;
      }

      console.log(
        '[FCM][Android] FCM token received',
      );

      console.log(
        '[FCM][Android] Token preview:',
        `${token.substring(0, 12)}...`,
      );

      const registered =
        await registerDeviceToken(token);

      if (!registered) {
        console.error(
          '[FCM][Android] Backend token registration failed',
        );

        return null;
      }

      console.log(
        '[FCM][Android] Device token registered successfully',
      );

      return token;
    }

    /* ========================================================
     * iOS
     * ======================================================== */

    if (Platform.OS === 'ios') {
      console.log(
        '[FCM][iOS] Starting iOS push registration',
      );

      /* ------------------------------------------------------
       * 1. REQUEST NOTIFICATION PERMISSION
       * ------------------------------------------------------ */

      console.log(
        '[FCM][iOS] Requesting notification permission...',
      );

      const authStatus =
        await requestPermission(messaging);

      console.log(
        '[FCM][iOS] Authorization status:',
        authStatus,
      );

      const enabled =
        authStatus ===
          AuthorizationStatus.AUTHORIZED ||
        authStatus ===
          AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.error(
          '[FCM][iOS] Notification permission NOT granted',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] Notification permission granted',
      );

      /* ------------------------------------------------------
       * 2. REGISTER DEVICE FOR REMOTE MESSAGES
       * ------------------------------------------------------ */

      const alreadyRegistered =
        messaging.isDeviceRegisteredForRemoteMessages;

      console.log(
        '[FCM][iOS] Already registered for remote messages:',
        alreadyRegistered,
      );

      if (!alreadyRegistered) {
        console.log(
          '[FCM][iOS] Registering device for remote messages...',
        );

        await registerDeviceForRemoteMessages(
          messaging,
        );

        console.log(
          '[FCM][iOS] Device registered for remote messages',
        );
      }

      /* ------------------------------------------------------
       * 3. WAIT FOR APNs TOKEN
       * ------------------------------------------------------ */

      let apnsToken: string | null = null;

      for (
        let attempt = 1;
        attempt <= 15;
        attempt++
      ) {
        apnsToken =
          await getAPNSToken(messaging);

        if (apnsToken) {
          console.log(
            `[FCM][iOS] APNs token received on attempt ${attempt}`,
          );

          console.log(
            '[FCM][iOS] APNs token preview:',
            `${apnsToken.substring(0, 12)}...`,
          );

          break;
        }

        console.log(
          `[FCM][iOS] APNs token not available yet. Attempt ${attempt}/15`,
        );

        await new Promise<void>(
          resolve => {
            setTimeout(resolve, 1000);
          },
        );
      }

      if (!apnsToken) {
        console.error(
          '[FCM][iOS] APNs token was NOT received after 15 seconds',
        );

        console.error(
          '[FCM][iOS] FCM registration stopped',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] APNs token is available',
      );

      /* ------------------------------------------------------
       * 4. GET FCM TOKEN
       * ------------------------------------------------------ */

      console.log(
        '[FCM][iOS] Requesting FCM token...',
      );

      const token =
        await getToken(messaging);

      if (!token) {
        console.error(
          '[FCM][iOS] FCM token was NOT returned',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] FCM token received successfully',
      );

      console.log(
        '[FCM][iOS] FCM token preview:',
        `${token.substring(0, 12)}...`,
      );

      /* ------------------------------------------------------
       * 5. REGISTER FCM TOKEN WITH BACKEND
       * ------------------------------------------------------ */

      console.log(
        '[FCM][iOS] Registering FCM token with backend...',
      );

      const registered =
        await registerDeviceToken(token);

      if (!registered) {
        console.error(
          '[FCM][iOS] Backend registration FAILED',
        );

        return null;
      }

      console.log(
        '[FCM][iOS] Backend registration SUCCESS',
      );

      console.log(
        '[FCM] ========================================',
      );

      console.log(
        '[FCM] iOS PUSH REGISTRATION COMPLETED SUCCESSFULLY',
      );

      console.log(
        '[FCM] ========================================',
      );

      return token;
    }

    /* ========================================================
     * UNSUPPORTED PLATFORM
     * ======================================================== */

    console.warn(
      '[FCM] Unsupported platform:',
      Platform.OS,
    );

    return null;
  } catch (error: any) {
    console.error(
      '[FCM] Push notification registration failed',
    );

    console.error(
      '[FCM] Error:',
      error?.message ?? error,
    );

    console.error(
      '[FCM] Error code:',
      error?.code,
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
      const rawText = await res.text();

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
        const json: SingleNotificationResponse =
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