import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchBillsByResident, BillItem } from '../services/billsService';

export const fetchBills = createAsyncThunk(
  'bills/fetch',
  async (residentId: string) => {
    return await fetchBillsByResident(residentId);
  }
);

interface BillsState {
  list: BillItem[];
  loading: boolean;
}

const initialState: BillsState = {
  list: [],
  loading: false,
};

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBills.pending, state => {
        state.loading = true;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchBills.rejected, state => {
        state.loading = false;
      });
  },
});

export default billsSlice.reducer;
