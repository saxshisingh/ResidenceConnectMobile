import { API_BASE_URL } from '../../../config/api';
import { apiFetch } from '../../../shared/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEYS } from '../../auth/services/authService';

type InitializeLockRequest = {
  lockData: string;
  lockAlias?: string;
};

type InitializeLockResponse = {
  lockId: number | string;
  deviceId?: string;
};

export type TTLockNetworkLock = {
  id: string;
  deviceId?: string;
  lockId?: string;
  lockAlias: string;
  mac: string;
  lockData?: string;
  battery?: number;
  lockName?: string;
  raw: any;
};

export type AddCardPayload = {
  residentId: string;
  deviceId: string;
  cardNumber: number;
  startDate: number;
  endDate: number;
};

export type DeleteCardPayload = {
  deviceId: string;
  cardNumber: number;
};

export type AddPasscodePayload = {
  residentId: string;
  deviceId: string;
  passcode: string;
  startDate: number;
  endDate: number;
};

export type RemoveTTLockPayload = {
  identifier?: string;
  lockId?: string;
  deviceId?: string;
};

export type TTLockRecord = {
  recordId: string;
  recordType?: number;
  lockId?: string;
  date?: number;
  raw: any;
};

const unwrapData = (json: any) => {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }

  return json;
};

const pickFirstString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
};

const looksLikeGuid = (value: string) =>
  /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i.test(
    String(value || '').trim(),
  );

const isNumericIdentifier = (value: string) => /^\d+$/.test(value);

const toNumericWhenPossible = (value?: string) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return undefined;
  }

  return isNumericIdentifier(normalized) ? Number(normalized) : normalized;
};

const pickLockIdString = (...values: any[]) => {
  for (const value of values) {
    const normalized = pickFirstString(value);
    if (normalized && !looksLikeGuid(normalized)) {
      return normalized;
    }
  }

  return '';
};

const normalizeLocksPayload = (payload: any): TTLockNetworkLock[] => {
  const source =
    Array.isArray(payload) ? payload :
    Array.isArray(payload?.list) ? payload.list :
    Array.isArray(payload?.locks) ? payload.locks :
    Array.isArray(payload?.items) ? payload.items :
    Array.isArray(payload?.rows) ? payload.rows :
    [];

  return source.map((item: any, index: number) => {
    const deviceId = pickFirstString(
      item?.deviceId,
      item?.DeviceId,
      item?.deviceGuid,
      item?.DeviceGuid,
      item?.accessDeviceId,
      item?.AccessDeviceId,
      item?.accessDeviceGuid,
      item?.AccessDeviceGuid,
      item?.residentDeviceId,
      item?.ResidentDeviceId,
      item?.residentDeviceGuid,
      item?.ResidentDeviceGuid,
      item?.smartAccessDeviceId,
      item?.SmartAccessDeviceId,
      item?.smartAccessDeviceGuid,
      item?.SmartAccessDeviceGuid,
      item?.guid,
      item?.Guid,
      looksLikeGuid(String(item?.id || '')) ? item?.id : '',
      looksLikeGuid(String(item?.Id || '')) ? item?.Id : '',
      item?.ttLockDeviceId,
      item?.TTLockDeviceId,
    );
    const lockId = pickLockIdString(
      item?.lockId,
      item?.LockId,
      item?.ttLockId,
      item?.TTLockId,
      item?.ttlockId,
      item?.TTLOCKID,
    );
    const mac = pickFirstString(
      item?.mac,
      item?.Mac,
      item?.macAddress,
      item?.MacAddress,
      item?.lockMac,
      item?.LockMac,
    );
    const lockData = pickFirstString(item?.lockData, item?.LockData);
    const lockAlias = pickFirstString(
      item?.lockAlias,
      item?.LockAlias,
      item?.alias,
      item?.Alias,
      item?.lockName,
      item?.LockName,
      item?.name,
      item?.Name,
    ) || 'TTLock Device';
    const lockName = pickFirstString(
      item?.lockName,
      item?.LockName,
      item?.name,
      item?.Name,
    ) || lockAlias;
    const battery =
      typeof item?.electricQuantity === 'number' ? item.electricQuantity :
      typeof item?.ElectricQuantity === 'number' ? item.ElectricQuantity :
      undefined;

    return {
      id: deviceId || lockId || mac || `network-lock-${index}`,
      deviceId: deviceId || undefined,
      lockId: lockId || undefined,
      lockAlias,
      mac,
      lockData: lockData || undefined,
      battery,
      lockName,
      raw: item,
    };
  });
};

const normalizeRecordsPayload = (payload: any): TTLockRecord[] => {
  const source =
    Array.isArray(payload) ? payload :
    Array.isArray(payload?.list) ? payload.list :
    Array.isArray(payload?.List) ? payload.List :
    Array.isArray(payload?.items) ? payload.items :
    [];

  return source.map((item: any, index: number) => ({
    recordId: pickFirstString(item?.recordId, item?.RecordId, item?.id, item?.Id) || `ttlock-record-${index}`,
    recordType:
      typeof item?.recordType === 'number' ? item.recordType :
      typeof item?.RecordType === 'number' ? item.RecordType :
      undefined,
    lockId: pickFirstString(item?.lockId, item?.LockId),
    date:
      typeof item?.date === 'number' ? item.date :
      typeof item?.Date === 'number' ? item.Date :
      undefined,
    raw: item,
  }));
};

const parseTTLockErrorFromText = (
  rawText: string,
  fallbackMessage: string,
): string => {
  if (!String(rawText || '').trim()) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(rawText);
    const errorValues =
      parsed?.errors && typeof parsed.errors === 'object'
        ? Object.values(parsed.errors).flat().filter(Boolean)
        : [];

    if (errorValues.length > 0) {
      return String(errorValues[0]);
    }

    const directMessage =
      parsed?.message ||
      parsed?.detail ||
      parsed?.title ||
      (Array.isArray(parsed?.errors) ? parsed.errors[0] : '');

    if (typeof directMessage === 'string' && directMessage.trim()) {
      return directMessage.trim();
    }
  } catch {}

  return rawText || fallbackMessage;
};

const parseTTLockError = async (
  res: Response,
  fallbackMessage: string,
): Promise<string> => {
  const rawText = await res.text();
  return parseTTLockErrorFromText(rawText, fallbackMessage);
};

const readJsonSafely = async (res: Response) => {
  const rawText = await res.text();
  const text = String(rawText || '').trim();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const initializeSmartLock = async (
  payload: InitializeLockRequest,
): Promise<InitializeLockResponse> => {
  const requestBody = {
    lockData: payload.lockData,
    lockAlias: payload.lockAlias,
  };

  console.log('TTLock service request URL:', `${API_BASE_URL}/api/ttlock/initialize-lock`);
  console.log('TTLock service request body:', requestBody);

  const res = await apiFetch(`${API_BASE_URL}/api/ttlock/initialize-lock`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log('TTLock service error response:', text);
    throw new Error(text || 'Failed to initialize lock with backend');
  }

  const json = await res.json();
  console.log('TTLock service raw response:', json);
  const data = unwrapData(json);
  const lockId = data?.lockId ?? data?.LockId ?? json?.lockId ?? json?.LockId;
  const deviceId = pickFirstString(
    data?.deviceId,
    data?.DeviceId,
    data?.accessDeviceId,
    data?.AccessDeviceId,
    json?.deviceId,
    json?.DeviceId,
    json?.accessDeviceId,
    json?.AccessDeviceId,
  );

  if (lockId === undefined || lockId === null || lockId === '') {
    throw new Error('Backend did not return a lockId');
  }

  return {
    lockId,
    deviceId: deviceId || undefined,
  };
};

export const getInitializedSmartLocks = async (): Promise<TTLockNetworkLock[]> => {
  const res = await apiFetch(`${API_BASE_URL}/api/ttlock/locks`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch TTLock locks');
  }

  const json = await res.json();
  const data = unwrapData(json);
  console.log('[ttlockService.getInitializedSmartLocks] raw:', json);

  return normalizeLocksPayload(data);
};

export const removeTTLock = async (payload: string | RemoveTTLockPayload): Promise<void> => {
  const requestedLockId =
    typeof payload === 'string'
      ? String(payload || '').trim()
      : pickFirstString(payload?.lockId, payload?.identifier);

  if (!requestedLockId) {
    throw new Error('A numeric lockId is required to remove a TTLock device.');
  }

  if (!isNumericIdentifier(requestedLockId)) {
    throw new Error(`TTLock delete requires a numeric lockId, received "${requestedLockId}".`);
  }

  const lockIdValue = toNumericWhenPossible(requestedLockId);
  const url = `${API_BASE_URL}/api/ttlock/lock-removed/${encodeURIComponent(String(lockIdValue))}`;

  console.log('[ttlockService.removeTTLock] request:', {
    url,
    lockId: lockIdValue,
    body: undefined,
  });

  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);
  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (res.ok) {
    console.log('[ttlockService.removeTTLock] success:', {
      lockId: lockIdValue,
    });
    return;
  }

  const text = await res.text();
  console.log('[ttlockService.removeTTLock] error response:', {
    status: res.status,
    statusText: res.statusText,
    body: text,
    lockId: lockIdValue,
  });

  throw new Error(text || 'Failed to remove TTLock lock.');
};

export const addTTLockCard = async (payload: AddCardPayload): Promise<void> => {
  console.log('TTLock add card request payload:', payload);
  const res = await apiFetch(`${API_BASE_URL}/api/ttlock/cards/add`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await parseTTLockError(res, 'Failed to add TTLock card.');
    console.log('TTLock add card error response:', {
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(text || 'Failed to add TTLock card.');
  }

  const json = await readJsonSafely(res);
  if (json && typeof json === 'object' && json.status === false) {
    throw new Error(
      parseTTLockErrorFromText(JSON.stringify(json), 'Failed to add TTLock card.'),
    );
  }
};

export const deleteTTLockCard = async (payload: DeleteCardPayload): Promise<void> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/ttlock/cards/delete?deviceId=${payload.deviceId}&cardNumber=${payload.cardNumber}`,
    {method: 'DELETE'},
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to delete TTLock card.');
  }
};

export const addTTLockPasscode = async (payload: AddPasscodePayload): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/api/ttlock/passcode/add`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await parseTTLockError(res, 'Failed to add TTLock passcode.');
    throw new Error(text || 'Failed to add TTLock passcode.');
  }

  const json = await readJsonSafely(res);
  if (json && typeof json === 'object' && json.status === false) {
    throw new Error(
      parseTTLockErrorFromText(JSON.stringify(json), 'Failed to add TTLock passcode.'),
    );
  }
};

export const getTTLockRecords = async (deviceId: string): Promise<TTLockRecord[]> => {
  const res = await apiFetch(`${API_BASE_URL}/api/ttlock/records?deviceId=${deviceId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch TTLock records.');
  }

  const json = await res.json();
  const data = unwrapData(json);
  return normalizeRecordsPayload(data);
};
