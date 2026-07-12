import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTH_STORAGE_KEYS,
  fetchUserProfile,
  loginUser,
  setPassword,
} from '../services/authService';
import { UnauthorizedError } from '../../../shared/api/apiClient';



interface AuthState {
  token: string | null;
  isFirstLogin: boolean;
  loading: boolean;
  error: string | null;
  passwordUpdated: boolean;
  user: any | null; 
}




const initialState: AuthState = {
  token: null,
  isFirstLogin: false,
  loading: false,
  error: null,
  passwordUpdated: false,
  user: null, // 👈 ADD THIS
};





export const login = createAsyncThunk(
  'auth/login',
  async (
    {
      username,
      password,
      rememberMe,
    }: { username: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await loginUser(username, password, rememberMe);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const confirmPasswordThunk = createAsyncThunk(
  'auth/confirmPassword',
  async (
    {
      newPassword,
      confirmPassword,
    }: { newPassword: string; confirmPassword: string },
    { getState, rejectWithValue }
  ) => {
    try {
      console.log('[authSlice.confirmPasswordThunk] started');
      const stateToken = (getState() as any).auth.token;
      const token = stateToken || (await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token));
      console.log('[authSlice.confirmPasswordThunk] token lookup', {
        hasStateToken: Boolean(stateToken),
        hasResolvedToken: Boolean(token),
      });
      if (!token) throw new Error('UNAUTHORIZED');

      console.log('[authSlice.confirmPasswordThunk] calling setPassword');
      const response = await setPassword(newPassword, confirmPassword, token);
      console.log('[authSlice.confirmPasswordThunk] setPassword success', response);
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.isFirstLogin, JSON.stringify(false));
      return response;
    } catch (error: any) {
      console.log('[authSlice.confirmPasswordThunk] failed', error?.message, error);
      if (error.message === 'UNAUTHORIZED') {
        return rejectWithValue('SESSION_EXPIRED');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const callAuthMeAndLog = createAsyncThunk(
  'auth/callAuthMeAndLog',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUserProfile();

      console.log('AUTH ME USER:', response);

      return response; 
    } catch (error: any) {
      console.error('AUTH ME ERROR:', error.message);
      if (error instanceof UnauthorizedError || error?.message === 'UNAUTHORIZED') {
        return rejectWithValue('SESSION_EXPIRED');
      }
      return rejectWithValue(error.message);
    }
  }
);





const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.isFirstLogin = false;
      state.error = null;
      state.passwordUpdated = false;
      state.user = null;

      AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.token,
        AUTH_STORAGE_KEYS.isFirstLogin,
        AUTH_STORAGE_KEYS.username,
        AUTH_STORAGE_KEYS.password,
        AUTH_STORAGE_KEYS.rememberMe,
      ]);
    },

    setAuthFromStorage(state, action) {
      state.token = action.payload.token;
      state.isFirstLogin = action.payload.isFirstLogin;
    },

    completeFirstLogin(state) {
      state.isFirstLogin = false;
      AsyncStorage.setItem(AUTH_STORAGE_KEYS.isFirstLogin, JSON.stringify(false));
    },

    resetPasswordState(state) {
      state.passwordUpdated = false;
      state.error = null;
    },

    updateAuthUserProfile(state, action) {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        data: {
          ...(state.user.data || {}),
          ...action.payload,
        },
      };
    },
  },

extraReducers: builder => {

  builder
    .addCase(login.pending, state => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.isFirstLogin = action.payload.isFirstLogin;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

 
  builder
    .addCase(confirmPasswordThunk.pending, state => {
      state.loading = true;
      state.error = null;
    })
    .addCase(confirmPasswordThunk.fulfilled, state => {
      state.loading = false;
      state.passwordUpdated = true;
      state.isFirstLogin = false;
    })
    .addCase(confirmPasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });


  builder
    .addCase(callAuthMeAndLog.pending, state => {
      state.loading = true;
    })
    .addCase(callAuthMeAndLog.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload; 
    })
    .addCase(callAuthMeAndLog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
}

});



export const {
  logout,
  setAuthFromStorage,
  completeFirstLogin,
  resetPasswordState,
  updateAuthUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
