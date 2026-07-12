import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  updateProfile,
  EditProfilePayload,
  getProfile,
} from '../services/editProfile';

// interface EditProfileState {
//   loading: boolean;
//   success: boolean;
//   error: string | null;
// }

// const initialState: EditProfileState = {
//   loading: false,
//   success: false,
//   error: null,
// };

export const fetchProfile = createAsyncThunk(
  'editProfile/fetchProfile',
  async (residentId: string) => {
    return await getProfile(residentId);
  },
);

export const editProfile = createAsyncThunk(
  'profile/edit',
  async (payload: EditProfilePayload, { rejectWithValue }) => {
    try {
      console.log('EDIT PROFILE PAYLOAD:', payload);
      return await updateProfile(payload);
    } catch (error: any) {
      console.log('EDIT PROFILE ERROR:', error.message);
      return rejectWithValue(error.message);
    }
  }
);


const editProfileSlice = createSlice({
  name: 'editProfile',
  initialState: {
    loading: false,
    success: false,
    error: null as string | null,
    profile: null as any,
  },
  reducers: {
    resetEditProfileState: state => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
     
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching profile';
      })

    
      .addCase(editProfile.pending, state => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const nextProfile = action.payload?.data || action.payload || null;
        if (nextProfile && typeof nextProfile === 'object') {
          state.profile = {
            ...(state.profile || {}),
            ...nextProfile,
          };
        }
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || 'Update failed';
      });
  },
});

export const { resetEditProfileState } = editProfileSlice.actions;
export default editProfileSlice.reducer;
