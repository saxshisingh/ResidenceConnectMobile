import AsyncStorage from '@react-native-async-storage/async-storage';

import {apiFetch} from '../../../shared/api/apiClient';
import {API_BASE_URL} from '../../../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

/* ============================================================
 * TYPES
 * ============================================================ */

export interface LoginResponse {
  token: string;
  refreshToken: string;
  isFirstLogin: boolean;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordResponse {
  message?: string;
}

/*
 * Your backend refresh endpoint returns:
 *
 * {
 *   status: true,
 *   message: "Token refreshed successfully.",
 *   data: {
 *     token: "...",
 *     refreshToken: "..."
 *   }
 * }
 */
interface RefreshApiResponse {
  status: boolean;
  message: string;
  data: RefreshTokenResponse;
}

/* ============================================================
 * STORAGE KEYS
 * ============================================================ */

export const AUTH_STORAGE_KEYS = {
  token: 'authToken',
  refreshToken: 'refreshToken',
  isFirstLogin: 'isFirstLogin',
  username: 'authUsername',
  password: 'Password',
  rememberMe: 'authRememberMe',
} as const;

/* ============================================================
 * ERROR HELPER
 * ============================================================ */

export const extractResponseErrorMessage = async (
  response: Response,
): Promise<string> => {
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

    if (
      Array.isArray(parsed?.errors) &&
      typeof parsed.errors[0] === 'string'
    ) {
      return parsed.errors[0];
    }
  } catch {
    return text;
  }

  return text;
};

/* ============================================================
 * LOGIN
 * ============================================================ */

export const loginUser = async (
  username: string,
  password: string,
  rememberMe = false,
): Promise<LoginResponse> => {
  try {
    console.log('LOGIN URL:', `${API_URL}/login`);

    const payloads: Array<Record<string, string>> = [
      {
        username,
        password,
      },
      {
        email: username,
        password,
      },
      {
        Username: username,
        password,
      },
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

      lastErrorText =
        await extractResponseErrorMessage(response);

      // Only retry with another payload for 400.
      if (response.status !== 400) {
        break;
      }
    }

    if (!response || !response.ok) {
      if (
        response?.status === 401 ||
        response?.status === 403
      ) {
        throw new Error(
          lastErrorText || 'INVALID_CREDENTIALS',
        );
      }

      if (
        /invalid credentials|invalid password|wrong password|incorrect password|unauthorized/i.test(
          lastErrorText,
        )
      ) {
        throw new Error(
          /invalid credentials/i.test(lastErrorText)
            ? 'INVALID_CREDENTIALS'
            : lastErrorText,
        );
      }

      const statusCode = response?.status
        ? ` (HTTP ${response.status})`
        : '';

      throw new Error(
        lastErrorText ||
          `Login failed${statusCode}`,
      );
    }

    const data: LoginResponse =
      await response.json();

    /*
     * IMPORTANT:
     * Store BOTH access token and refresh token.
     */

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.token,
      data.token,
    );

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.refreshToken,
      data.refreshToken,
    );

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.isFirstLogin,
      JSON.stringify(data.isFirstLogin),
    );

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.rememberMe,
      JSON.stringify(rememberMe),
    );

    /*
     * Store credentials only when Remember Me
     * is enabled.
     */

    if (rememberMe) {
      await AsyncStorage.multiSet([
        [
          AUTH_STORAGE_KEYS.username,
          username,
        ],
        [
          AUTH_STORAGE_KEYS.password,
          password,
        ],
      ]);
    } else {
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.username,
        AUTH_STORAGE_KEYS.password,
      ]);
    }

    console.log('LOGIN SUCCESS');

    return data;
  } catch (error: any) {
    console.error('LOGIN ERROR:', error);

    throw new Error(
      error?.message || 'Network error',
    );
  }
};

/* ============================================================
 * REFRESH TOKEN
 *
 * This function can also be called manually if needed.
 *
 * Normally apiFetch() handles this automatically.
 * ============================================================ */

export const refreshAccessToken =
  async (): Promise<RefreshTokenResponse> => {
    const refreshToken =
      await AsyncStorage.getItem(
        AUTH_STORAGE_KEYS.refreshToken,
      );

    if (!refreshToken) {
      throw new Error(
        'Refresh token not found',
      );
    }

    const response = await fetch(
      `${API_URL}/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      },
    );

    if (!response.ok) {
      const message =
        await extractResponseErrorMessage(
          response,
        );

      throw new Error(
        message ||
          `Token refresh failed (HTTP ${response.status})`,
      );
    }

    const json: RefreshApiResponse =
      await response.json();

    if (!json.status || !json.data) {
      throw new Error(
        json.message ||
          'Token refresh failed',
      );
    }

    const newToken = json.data.token;
    const newRefreshToken =
      json.data.refreshToken;

    if (!newToken || !newRefreshToken) {
      throw new Error(
        'Invalid token refresh response',
      );
    }

    /*
     * IMPORTANT:
     * Backend rotates the refresh token.
     * Therefore save BOTH new tokens.
     */

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.token,
      newToken,
    );

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.refreshToken,
      newRefreshToken,
    );

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  };

/* ============================================================
 * FORGOT PASSWORD
 * ============================================================ */

export const forgotPassword = async (
  email: string,
): Promise<ForgotPasswordResponse | null> => {
  try {
    const payloads: Array<Record<string, string>> = [
      {
        Email: email,
      },
      {
        email,
      },
    ];

    let response: Response | null = null;
    let lastErrorText = '';

    for (const payload of payloads) {
      response = await fetch(
        `${API_URL}/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        break;
      }

      lastErrorText =
        await extractResponseErrorMessage(
          response,
        );

      if (response.status !== 400) {
        break;
      }
    }

    if (!response || !response.ok) {
      const statusCode = response?.status
        ? ` (HTTP ${response.status})`
        : '';

      throw new Error(
        lastErrorText ||
          `Forgot password failed${statusCode}`,
      );
    }

    const text = await response.text();

    if (!text.trim()) {
      return null;
    }

    try {
      return JSON.parse(
        text,
      ) as ForgotPasswordResponse;
    } catch {
      return {
        message: text.trim(),
      };
    }
  } catch (error: any) {
    console.error(
      'FORGOT PASSWORD ERROR:',
      error,
    );

    throw new Error(
      error?.message || 'Network error',
    );
  }
};

/* ============================================================
 * SET PASSWORD
 * ============================================================ */

export const setPassword = async (
  newPassword: string,
  confirmPassword: string,
  token: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/set-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newPassword,
        confirmPassword,
      }),
    },
  );

  if (!response.ok) {
    const message =
      await extractResponseErrorMessage(
        response,
      );

    const statusCode = response.status
      ? ` (HTTP ${response.status})`
      : '';

    throw new Error(
      message ||
        `Failed to update password${statusCode}`,
    );
  }

  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

/* ============================================================
 * GET AUTH TOKEN
 * ============================================================ */

export const getAuthToken =
  async (): Promise<string | null> => {
    return AsyncStorage.getItem(
      AUTH_STORAGE_KEYS.token,
    );
  };

/* ============================================================
 * GET REFRESH TOKEN
 * ============================================================ */

export const getRefreshToken =
  async (): Promise<string | null> => {
    return AsyncStorage.getItem(
      AUTH_STORAGE_KEYS.refreshToken,
    );
  };

/* ============================================================
 * GET FIRST LOGIN
 * ============================================================ */

export const getIsFirstLogin =
  async (): Promise<boolean> => {
    const value =
      await AsyncStorage.getItem(
        AUTH_STORAGE_KEYS.isFirstLogin,
      );

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return false;
  };

/* ============================================================
 * LOGOUT
 *
 * IMPORTANT:
 * 1. Tell backend to revoke refresh token/session.
 * 2. Clear local authentication.
 * 3. DO NOT change the user's language in DB.
 * 4. Clear only local language cache.
 * ============================================================ */

export const logout = async (): Promise<void> => {
  const token =
    await AsyncStorage.getItem(
      AUTH_STORAGE_KEYS.token,
    );

  try {
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    /*
     * Even if the server is unreachable,
     * we still clear the local session.
     */
    console.warn(
      'LOGOUT API ERROR:',
      error,
    );
  } finally {
    await AsyncStorage.multiRemove([
      AUTH_STORAGE_KEYS.token,
      AUTH_STORAGE_KEYS.refreshToken,
      AUTH_STORAGE_KEYS.isFirstLogin,
      AUTH_STORAGE_KEYS.username,
      AUTH_STORAGE_KEYS.password,
      AUTH_STORAGE_KEYS.rememberMe,

      /*
       * Local language cache only.
       *
       * The actual selected language remains
       * in the database.
       */
      'selectedLanguageId',
      'appLanguageCode',

      /*
       * Cached user profile.
       */
      'user',
    ]);
  }
};

/* ============================================================
 * FETCH CURRENT USER PROFILE
 *
 * /api/auth/me returns the user's language from DB.
 * ============================================================ */

export const fetchUserProfile = async () => {
  const token =
    await AsyncStorage.getItem(
      AUTH_STORAGE_KEYS.token,
    );

  if (!token) {
    throw new Error(
      'Authentication token not found',
    );
  }

  const response = await apiFetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const message =
      await extractResponseErrorMessage(
        response,
      );

    throw new Error(
      message ||
        `Failed to fetch user profile (HTTP ${response.status})`,
    );
  }

  const json = await response.json();

  /*
   * Store complete user profile.
   *
   * The language here should be the language
   * stored for THIS user in the database.
   */
  await AsyncStorage.setItem(
    'user',
    JSON.stringify(json),
  );

  return json;
};