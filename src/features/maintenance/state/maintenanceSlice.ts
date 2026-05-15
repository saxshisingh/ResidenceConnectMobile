import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  CreateMaintenancePayload,
  createMaintenanceRequestApi,
  getMaintenanceById,
  getMaintenanceByResident,
  getTechnicianById,
  getTechniciansByServiceCategory,
  MaintenanceRequestItem,
  TechnicianInfo,
} from '../services/maintenanceService';

interface MaintenanceState {
  history: MaintenanceRequestItem[];
  historyLoading: boolean;
  historyError: string | null;

  createLoading: boolean;
  createError: string | null;
  createdRequestId: string | null;

  requestDetails: MaintenanceRequestItem | null;
  requestLoading: boolean;
  requestError: string | null;

  technicianDetails: TechnicianInfo | null;
  technicianLoading: boolean;
  technicianError: string | null;
}

const initialState: MaintenanceState = {
  history: [],
  historyLoading: false,
  historyError: null,

  createLoading: false,
  createError: null,
  createdRequestId: null,

  requestDetails: null,
  requestLoading: false,
  requestError: null,

  technicianDetails: null,
  technicianLoading: false,
  technicianError: null,
};

export const fetchMaintenanceHistory = createAsyncThunk(
  'maintenance/fetchHistory',
  async (residentId: string, { rejectWithValue }) => {
    try {
      return await getMaintenanceByResident(residentId);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch maintenance history');
    }
  },
);

export const createMaintenanceRequestThunk = createAsyncThunk(
  'maintenance/create',
  async (payload: CreateMaintenancePayload, { rejectWithValue }) => {
    try {
      return await createMaintenanceRequestApi(payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to create maintenance request');
    }
  },
);

export const fetchMaintenanceRequestById = createAsyncThunk(
  'maintenance/fetchById',
  async (requestId: string, { rejectWithValue }) => {
    try {
      return await getMaintenanceById(requestId);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch maintenance request');
    }
  },
);

export const fetchTechnicianForRequest = createAsyncThunk(
  'maintenance/fetchTechnicianForRequest',
  async (
    params: {
      requestId?: string;
      technicianId?: string;
      serviceCategoryId?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      if (params.technicianId) {
        const direct = await getTechnicianById(params.technicianId);
        if (direct) return direct;
      }

      if (params.serviceCategoryId) {
        const byCategory = await getTechniciansByServiceCategory(
          params.serviceCategoryId,
        );
        if (byCategory.length > 0) return byCategory[0];
      }

      if (params.requestId) {
        const request = await getMaintenanceById(params.requestId);
        if (request?.technician) return request.technician;

        if (request?.serviceCategoryId) {
          const byCategory = await getTechniciansByServiceCategory(
            request.serviceCategoryId,
          );
          if (byCategory.length > 0) return byCategory[0];
        }
      }

      return null;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch technician');
    }
  },
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearCreatedRequest(state) {
      state.createdRequestId = null;
      state.createError = null;
    },
    clearRequestDetails(state) {
      state.requestDetails = null;
      state.requestError = null;
    },
    clearTechnicianDetails(state) {
      state.technicianDetails = null;
      state.technicianError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMaintenanceHistory.pending, state => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchMaintenanceHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchMaintenanceHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = (action.payload as string) || 'Unable to load history';
        state.history = [];
      })
      .addCase(createMaintenanceRequestThunk.pending, state => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createMaintenanceRequestThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdRequestId = action.payload;
      })
      .addCase(createMaintenanceRequestThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = (action.payload as string) || 'Unable to create request';
      })
      .addCase(fetchMaintenanceRequestById.pending, state => {
        state.requestLoading = true;
        state.requestError = null;
      })
      .addCase(fetchMaintenanceRequestById.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.requestDetails = action.payload;
      })
      .addCase(fetchMaintenanceRequestById.rejected, (state, action) => {
        state.requestLoading = false;
        state.requestError = (action.payload as string) || 'Unable to load request';
        state.requestDetails = null;
      })
      .addCase(fetchTechnicianForRequest.pending, state => {
        state.technicianLoading = true;
        state.technicianError = null;
      })
      .addCase(fetchTechnicianForRequest.fulfilled, (state, action) => {
        state.technicianLoading = false;
        state.technicianDetails = action.payload;
      })
      .addCase(fetchTechnicianForRequest.rejected, (state, action) => {
        state.technicianLoading = false;
        state.technicianError = (action.payload as string) || 'Unable to load technician';
        state.technicianDetails = null;
      });
  },
});

export const {
  clearCreatedRequest,
  clearRequestDetails,
  clearTechnicianDetails,
} = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
