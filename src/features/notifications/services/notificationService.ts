import {
  apiFetch,
} from '../../../shared/api/apiClient';

import {
  API_BASE_URL,
} from '../../../config/api';

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

  // Already an absolute URL
  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  // Prevent duplicate slashes
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
          'Failed to fetch notifications',
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
           * Backend response may contain:
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
           * Also support the case where
           * the API directly returns notification
           * objects.
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

    return notifications;
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
          'Failed to fetch notification',
      );
    }

    /*
     * Read the response body only once.
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
     *
     * after successfully marking it as seen.
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
    } catch (error) {
      console.warn(
        '[Notification] Unable to parse notification response:',
        error,
      );

      return null;
    }
  };

/* ============================================================
 * GET UNREAD NOTIFICATION COUNT
 * ============================================================ */

export const getUnreadNotificationCount =
  async (
    residentId: string,
  ): Promise<number> => {
    const notifications =
      await fetchNotificationsByResident(
        residentId,
      );

    return notifications.filter(
      notification =>
        !notification.isSeen,
    ).length;
  };