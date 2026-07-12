import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface UploadableVehicleFile {
  uri: string;
  type: string;
  name: string;
}


export const getVehiclesByResident = async (residentId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/vehicles/resident/${residentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch vehicles');

  const json = await res.json();
  console.log("json",json.data)
  return json.data;
};

export const getAllVehicles = async () => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(`${API_BASE_URL}/api/vehicles`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  return await res.json(); 
};

export const getVehicleById = async (vehicleId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/vehicles/${vehicleId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch vehicle');
  return await res.json();
};


export const createVehicle = async (payload: any) => {
  const token = await AsyncStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('residentId', payload.residentId);
  formData.append('Brand', payload.Brand ?? payload.brand ?? '');
  formData.append('vehicleNumber', payload.vehicleNumber);
  formData.append('model', payload.model);
  formData.append('color', payload.color);
  formData.append('vehicleType', payload.vehicleType);
  formData.append('createdBy', payload.createdBy);

  if (payload.rcDocsFile) {
    formData.append('rcDocsFile', {
      uri: payload.rcDocsFile.uri,
      type: payload.rcDocsFile.type,
      name: payload.rcDocsFile.name,
    } as any);
  }

  const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, 
    },
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to create vehicle');
  return await res.json();
};


export const updateVehicle = async (vehicleId: string, payload: any) => {
  const token = await AsyncStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('vehicleId', vehicleId);
  formData.append('Brand', payload.Brand ?? payload.brand ?? '');
  formData.append('vehicleNumber', payload.vehicleNumber);
  formData.append('model', payload.model);
  formData.append('color', payload.color);
  formData.append('vehicleType', payload.vehicleType);
  formData.append('modifiedBy', payload.modifiedBy);

  if (payload.rcDocsFile) {
    formData.append('rcDocsFile', {
      uri: payload.rcDocsFile.uri,
      type: payload.rcDocsFile.type,
      name: payload.rcDocsFile.name,
    } as any);
  }

  const res = await fetch(
    `${API_BASE_URL}/api/vehicles/${vehicleId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!res.ok) throw new Error('Failed to update vehicle');
  return await res.json();
};

export const deleteVehicle = async (vehicleId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete vehicle');
  }

  return await res.json();
};

export const uploadVehicleRcDocument = async (params: {
  vehicleId: string;
  file: UploadableVehicleFile;
}) => {
  const token = await AsyncStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('EntityType', 'Vehicle');
  formData.append('EntityId', params.vehicleId);
  formData.append('Files[0].DocumentType', 'Vehicle Document (RC)');
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
    throw new Error(text || 'Failed to upload RC document');
  }

  return await response.json();
};
