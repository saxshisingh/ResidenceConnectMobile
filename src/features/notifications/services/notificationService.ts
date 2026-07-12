import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

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

const normalizeMediaUrl = (path?: string | null) => {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return '';
  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;
  return `${API_BASE_URL}/${cleanPath.replace(/^\/+/, '')}`;
};

const normalizeNotification = (item: any): NotificationItem => ({
  ...item,
  mediaPath: normalizeMediaUrl(
    item?.mediaPath ||
      item?.MediaPath ||
      item?.image ||
      item?.Image ||
      item?.attachment ||
      item?.Attachment ||
      '',
  ) || undefined,
});

export const fetchNotificationsByResident = async (
  residentId: string
): Promise<NotificationItem[]> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/notifications/by-resident/${residentId}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch notifications');
  }

  const json: NotificationResponse = await res.json();


 
  const notifications: NotificationItem[] = [];
  
  if (json.data && Array.isArray(json.data)) {
    json.data.forEach((item: any) => {
      if (item.notifications && Array.isArray(item.notifications)) {
        notifications.push(...item.notifications.map(normalizeNotification));
      }
    });
  }


  return notifications;
};

export const getNotificationById = async (
  id: string,
  residentId: string
): Promise<NotificationItem | null> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/notifications/${id}/seen/${residentId}`,
    { method: 'POST' }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch notification');
  }

  const rawText = await res.text();
  const normalizedText = rawText.trim().toLowerCase();

  if (!normalizedText || normalizedText === 'seen') {
    return null;
  }

  try {
    const json: SingleNotificationResponse = JSON.parse(rawText);
    return normalizeNotification(json.data);
  } catch {
    return null;
  }
};

export const getUnreadNotificationCount = async (
  residentId: string
): Promise<number> => {
  const notifications = await fetchNotificationsByResident(residentId);
  return notifications.filter(n => !n.isSeen).length;
};
