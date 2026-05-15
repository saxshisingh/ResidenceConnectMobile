import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deleteVehicle, getVehiclesByResident } from '../services/vehicleService';

export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchByResident',
  async (residentId: string) => {
    const res = await getVehiclesByResident(residentId);
    return res; 
  }
);

export const deleteVehicleThunk = createAsyncThunk(
  'vehicle/delete',
  async (vehicleId: string) => {
    await deleteVehicle(vehicleId);
    return vehicleId;
  },
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    loading: false,
    vehicles: [] as any[],
    error: null as string | null,
    hasFetched: false, 
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchVehicles.pending, state => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
        state.hasFetched = true; 
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
        state.hasFetched = true; 
      })
      .addCase(deleteVehicleThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(
          item => item.vehicleId !== action.payload,
        );
      })
      .addCase(deleteVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});


export default vehicleSlice.reducer;
