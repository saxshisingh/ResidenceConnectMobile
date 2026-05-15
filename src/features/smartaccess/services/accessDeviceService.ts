import {API_BASE_URL} from '../../../config/api';
import {apiFetch} from '../../../shared/api/apiClient';

export type ResidentAccessDevice = {
  id: string;
  name: string;
  subtitle?: string;
  deviceType?: string;
  lockId?: string;
  permissionId?: string;
  raw: any;
};

export type DeviceBleAccess = {
  deviceId: string;
  deviceName: string;
  lockData: string;
  lockMac: string;
  raw: any;
};

export type ResidentAccessLog = {
  id: string;
  title: string;
  action: string;
  status: string;
  timestamp?: string;
  subtitle?: string;
  raw: any;
};

type SaveTTLockOperationLogPayload = {
  deviceId: string;
  residentId: string;
  action: string;
  mode?: string;
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
  }

  return '';
};

const normalizeResidentDevices = (payload: any): ResidentAccessDevice[] => {
  const source =
    Array.isArray(payload) ? payload :
    Array.isArray(payload?.permissions) ? payload.permissions :
    Array.isArray(payload?.devices) ? payload.devices :
    Array.isArray(payload?.items) ? payload.items :
    Array.isArray(payload?.rows) ? payload.rows :
    [];

  return source.map((item: any, index: number) => {
    const id = pickFirstString(
      item?.deviceId,
      item?.DeviceId,
      item?.accessDeviceId,
      item?.AccessDeviceId,
      item?.id,
      item?.Id,
    ) || `access-device-${index}`;

    const name = pickFirstString(
      item?.deviceName,
      item?.DeviceName,
      item?.name,
      item?.Name,
      item?.alias,
      item?.Alias,
      item?.lockAlias,
      item?.LockAlias,
    ) || 'Access Device';

    const subtitle = pickFirstString(
      item?.blockName,
      item?.BlockName,
      item?.floorName,
      item?.FloorName,
      item?.locationName,
      item?.LocationName,
      item?.doorName,
      item?.DoorName,
      item?.description,
      item?.Description,
      item?.lockMac,
      item?.LockMac,
    );
    const deviceType = pickFirstString(item?.deviceType, item?.DeviceType);
    const lockId = pickFirstString(item?.lockId, item?.LockId);
    const permissionId = pickFirstString(item?.permissionId, item?.PermissionId);

    return {
      id,
      name,
      subtitle: subtitle || undefined,
      deviceType: deviceType || undefined,
      lockId: lockId || undefined,
      permissionId: permissionId || undefined,
      raw: item,
    };
  });
};

const normalizeBleAccess = (deviceId: string, payload: any): DeviceBleAccess => {
  const source = unwrapData(payload);
  const lockData = pickFirstString(source?.lockData, source?.LockData);
  const lockMac = pickFirstString(
    source?.lockMac,
    source?.LockMac,
    source?.mac,
    source?.Mac,
    source?.macAddress,
    source?.MacAddress,
  );
  const deviceName = pickFirstString(
    source?.deviceName,
    source?.DeviceName,
    source?.name,
    source?.Name,
    source?.lockAlias,
    source?.LockAlias,
  ) || 'Access Device';

  if (!lockData || !lockMac) {
    throw new Error('BLE access response is missing lockData or lockMac.');
  }

  return {
    deviceId,
    deviceName,
    lockData,
    lockMac,
    raw: source,
  };
};

const normalizeResidentAccessLogs = (payload: any): ResidentAccessLog[] => {
  const source =
    Array.isArray(payload) ? payload :
    Array.isArray(payload?.data) ? payload.data :
    Array.isArray(payload?.list) ? payload.list :
    Array.isArray(payload?.items) ? payload.items :
    Array.isArray(payload?.rows) ? payload.rows :
    [];

  return source.map((item: any, index: number) => {
    const id = pickFirstString(
      item?.id,
      item?.Id,
      item?.logId,
      item?.LogId,
      item?.operationLogId,
      item?.OperationLogId,
      item?.deviceId,
      item?.DeviceId,
    ) || `access-log-${index}`;

    const action = pickFirstString(
      item?.action,
      item?.Action,
      item?.operation,
      item?.Operation,
    ) || 'ACCESS';

    const status = pickFirstString(
      item?.status,
      item?.Status,
      item?.result,
      item?.Result,
      item?.state,
      item?.State,
    ) || 'Success';

    const title = pickFirstString(
      item?.deviceName,
      item?.DeviceName,
      item?.lockAlias,
      item?.LockAlias,
      item?.lockName,
      item?.LockName,
      item?.name,
      item?.Name,
    ) || 'Access Device';

    const subtitle = pickFirstString(
      item?.blockName,
      item?.BlockName,
      item?.deviceType,
      item?.DeviceType,
      item?.mode,
      item?.Mode,
    );

    const timestamp = pickFirstString(
      item?.timestamp,
      item?.Timestamp,
      item?.createdAt,
      item?.CreatedAt,
      item?.operationTime,
      item?.OperationTime,
      item?.date,
      item?.Date,
    );

    return {
      id,
      title,
      action,
      status,
      timestamp: timestamp || undefined,
      subtitle: subtitle || undefined,
      raw: item,
    };
  });
};

export const getResidentAccessDevices = async (
  residentId: string,
): Promise<ResidentAccessDevice[]> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/access-devices/permissions/by-resident/${residentId}`,
    {method: 'GET'},
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch resident access devices.');
  }

  const json = await res.json();
  console.log('Access device permissions response:', json);
  return normalizeResidentDevices(unwrapData(json));
};

export const getAccessDevices = async (): Promise<ResidentAccessDevice[]> => {
  const res = await apiFetch(`${API_BASE_URL}/api/access-devices`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch access devices.');
  }

  const json = await res.json();
  console.log('Access devices response:', json);
  return normalizeResidentDevices(unwrapData(json));
};

export const getDeviceBleAccess = async (
  deviceId: string,
  residentId: string,
): Promise<DeviceBleAccess> => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/access-devices/${deviceId}/resident/${residentId}/ble-access`,
    {method: 'GET'},
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch BLE access for this device.');
  }

  const json = await res.json();
  console.log('BLE access response:', {
    deviceId,
    residentId,
    payload: json,
  });
  return normalizeBleAccess(deviceId, json);
};

export const saveTTLockOperationLog = async ({
  deviceId,
  residentId,
  action,
  mode = 'BLE',
}: SaveTTLockOperationLogPayload): Promise<void> => {
  const payload = {
    deviceId,
    residentId,
    action,
    mode,
  };

  const res = await apiFetch(`${API_BASE_URL}/api/ttlock/save-operation-log`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to save TTLock operation log.');
  }

  try {
    const json = await res.json();
    console.log('TTLock operation log response:', json);
  } catch {
    console.log('TTLock operation log saved without JSON response');
  }
};

export const getResidentAccessLogs = async (
  residentId: string,
): Promise<ResidentAccessLog[]> => {
  const res = await apiFetch(`${API_BASE_URL}/api/access-devices/logs/${residentId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch access logs.');
  }

  const json = await res.json();
  console.log('Resident access logs response:', json);
  return normalizeResidentAccessLogs(unwrapData(json));
};
