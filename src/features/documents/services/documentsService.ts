import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config/api';
import { apiFetch } from '../../../shared/api/apiClient';

export interface ResidentFileDto {
  fileId: string;
  fileName: string;
  fileUrl: string;
  documentType: string;
  uploadedAt?: string | null;
  uploadedBy?: string | null;
}

export interface UploadableFile {
  uri: string;
  type: string;
  name: string;
}

const toAbsoluteFileUrl = (value: string) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${API_BASE_URL}/${normalized.replace(/^\/+/, '')}`;
};

const normalizeDocumentType = (value: string) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'govtidproof' || normalized === 'governmentid' || normalized === 'government id') {
    return 'Government ID';
  }

  if (normalized === 'ownershipproof' || normalized === 'addressproof' || normalized === 'address proof') {
    return 'Address Proof';
  }

  if (
    normalized === 'vehicledocument(rc)' ||
    normalized === 'vehicle document (rc)' ||
    normalized === 'vehicledocument' ||
    normalized === 'vehiclerc' ||
    normalized === 'rcdocument'
  ) {
    return 'Vehicle Document (RC)';
  }

  if (normalized === 'societynoc' || normalized === 'society noc') {
    return 'Society NOC';
  }

  if (normalized === 'profilephoto' || normalized === 'profilepicture') {
    return 'Profile Photo';
  }

  return String(value || '').trim();
};

const normalizeFile = (item: any): ResidentFileDto => ({
  fileId: String(item?.fileId || item?.FileId || ''),
  fileName: String(item?.fileName || item?.FileName || ''),
  fileUrl: toAbsoluteFileUrl(String(item?.fileUrl || item?.FileUrl || '')),
  documentType: normalizeDocumentType(String(item?.documentType || item?.DocumentType || '')),
  uploadedAt: item?.uploadedAt || item?.UploadedAt || null,
  uploadedBy: item?.uploadedBy || item?.UploadedBy || null,
});

export const getEntityFiles = async (entityId: string) => {
  const response = await apiFetch(
    `${API_BASE_URL}/api/residents/files/${entityId}`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }

  const json = await response.json();
  const rawList = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];

  return rawList.map(normalizeFile);
};

export const getResidentFiles = async (residentId: string) => getEntityFiles(residentId);

export const uploadResidentFile = async (params: {
  residentId: string;
  documentType: string;
  file: UploadableFile;
}) => {
  const token = await AsyncStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('EntityType', 'Resident');
  formData.append('EntityId', params.residentId);
  formData.append('Files[0].DocumentType', params.documentType);
  formData.append('Files[0].File', {
    uri: params.file.uri,
    type: params.file.type,
    name: params.file.name,
  } as any);

  const response = await fetch(`${API_BASE_URL}/api/residents/files`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to upload document');
  }

  return await response.json();
};

