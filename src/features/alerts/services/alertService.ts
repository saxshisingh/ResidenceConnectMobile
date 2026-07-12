import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface CreateSOSAlertPayload {
  residentId: string;
  userId: string;
  apartmentId: string;
  blockId?: string;
  location: string;
  notes: string;
  title: string;
  message: string;
  urgencyLevel: string;
  languageId?: string;
  attachment?: {
    uri: string;
    type: string;
    name: string;
  };
  allBlocks: boolean;
  blockIds?: string[];
}

export interface SOSAlertDetail {
  alertId?: string;
  sosAlertId?: string;
  id?: string;
  alertCode?: string;
  title?: string;
  message?: string;
  notes?: string;
  location?: string;
  urgencyLevel?: string;
  createdAt?: string;
  alertDate?: string;
  createdByName?: string;
  mobile?: string;
  unit?: string;
  totalDelivered?: number;
  totalSeen?: number;
  createdBy?: string;
  blockName?: string;
  apartmentUnit?: string;
  status?: number | string;
  languageId?: string | null;
  attachment?: string | null;
  [key: string]: any;
}

const appendIfPresent = (formData: FormData, key: string, value: unknown) => {
  if (value == null) {
    return;
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? 'true' : 'false');
    return;
  }

  const normalized = String(value).trim();
  if (normalized) {
    formData.append(key, normalized);
  }
};

export const createSOSAlert = async (payload: CreateSOSAlertPayload) => {
  const token = await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const formData = new FormData();
  const resolvedLanguageId =
    String(payload.languageId || '').trim() ||
    String((await AsyncStorage.getItem('selectedLanguageId')) || '').trim();

  appendIfPresent(formData, 'ResidentId', payload.residentId);
  appendIfPresent(formData, 'UserId', payload.userId);
  appendIfPresent(formData, 'ApartmentId', payload.apartmentId);
  appendIfPresent(formData, 'BlockId', payload.blockId);
  appendIfPresent(formData, 'Location', payload.location);
  appendIfPresent(formData, 'Notes', payload.notes);
  appendIfPresent(formData, 'Title', payload.title);
  appendIfPresent(formData, 'Message', payload.message);
  appendIfPresent(formData, 'UrgencyLevel', payload.urgencyLevel);
  appendIfPresent(formData, 'LanguageId', resolvedLanguageId);
  appendIfPresent(formData, 'AllBlocks', payload.allBlocks);

  (payload.blockIds || []).forEach(blockId => {
    appendIfPresent(formData, 'BlockIds', blockId);
  });

  if (payload.attachment?.uri) {
    formData.append('AttachmentFile', {
      uri: payload.attachment.uri,
      type: payload.attachment.type || 'image/jpeg',
      name: payload.attachment.name || 'alert_image.jpg',
    } as any);
  }

  console.log('Creating SOS Alert (FormData):', {
    residentId: payload.residentId,
    userId: payload.userId,
    apartmentId: payload.apartmentId,
    blockId: payload.blockId,
    allBlocks: payload.allBlocks,
    hasAttachment: Boolean(payload.attachment?.uri),
    blockIds: payload.blockIds ?? [],
  });

  const res = await fetch(`${API_BASE_URL}/api/sos-alerts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('SOS Alert API Error:', errorText);
    throw new Error(errorText || 'Failed to create SOS alert');
  }

  const result = await res.json();
  console.log('SOS Alert created successfully:', result);
  return result;
};


export const getSOSAlerts = async () => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(`${API_BASE_URL}/api/sos-alerts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch SOS alerts');
  }

  const result = await res.json();
  console.log('SOS Alerts fetched:', result);
  return result.data || [];
};


export const getSOSAlertsByResident = async (residentId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/sos-alerts/resident/${residentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch SOS alerts');
  }

  return await res.json();
};

export const getSOSAlertById = async (alertId: string): Promise<SOSAlertDetail> => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(`${API_BASE_URL}/api/sos-alerts/${alertId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to fetch SOS alert detail');
  }

  const result = await res.json();
  console.log('SOS Alert detail fetched:', result);
  return result.data || result;
};
