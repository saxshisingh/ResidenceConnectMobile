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

const appendIfPresent = (
  formData: FormData,
  key: string,
  value: unknown,
) => {
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

/**
 * Safely extract an error message from an API response.
 */
const extractApiError = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const text = await response.text();

    if (!text) {
      return fallbackMessage;
    }

    try {
      const json = JSON.parse(text);

      return (
        json?.message ||
        json?.error ||
        json?.detail ||
        json?.title ||
        json?.data?.message ||
        text
      );
    } catch {
      return text;
    }
  } catch {
    return fallbackMessage;
  }
};

/**
 * Create SOS alert.
 */
export const createSOSAlert = async (
  payload: CreateSOSAlertPayload,
) => {
  const token = await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const formData = new FormData();

  const resolvedLanguageId =
    String(payload.languageId || '').trim() ||
    String(
      (await AsyncStorage.getItem('selectedLanguageId')) || '',
    ).trim();

  appendIfPresent(
    formData,
    'ResidentId',
    payload.residentId,
  );

  appendIfPresent(
    formData,
    'UserId',
    payload.userId,
  );

  appendIfPresent(
    formData,
    'ApartmentId',
    payload.apartmentId,
  );

  appendIfPresent(
    formData,
    'BlockId',
    payload.blockId,
  );

  appendIfPresent(
    formData,
    'Location',
    payload.location,
  );

  appendIfPresent(
    formData,
    'Notes',
    payload.notes,
  );

  appendIfPresent(
    formData,
    'Title',
    payload.title,
  );

  appendIfPresent(
    formData,
    'Message',
    payload.message,
  );

  appendIfPresent(
    formData,
    'UrgencyLevel',
    payload.urgencyLevel,
  );

  appendIfPresent(
    formData,
    'LanguageId',
    resolvedLanguageId,
  );

  appendIfPresent(
    formData,
    'AllBlocks',
    payload.allBlocks,
  );

  (payload.blockIds || []).forEach(blockId => {
    appendIfPresent(
      formData,
      'BlockIds',
      blockId,
    );
  });

  if (payload.attachment?.uri) {
    formData.append(
      'AttachmentFile',
      {
        uri: payload.attachment.uri,
        type:
          payload.attachment.type ||
          'image/jpeg',
        name:
          payload.attachment.name ||
          'alert_image.jpg',
      } as any,
    );
  }

  console.log(
    '[SOS] Creating SOS Alert:',
    {
      residentId: payload.residentId,
      userId: payload.userId,
      apartmentId: payload.apartmentId,
      blockId: payload.blockId,
      allBlocks: payload.allBlocks,
      hasAttachment:
        Boolean(payload.attachment?.uri),
      blockIds:
        payload.blockIds ?? [],
    },
  );

  const res = await fetch(
    `${API_BASE_URL}/api/sos-alerts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!res.ok) {
    const errorMessage =
      await extractApiError(
        res,
        'Failed to create SOS alert',
      );

    console.error(
      '[SOS] Create API error:',
      {
        status: res.status,
        statusText: res.statusText,
        message: errorMessage,
      },
    );

    throw new Error(errorMessage);
  }

  const result = await res.json();

  console.log(
    '[SOS] SOS Alert created successfully:',
    result,
  );

  return result;
};

/**
 * Get SOS alerts for the current authenticated user/residence.
 */
export const getSOSAlerts = async (): Promise<
  SOSAlertDetail[]
> => {
  const token =
    await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error(
      'Authentication token not found',
    );
  }

  console.log(
    '[SOS] Fetching SOS alerts...',
  );

  const res = await apiFetch(
    `${API_BASE_URL}/api/sos-alerts`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  );

  console.log(
    '[SOS] Get alerts response:',
    {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    },
  );

  if (!res.ok) {
    const errorMessage =
      await extractApiError(
        res,
        'Failed to fetch SOS alerts',
      );

    console.error(
      '[SOS] Get alerts API error:',
      {
        status: res.status,
        statusText: res.statusText,
        message: errorMessage,
      },
    );

    throw new Error(errorMessage);
  }

  const result = await res.json();

  console.log(
    '[SOS] SOS Alerts API response:',
    result,
  );

  /*
   * Support:
   *
   * {
   *   status: true,
   *   message: "...",
   *   data: [...]
   * }
   *
   * OR
   *
   * {
   *   data: {
   *      items: [...]
   *   }
   * }
   *
   * OR
   *
   * [...]
   */
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.items)) {
    return result.data.items;
  }

  if (Array.isArray(result?.items)) {
    return result.items;
  }

  return [];
};

/**
 * Get SOS alerts created by a specific resident.
 */
export const getSOSAlertsByResident = async (
  residentId: string,
) => {
  const token =
    await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error(
      'Authentication token not found',
    );
  }

  if (!residentId) {
    throw new Error(
      'Resident ID is required',
    );
  }

  const res = await apiFetch(
    `${API_BASE_URL}/api/sos-alerts/resident/${residentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  );

  console.log(
    '[SOS] Resident alerts response:',
    {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      residentId,
    },
  );

  if (!res.ok) {
    const errorMessage =
      await extractApiError(
        res,
        'Failed to fetch SOS alerts',
      );

    console.error(
      '[SOS] Resident alerts API error:',
      {
        status: res.status,
        message: errorMessage,
      },
    );

    throw new Error(errorMessage);
  }

  const result = await res.json();

  console.log(
    '[SOS] Resident alerts:',
    result,
  );

  return result?.data ?? result;
};

/**
 * Get a single SOS alert.
 */
export const getSOSAlertById = async (
  alertId: string,
): Promise<SOSAlertDetail> => {
  const token =
    await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error(
      'Authentication token not found',
    );
  }

  if (!alertId) {
    throw new Error(
      'Alert ID is required',
    );
  }

  const res = await apiFetch(
    `${API_BASE_URL}/api/sos-alerts/${alertId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  );

  console.log(
    '[SOS] Alert detail response:',
    {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      alertId,
    },
  );

  if (!res.ok) {
    const errorMessage =
      await extractApiError(
        res,
        'Failed to fetch SOS alert detail',
      );

    console.error(
      '[SOS] Alert detail API error:',
      {
        status: res.status,
        message: errorMessage,
      },
    );

    throw new Error(errorMessage);
  }

  const result = await res.json();

  console.log(
    '[SOS] SOS Alert detail fetched:',
    result,
  );

  return result?.data ?? result;
};