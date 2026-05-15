import {API_BASE_URL} from '../../../config/api';
import {apiFetch} from '../../../shared/api/apiClient';

export type ResidentDirectoryItem = {
  residentId: string;
  name: string;
  subtitle?: string;
  raw: any;
};

const unwrapResidentPayload = (payload: any) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.list)) {
    return payload.list;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  return [];
};

const pickResidentName = (item: any) => {
  const firstName = String(item?.firstName || item?.FirstName || '').trim();
  const lastName = String(item?.lastName || item?.LastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return String(
    item?.name ||
      item?.Name ||
      item?.fullName ||
      item?.FullName ||
      item?.residentName ||
      item?.ResidentName ||
      item?.email ||
      '',
  ).trim();
};

const pickResidentSubtitle = (item: any) =>
  String(
    item?.apartmentNumber ||
      item?.ApartmentNumber ||
      item?.apartmentUnit ||
      item?.ApartmentUnit ||
      item?.unitNumber ||
      item?.UnitNumber ||
      item?.blockName ||
      item?.BlockName ||
      item?.email ||
      item?.mobileNumber ||
      item?.MobileNumber ||
      '',
  ).trim();

const normalizeResidents = (payload: any): ResidentDirectoryItem[] => {
  const source = unwrapResidentPayload(payload);
  const seen = new Set<string>();

  return source
    .map((item: any) => {
      const residentId = String(
        item?.residentId ||
          item?.ResidentId ||
          item?.id ||
          item?.Id ||
          '',
      ).trim();

      if (!residentId || seen.has(residentId)) {
        return null;
      }

      seen.add(residentId);

      return {
        residentId,
        name: pickResidentName(item) || `Resident ${residentId}`,
        subtitle: pickResidentSubtitle(item) || undefined,
        raw: item,
      };
    })
    .filter(Boolean)
    .sort((left: ResidentDirectoryItem, right: ResidentDirectoryItem) =>
      left.name.localeCompare(right.name),
    ) as ResidentDirectoryItem[];
};

export const getAllResidents = async (): Promise<ResidentDirectoryItem[]> => {
  const endpoints = ['/api/residents', '/api/residents/list', '/api/residents/all'];

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
      });

      if (!response.ok) {
        lastError = new Error(await response.text());
        continue;
      }

      const json = await response.json();
      const residents = normalizeResidents(json);

      if (residents.length > 0) {
        return residents;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to fetch residents list.');
};
