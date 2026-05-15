// redux/slices/parkingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getParkingAssignmentsByResident } from '../services/parkingService';

export const fetchParkingSlots = createAsyncThunk(
  'parking/fetchByResident',
  async (residentId: string) => {
    const data = await getParkingAssignmentsByResident(residentId);
    return data; 
  }
);

interface ParkingState {
  loading: boolean;
  slots: any[];
  error: string | null;
}

const initialState: ParkingState = {
  loading: false,
  slots: [],
  error: null,
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchParkingSlots.pending, state => {
        state.loading = true;
      })
      .addCase(fetchParkingSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload;
      })
      .addCase(fetchParkingSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default parkingSlice.reducer;
