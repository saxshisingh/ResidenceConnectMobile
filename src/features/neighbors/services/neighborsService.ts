import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

export interface Neighbor {
  residentId: string;
  noOfVehicles?: number | string | null;
  noOfVehicle?: number | string | null;
  vehicleCount?: number | string | null;
  totalVehicles?: number | string | null;
  numberOfVehicles?: number | string | null;
  neighbourName?: string;
  neighborName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  petOwnership?: boolean | null;
  maxAllowedResidents?: number | string | null;
  mobileNumber?: string | null;
  email?: string | null;
  occupacyStatus?: string | null;
  waterMeterNo?: string | null;
  gasMeterNo?: string | null;
  electricityMeterNo?: string | null;
  apartmentId?: string | null;
  apartmentUnit?: string | null;
  apartmentType?: string | null;
  apartmentNumber?: string | null;
  floorId?: string | null;
  floorNumber?: string | null;
  blockId?: string | null;
  blockName?: string | null;
  residenceId?: string | null;
  residenceName?: string | null;
  ttLockUserId?: string | null;
  neighbourPhoto?: string | null;
  neighborPhoto?: string | null;
  profilePhoto?: string | null;
  photo?: string | null;
  imageUrl?: string | null;
  profileImage?: string | null;
  neighbourApartmentNumber?: string | null;
  userId?: string;
  neighbourUserId?: string;
  neighborUserId?: string;
  residentUserId?: string;
  conversationId?: string;
  vehicleNumbers?: string | null;
  vehicleNumbersList?: string[] | null;
  vehicleTypeList?: string[] | null;
  vehicleTypes?: string | null;
  parkingSlots?: string | null;
  parkingSlotsList?: string[] | null;
  vehicleNumber?: string | null;
  vehicleNo?: string | null;
  vehicleRegistrationNumber?: string | null;
  vehicleNumberPlate?: string | null;
  registrationNumber?: string | null;
  plateNumber?: string | null;
  vehicleType?: string | null;
  typeOfVehicle?: string | null;
  parkingSlot?: string | null;
  parkingSlotNumber?: string | null;
  slotNumber?: string | null;
  parkingNumber?: string | null;
  assignedParkingSlot?: string | null;
  parkingType?: string | null;
  assignmentType?: string | null;
  vehicles?: any[] | null;
  vehicleDetails?: any[] | null;
  residentVehicles?: any[] | null;
  neighbourVehicles?: any[] | null;
  parkingDetails?: any[] | null;
  parkings?: any[] | null;
}

export interface NeighborsResponse {
  status: boolean;
  message: string;
  data: Neighbor[];
}

export const fetchNeighbors = async (
  residentId: string
): Promise<Neighbor[]> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await apiFetch(`${API_BASE_URL}/api/residents/same-block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ residentId }),
    });

    console.log("response",response)

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to fetch neighbors');
    }

    const json: NeighborsResponse = await response.json();
    
    if (!json.status) {
      throw new Error(json.message || 'Failed to fetch neighbors');
    }

    return json.data;
  } catch (error: any) {
    console.error('FETCH NEIGHBORS ERROR:', error);
    throw new Error(error.message || 'Network error');
  }
};
