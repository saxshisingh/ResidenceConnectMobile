import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteFamilyMember, getFamilyMembersByResident } from '../services/familyService';

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchByResident',
  async (residentId: string) => {
    const data = await getFamilyMembersByResident(residentId);
    return data;
  },
);

export const deleteFamilyMemberThunk = createAsyncThunk(
  'family/delete',
  async ({ familyMemberId, deletedBy }: { familyMemberId: string; deletedBy: string }) => {
    await deleteFamilyMember(familyMemberId, deletedBy);
    return familyMemberId;
  },
);

interface FamilyState {
  loading: boolean;
  items: any[];
  error: string | null;
  hasFetched: boolean;
}

const initialState: FamilyState = {
  loading: false,
  items: [],
  error: null,
  hasFetched: false,
};

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFamilyMembers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch family members';
        state.hasFetched = true;
      })
      .addCase(deleteFamilyMemberThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFamilyMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => {
          const familyId = item.familyMemberId || item.memberId || item.id;
          return familyId !== action.payload;
        });
      })
      .addCase(deleteFamilyMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete family member';
      });
  },
});

export default familySlice.reducer;
