import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';


export const getParkingAssignmentsByResident = async (
  residentId: string
) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/parking-assignments/by-resident/${residentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch parking assignments');
  }

  const json = await res.json();

  
  return json.data; 
};

export const getParkingSlotById = async (slotId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const response = await apiFetch(
    `${API_BASE_URL}/api/parking-slots/${slotId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load parking slot');
  }

  const json = await response.json();
  console.log("json.data",json)
  return json.data; 
};


export const updateParkingSlot = async (payload: any) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/parking-slots`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  console.log("payload",payload)
  console.log("res",res)

  if (!res.ok) throw new Error('Failed to update parking slot');
  return await res.json();
};



export const createParkingAssignment = async (
  residentId: string,
  payload: any
) => {
  const token = await AsyncStorage.getItem('authToken');
console.log("payload",payload)
  const res = await apiFetch(
    `${API_BASE_URL}/api/parking-assignments/${residentId}`,
    {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    let errorJson: any = null;
    try {
      errorJson = await res.json();
    } catch {
      // Ignore non-JSON error bodies.
    }

    const dtoError = errorJson?.errors?.dto?.[0];
    if (res.status === 400 && dtoError === 'The dto field is required.') {
      const wrappedRes = await apiFetch(
        `${API_BASE_URL}/api/parking-assignments/${residentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dto: payload }),
        }
      );

      if (!wrappedRes.ok) {
        throw new Error('Failed to save parking assignment');
      }

      return await wrappedRes.json();
    }

    throw new Error('Failed to save parking assignment');
  }

  return await res.json();
};



export const getParkingSlotsByBlock = async (blockId: string) => {
  const token = await AsyncStorage.getItem('authToken');

  const res = await apiFetch(
    `${API_BASE_URL}/api/parking-slots/by-block/${blockId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch block parking slots');

  const json = await res.json();
  return json.data; 
};

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
  return json.data;
};


