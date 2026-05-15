import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

const appendIfPresent = (formData: FormData, key: string, value: any) => {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, String(value));
  }
};

export const getFamilyMembersByResident = async (residentId: string) => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/family-members/resident/${residentId}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch family members');
  }

  const json = await res.json();
  return json?.data || [];
};

export const createFamilyMember = async (payload: any) => {
  const token = await AsyncStorage.getItem('authToken');
  const formData = new FormData();

  appendIfPresent(formData, 'ResidentId', payload.residentId);
  appendIfPresent(formData, 'FullName', payload.fullName);
  appendIfPresent(formData, 'Relation', payload.relation);
  appendIfPresent(formData, 'Gender', payload.gender);
  appendIfPresent(formData, 'Mobile', payload.mobile);
  appendIfPresent(formData, 'Email', payload.email);
  appendIfPresent(formData, 'Status', payload.status ?? 1);
  appendIfPresent(formData, 'AccessPermission', payload.accessPermission);
  appendIfPresent(formData, 'ModifiedBy', payload.modifiedBy);
  appendIfPresent(formData, 'ProfilePhoto', payload.profilePhoto);

  if (payload.profilePhotoFile) {
    formData.append('ProfilePhotoFile', {
      uri: payload.profilePhotoFile.uri,
      type: payload.profilePhotoFile.type,
      name: payload.profilePhotoFile.name,
    } as any);
  }

  const res = await fetch(`${API_BASE_URL}/api/family-members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to create family member');
  }

  return await res.json();
};

export const updateFamilyMember = async (familyMemberId: string, payload: any) => {
  const token = await AsyncStorage.getItem('authToken');
  const formData = new FormData();

  appendIfPresent(formData, 'FamilyMemberId', familyMemberId);
  appendIfPresent(formData, 'ResidentId', payload.residentId);
  appendIfPresent(formData, 'FullName', payload.fullName);
  appendIfPresent(formData, 'Relation', payload.relation);
  appendIfPresent(formData, 'Gender', payload.gender);
  appendIfPresent(formData, 'Mobile', payload.mobile);
  appendIfPresent(formData, 'Email', payload.email);
  appendIfPresent(formData, 'Status', payload.status ?? 1);
  appendIfPresent(formData, 'AccessPermission', payload.accessPermission);
  appendIfPresent(formData, 'ModifiedBy', payload.modifiedBy);
  appendIfPresent(formData, 'ProfilePhoto', payload.profilePhoto);

  if (payload.profilePhotoFile) {
    formData.append('ProfilePhotoFile', {
      uri: payload.profilePhotoFile.uri,
      type: payload.profilePhotoFile.type,
      name: payload.profilePhotoFile.name,
    } as any);
  }

  const res = await fetch(`${API_BASE_URL}/api/family-members/${familyMemberId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to update family member');
  }

  return await res.json();
};

export const deleteFamilyMember = async (familyMemberId: string, deletedBy: string) => {
  const res = await apiFetch(
    `${API_BASE_URL}/api/family-members/${familyMemberId}?deletedBy=${deletedBy}`,
    {
      method: 'DELETE',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to delete family member');
  }

  return await res.json();
};
