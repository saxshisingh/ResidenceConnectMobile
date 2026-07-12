import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface EditProfilePayload {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  petOwnership: boolean;
  mobileNumber: string;
  email: string;
  profilePhoto?: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface OccupancyStatusOption {
  label: string;
  value: string;
}

const parseProfileUpdateError = async (response: Response) => {
  const rawText = await response.text();

  try {
    const parsed = JSON.parse(rawText);
    const errorValues = parsed?.errors && typeof parsed.errors === 'object'
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
      const normalized = directMessage.trim().toLowerCase();
      if (normalized.includes('one or more validation errors occurred')) {
        return 'Please review your profile details and try again.';
      }
      return directMessage.trim();
    }
  } catch {
    const normalized = rawText.trim().toLowerCase();
    if (normalized.includes('one or more validation errors occurred')) {
      return 'Please review your profile details and try again.';
    }
  }

  return rawText || 'Unable to save profile right now. Please try again.';
};



export const getProfile = async (residentId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await apiFetch(
    `${API_BASE_URL}/api/residents/${residentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch profile');
  }

  return await response.json();
};

export const getOccupancyStatusOptions = async (): Promise<OccupancyStatusOption[]> => {
  const token = await AsyncStorage.getItem('authToken');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await apiFetch(
    `${API_BASE_URL}/api/apartments/meta/occupancy-status`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch occupancy status options');
  }

  const json = await response.json();
  const source = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
      ? json
      : [];

  return source
    .map((item: any) => {
      if (typeof item === 'string') {
        const value = item.trim();
        return value ? { label: value, value } : null;
      }

      const value = String(
        item?.value ??
        item?.Value ??
        item?.status ??
        item?.Status ??
        item?.name ??
        item?.Name ??
        item?.label ??
        item?.Label ??
        '',
      ).trim();

      const label = String(
        item?.label ??
        item?.Label ??
        item?.name ??
        item?.Name ??
        item?.status ??
        item?.Status ??
        value,
      ).trim();

      return value ? { label: label || value, value } : null;
    })
    .filter(Boolean) as OccupancyStatusOption[];
};

export const updateProfile = async (payload: EditProfilePayload) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Authentication token not found');

  const formData = new FormData();

  formData.append('FirstName', payload.firstName ?? '');
  formData.append('LastName', payload.lastName ?? '');
  formData.append('DateOfBirth', payload.dateOfBirth ?? '');
  formData.append('PetOwnership', payload.petOwnership ? 'true' : 'false');
  formData.append('MobileNumber', payload.mobileNumber ?? '');
  formData.append('Email', payload.email ?? '');

  if (payload.profilePhoto) {
    formData.append('ProfilePhotoFile', {
      uri: payload.profilePhoto.uri,
      name: payload.profilePhoto.name,
      type: payload.profilePhoto.type,
    } as any);
  }

  console.log('[editProfile.updateProfile] payload:', {
    firstName: payload.firstName,
    lastName: payload.lastName,
    dateOfBirth: payload.dateOfBirth,
    petOwnership: payload.petOwnership,
    mobileNumber: payload.mobileNumber,
    email: payload.email,
    hasProfilePhotoFile: Boolean(payload.profilePhoto),
  });
  console.log(
    '[editProfile.updateProfile] formData parts:',
    ((formData as any)._parts || []).map(([key, value]: [string, any]) => ({
      key,
      value:
        value && typeof value === 'object' && 'uri' in value
          ? {
              name: value.name,
              type: value.type,
              hasUri: Boolean(value.uri),
            }
          : value,
    })),
  );

  const response = await fetch(
    `${API_BASE_URL}/api/residents/self`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const message = await parseProfileUpdateError(response);
    const normalized = message.toLowerCase();
    if (response.status === 413 || normalized.includes('request entity too large')) {
      throw new Error('Profile photo is too large. Please upload a smaller image.');
    }
    throw new Error(message);
  }

  const json = await response.json();
  console.log('[editProfile.updateProfile] response:', json);
  return json;
};



