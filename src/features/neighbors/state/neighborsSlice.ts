import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNeighbors, Neighbor } from '../services/neighborsService';

interface NeighborsState {
  neighbors: Neighbor[];
  loading: boolean;
  error: string | null;
}

const initialState: NeighborsState = {
  neighbors: [],
  loading: false,
  error: null,
};

export const loadNeighbors = createAsyncThunk(
  'neighbors/loadNeighbors',
  async (residentId: string, { rejectWithValue }) => {
    try {
      const neighbors = await fetchNeighbors(residentId);
      return neighbors;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const neighborsSlice = createSlice({
  name: 'neighbors',
  initialState,
  reducers: {
    clearNeighbors(state) {
      state.neighbors = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadNeighbors.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNeighbors.fulfilled, (state, action) => {
        state.loading = false;
        state.neighbors = action.payload;
      })
      .addCase(loadNeighbors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNeighbors } = neighborsSlice.actions;
export default neighborsSlice.reducer;
