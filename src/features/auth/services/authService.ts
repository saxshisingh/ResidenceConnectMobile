import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../shared/api/apiClient';
import { API_BASE_URL } from '../../../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;



export interface LoginResponse {
  token: string;
  isFirstLogin: boolean;
}

export const AUTH_STORAGE_KEYS = {
  token: 'authToken',
  isFirstLogin: 'isFirstLogin',
  username: 'authUsername',
  password: 'Password',
  rememberMe: 'authRememberMe',
} as const;

const extractResponseErrorMessage = async (response: Response): Promise<string> => {
  const rawText = await response.text();
  const text = rawText.trim();

  if (!text) {
    return '';
  }

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') {
      return parsed;
    }
    if (typeof parsed?.message === 'string') {
      return parsed.message;
    }
    if (typeof parsed?.error === 'string') {
      return parsed.error;
    }
    if (Array.isArray(parsed?.errors) && typeof parsed.errors[0] === 'string') {
      return parsed.errors[0];
    }
  } catch {
    return text;
  }

  return text;
};



export const loginUser = async (
  username: string,
  password: string,
  rememberMe = false,
): Promise<LoginResponse> => {
  try {
    console.log('LOGIN URL:', `${API_URL}/login`);
    const payloads: Array<Record<string, string>> = [
      { username, password },
      { email: username, password },
      { Username: username, password },
    ];

    let response: Response | null = null;
    let lastErrorText = '';

    for (const payload of payloads) {
      response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        break;
      }

      lastErrorText = await extractResponseErrorMessage(response);

      // Retry only for likely validation payload mismatch.
      if (response.status !== 400) {
        break;
      }
    }

    if (!response || !response.ok) {
      if (response?.status === 401 || response?.status === 403) {
        throw new Error(lastErrorText || 'INVALID_CREDENTIALS');
      }

      if (/invalid credentials|invalid password|wrong password|incorrect password|unauthorized/i.test(lastErrorText)) {
        throw new Error(
          /invalid credentials/i.test(lastErrorText)
            ? 'INVALID_CREDENTIALS'
            : lastErrorText,
        );
      }

      const statusCode = response?.status ? ` (HTTP ${response.status})` : '';
      throw new Error(lastErrorText || `Login failed${statusCode}`);
    }

    const data: LoginResponse = await response.json();


    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.token, data.token);
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.isFirstLogin,
      JSON.stringify(data.isFirstLogin)
    );
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.rememberMe,
      JSON.stringify(rememberMe),
    );

    if (rememberMe) {
      await AsyncStorage.multiSet([
        [AUTH_STORAGE_KEYS.username, username],
        [AUTH_STORAGE_KEYS.password, password],
      ]);
    } else {
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.username,
        AUTH_STORAGE_KEYS.password,
      ]);
    }

    return data;
  } catch (error: any) {
    console.error('LOGIN ERROR:', error);
    throw new Error(error.message || 'Network error');
  }
};





export const setPassword = async (
  newPassword: string,
  confirmPassword: string,
  token: string
) => {
  console.log('[authService.setPassword] request start', {
    url: `${API_BASE_URL}/api/auth/set-password`,
    hasToken: Boolean(token),
    newPasswordLength: String(newPassword ?? '').length,
    confirmPasswordLength: String(confirmPassword ?? '').length,
  });
  const response = await fetch(`${API_BASE_URL}/api/auth/set-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      newPassword,
      confirmPassword,
    }),
  });

  console.log('SET PASSWORD RESPONSE:', response);

  if (!response.ok) {
    console.log('[authService.setPassword] non-ok response', {
      status: response.status,
      statusText: response.statusText,
    });
    const message = await extractResponseErrorMessage(response);
    console.log('[authService.setPassword] parsed error message', message);
    const statusCode = response.status ? ` (HTTP ${response.status})` : '';
    throw new Error(message || `Failed to update password${statusCode}`);
  }

  const text = await response.text();
  console.log('[authService.setPassword] raw success text', text);

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};



export const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);
};

export const getIsFirstLogin = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.isFirstLogin);
  return value ? JSON.parse(value) : false;
};



export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    AUTH_STORAGE_KEYS.token,
    AUTH_STORAGE_KEYS.isFirstLogin,
    AUTH_STORAGE_KEYS.username,
    AUTH_STORAGE_KEYS.password,
    AUTH_STORAGE_KEYS.rememberMe,
  ]);
};

export const fetchUserProfile = async () => {
  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);

  const response = await apiFetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  
  await AsyncStorage.setItem('user', JSON.stringify(json));

  return json;
};
