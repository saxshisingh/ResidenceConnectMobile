import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSecurityContact, SecurityContactInfo } from '../services/securityService';

interface FetchSecurityArgs {
  residenceId: string;
  blockId: string;
}

interface SecurityState {
  contact: SecurityContactInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: SecurityState = {
  contact: null,
  loading: false,
  error: null,
};

export const fetchSecurityContact = createAsyncThunk(
  'security/fetchContact',
  async ({ residenceId, blockId }: FetchSecurityArgs, { rejectWithValue }) => {
    try {
      const data = await getSecurityContact(residenceId, blockId);
      return data;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch security contact');
    }
  },
);

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    clearSecurityContact(state) {
      state.contact = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSecurityContact.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecurityContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contact = action.payload;
      })
      .addCase(fetchSecurityContact.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to fetch security contact';
      });
  },
});

export const { clearSecurityContact } = securitySlice.actions;
export default securitySlice.reducer;
