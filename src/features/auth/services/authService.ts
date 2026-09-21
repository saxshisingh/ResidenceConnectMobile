import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiFetch} from '../../../shared/api/apiClient';
import {API_BASE_URL} from '../../../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

/* ============================================================
 * TYPES
 * ============================================================ */

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  isFirstLogin: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordResponse {
  message?: string;
}

/**
 * Standard backend API response wrapper.
 */
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * Backend login response.
 *
 * Expected:
 *
 * {
 *   status: true,
 *   message: "Login successful",
 *   data: {
 *     accessToken: "...",
 *     refreshToken: "...",
 *     isFirstLogin: false
 *   }
 * }
 */
interface LoginApiResponse {
  status?: boolean;
  message?: string;

  data?: {
    accessToken?: string;
    refreshToken?: string | null;
    isFirstLogin?: boolean;
  };

  /**
   * Kept for compatibility in case
   * the backend returns the object directly.
   */
  accessToken?: string;
  refreshToken?: string | null;
  isFirstLogin?: boolean;
}

/**
 * Backend refresh response.
 *
 * {
 *   status: true,
 *   message: "Token refreshed successfully.",
 *   data: {
 *     accessToken: "...",
 *     refreshToken: "..."
 *   }
 * }
 */
interface RefreshApiResponse {
  status?: boolean;
  message?: string;

  data?: {
    accessToken?: string;
    refreshToken?: string;
  };

  /**
   * Direct-response fallback.
   */
  accessToken?: string;
  refreshToken?: string;
}

export interface RestoredSession {
  /**
   * Kept as `token` so existing AuthProvider
   * code does not need to change immediately.
   */
  token: string;

  refreshToken: string;

  isFirstLogin: boolean;

  user: any;
}

/* ============================================================
 * STORAGE KEYS
 * ============================================================ */

export const AUTH_STORAGE_KEYS = {
  token: 'authToken',
  refreshToken: 'refreshToken',
  isFirstLogin: 'isFirstLogin',
  rememberMe: 'authRememberMe',
  username: 'authUsername',
  password: 'authPassword',
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

    /**
     * Handle common backend validation format:
     *
     * {
     *   errors: {
     *     Username: ["..."],
     *     Password: ["..."]
     *   }
     * }
     */
    if (
      parsed?.errors &&
      typeof parsed.errors === 'object'
    ) {
      const firstErrorGroup =
        Object.values(parsed.errors)[0];

      if (
        Array.isArray(firstErrorGroup) &&
        typeof firstErrorGroup[0] === 'string'
      ) {
        return firstErrorGroup[0];
      }
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
    console.log(
      '[AUTH] LOGIN URL:',
      `${API_URL}/login`,
    );

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
      console.log(
        '[AUTH] Trying login payload:',
        Object.keys(payload),
      );

      response = await fetch(
        `${API_URL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      console.log(
        '[AUTH] Login response status:',
        response.status,
      );

      if (response.ok) {
        break;
      }

      lastErrorText =
        await extractResponseErrorMessage(
          response,
        );

      console.log(
        '[AUTH] Login error response:',
        lastErrorText,
      );

      /**
       * Only retry another payload
       * for HTTP 400.
       */
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
          lastErrorText ||
            'INVALID_CREDENTIALS',
        );
      }

      if (
        /invalid credentials|invalid password|wrong password|incorrect password|unauthorized/i.test(
          lastErrorText,
        )
      ) {
        throw new Error(
          /invalid credentials/i.test(
            lastErrorText,
          )
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

    /* ----------------------------------------------------------
     * Read backend response
     * ---------------------------------------------------------- */

    const rawLoginResponse =
      (await response.json()) as LoginApiResponse;

    /**
     * Do NOT log actual tokens.
     */
    console.log(
      '[AUTH] Login response received:',
      {
        status: rawLoginResponse.status,
        message: rawLoginResponse.message,

        hasDirectAccessToken: Boolean(
          rawLoginResponse.accessToken,
        ),

        hasDirectRefreshToken: Boolean(
          rawLoginResponse.refreshToken,
        ),

        hasData: Boolean(
          rawLoginResponse.data,
        ),

        hasDataAccessToken: Boolean(
          rawLoginResponse.data?.accessToken,
        ),

        hasDataRefreshToken: Boolean(
          rawLoginResponse.data?.refreshToken,
        ),

        isFirstLogin:
          rawLoginResponse.data
            ?.isFirstLogin ??
          rawLoginResponse.isFirstLogin,
      },
    );

    /* ----------------------------------------------------------
     * Resolve access token
     * ---------------------------------------------------------- */

    const accessToken =
      rawLoginResponse.data
        ?.accessToken ??
      rawLoginResponse.accessToken;

    /* ----------------------------------------------------------
     * Resolve refresh token
     * ---------------------------------------------------------- */

    const refreshToken =
      rawLoginResponse.data
        ?.refreshToken ??
      rawLoginResponse.refreshToken ??
      null;

    /* ----------------------------------------------------------
     * Resolve first-login flag
     * ---------------------------------------------------------- */

    const isFirstLogin =
      rawLoginResponse.data
        ?.isFirstLogin ??
      rawLoginResponse.isFirstLogin ??
      false;

    /* ----------------------------------------------------------
     * Validate access token
     * ---------------------------------------------------------- */

    if (!accessToken) {
      throw new Error(
        'Login succeeded but access token was not returned by the server',
      );
    }

    /* ----------------------------------------------------------
     * Refresh token is mandatory for the new auth flow
     * ---------------------------------------------------------- */

    if (!refreshToken) {
      throw new Error(
        'Login succeeded but refresh token was not returned by the server',
      );
    }

    /* ----------------------------------------------------------
     * Store authentication data
     * ---------------------------------------------------------- */

    const storageEntries: [
      string,
      string,
    ][] = [
      [
        AUTH_STORAGE_KEYS.token,
        accessToken,
      ],
      [
        AUTH_STORAGE_KEYS.refreshToken,
        refreshToken,
      ],
      [
        AUTH_STORAGE_KEYS.isFirstLogin,
        JSON.stringify(isFirstLogin),
      ],
      [
        AUTH_STORAGE_KEYS.rememberMe,
        JSON.stringify(rememberMe),
      ],
    ];

    await AsyncStorage.multiSet(
      storageEntries,
    );

    console.log(
      '[AUTH] LOGIN SUCCESS',
    );

    console.log(
      '[AUTH] Access token stored:',
      Boolean(accessToken),
    );

    console.log(
      '[AUTH] Refresh token stored:',
      Boolean(refreshToken),
    );

    return {
      accessToken,
      refreshToken,
      isFirstLogin,
    };
  } catch (error: any) {
    console.error(
      '[AUTH] LOGIN ERROR:',
      error,
    );

    throw new Error(
      error?.message ||
        'Network error',
    );
  }
};

/* ============================================================
 * RESTORE SESSION
 * ============================================================ */

export const restoreSession =
  async (): Promise<
    RestoredSession | null
  > => {
    try {
      const values =
        await AsyncStorage.multiGet([
          AUTH_STORAGE_KEYS.token,
          AUTH_STORAGE_KEYS.refreshToken,
          AUTH_STORAGE_KEYS.isFirstLogin,
          AUTH_STORAGE_KEYS.rememberMe,
        ]);

      const storage =
        Object.fromEntries(values);

      let token =
        storage[
          AUTH_STORAGE_KEYS.token
        ] ?? null;

      let refreshToken =
        storage[
          AUTH_STORAGE_KEYS.refreshToken
        ] ?? null;

      const rememberMe =
        storage[
          AUTH_STORAGE_KEYS.rememberMe
        ] === 'true';

      /* --------------------------------------------------------
       * Only restore persistent sessions when
       * Remember Me was selected.
       * -------------------------------------------------------- */

      if (!rememberMe) {
        console.log(
          '[AUTH] Remember Me is disabled. No session restored.',
        );

        return null;
      }

      /* --------------------------------------------------------
       * Refresh token is required
       * -------------------------------------------------------- */

      if (!refreshToken) {
        console.log(
          '[AUTH] No refresh token available for session restore',
        );

        return null;
      }

      /* --------------------------------------------------------
       * No access token -> refresh
       * -------------------------------------------------------- */

      if (!token) {
        console.log(
          '[AUTH] No access token. Attempting refresh...',
        );

        const refreshed =
          await refreshAccessToken();

        token =
          refreshed.accessToken;

        refreshToken =
          refreshed.refreshToken;
      }

      /* --------------------------------------------------------
       * Fetch current authenticated user
       * -------------------------------------------------------- */

      let user;

      try {
        user =
          await fetchUserProfile();
      } catch (error) {
        console.log(
          '[AUTH] Session validation failed. Attempting token refresh...',
        );

        const refreshed =
          await refreshAccessToken();

        token =
          refreshed.accessToken;

        refreshToken =
          refreshed.refreshToken;

        user =
          await fetchUserProfile();
      }

      /* --------------------------------------------------------
       * Read latest tokens
       * -------------------------------------------------------- */

      const latestToken =
        await getAuthToken();

      const latestRefreshToken =
        await getRefreshToken();

      if (
        !latestToken ||
        !latestRefreshToken
      ) {
        throw new Error(
          'Session restoration failed',
        );
      }

      return {
        token: latestToken,

        refreshToken:
          latestRefreshToken,

        isFirstLogin:
          storage[
            AUTH_STORAGE_KEYS
              .isFirstLogin
          ] === 'true',

        user,
      };
    } catch (error) {
      console.warn(
        '[AUTH] SESSION RESTORE FAILED:',
        error,
      );

      await clearAuthSession();

      return null;
    }
  };

/* ============================================================
 * CLEAR AUTH SESSION
 * ============================================================ */

export const clearAuthSession =
  async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      AUTH_STORAGE_KEYS.token,
      AUTH_STORAGE_KEYS.refreshToken,
      AUTH_STORAGE_KEYS.isFirstLogin,
      AUTH_STORAGE_KEYS.rememberMe,
      AUTH_STORAGE_KEYS.username,
      AUTH_STORAGE_KEYS.password,
      'user',
    ]);
  };

/* ============================================================
 * REFRESH TOKEN
 * ============================================================ */

export const refreshAccessToken =
  async (): Promise<RefreshTokenResponse> => {
    try {
      const refreshToken =
        await AsyncStorage.getItem(
          AUTH_STORAGE_KEYS.refreshToken,
        );

      if (!refreshToken) {
        throw new Error(
          'Refresh token not found',
        );
      }

      console.log(
        '[AUTH] Refreshing access token...',
      );

      const response =
        await fetch(
          `${API_URL}/refresh`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              refreshToken,
            }),
          },
        );

      console.log(
        '[AUTH] Refresh response status:',
        response.status,
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

      const json =
        (await response.json()) as RefreshApiResponse;

      console.log(
        '[AUTH] Refresh response received:',
        {
          status: json.status,
          message: json.message,
          hasData: Boolean(json.data),
          hasAccessToken: Boolean(
            json.data?.accessToken ??
              json.accessToken,
          ),
          hasRefreshToken: Boolean(
            json.data?.refreshToken ??
              json.refreshToken,
          ),
        },
      );

      /* --------------------------------------------------------
       * Resolve access token
       * -------------------------------------------------------- */

      const newAccessToken =
        json.data?.accessToken ??
        json.accessToken;

      /* --------------------------------------------------------
       * Resolve rotated refresh token
       * -------------------------------------------------------- */

      const newRefreshToken =
        json.data?.refreshToken ??
        json.refreshToken;

      if (!newAccessToken) {
        throw new Error(
          json.message ||
            'Access token was not returned by refresh endpoint',
        );
      }

      if (!newRefreshToken) {
        throw new Error(
          json.message ||
            'Refresh token was not returned by refresh endpoint',
        );
      }

      /* --------------------------------------------------------
       * Save BOTH tokens
       * -------------------------------------------------------- */

      await AsyncStorage.multiSet([
        [
          AUTH_STORAGE_KEYS.token,
          newAccessToken,
        ],
        [
          AUTH_STORAGE_KEYS.refreshToken,
          newRefreshToken,
        ],
      ]);

      console.log(
        '[AUTH] Access token refreshed successfully',
      );

      console.log(
        '[AUTH] Refresh token rotated successfully',
      );

      return {
        accessToken:
          newAccessToken,

        refreshToken:
          newRefreshToken,
      };
    } catch (error: any) {
      console.error(
        '[AUTH] REFRESH TOKEN ERROR:',
        error,
      );

      throw new Error(
        error?.message ||
          'Token refresh failed',
      );
    }
  };

/* ============================================================
 * FORGOT PASSWORD
 * ============================================================ */

export const forgotPassword =
  async (
    email: string,
  ): Promise<
    ForgotPasswordResponse | null
  > => {
    try {
      const payloads:
        Array<Record<string, string>> = [
        {
          Email: email,
        },
        {
          email,
        },
      ];

      let response: Response | null =
        null;

      let lastErrorText = '';

      for (const payload of payloads) {
        response = await fetch(
          `${API_URL}/forgot-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        console.log(
          '[AUTH] Forgot password response:',
          response.status,
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

      if (
        !response ||
        !response.ok
      ) {
        const statusCode =
          response?.status
            ? ` (HTTP ${response.status})`
            : '';

        throw new Error(
          lastErrorText ||
            `Forgot password failed${statusCode}`,
        );
      }

      const text =
        await response.text();

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
        '[AUTH] FORGOT PASSWORD ERROR:',
        error,
      );

      throw new Error(
        error?.message ||
          'Network error',
      );
    }
  };

/* ============================================================
 * SET PASSWORD
 * ============================================================ */

export const setPassword =
  async (
    newPassword: string,
    confirmPassword: string,
    token: string,
  ) => {
    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/set-password`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
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

      const statusCode =
        response.status
          ? ` (HTTP ${response.status})`
          : '';

      throw new Error(
        message ||
          `Failed to update password${statusCode}`,
      );
    }

    const text =
      await response.text();

    try {
      return text
        ? JSON.parse(text)
        : null;
    } catch {
      return text;
    }
  };

/* ============================================================
 * GET AUTH TOKEN
 * ============================================================ */

export const getAuthToken =
  async (): Promise<
    string | null
  > => {
    return AsyncStorage.getItem(
      AUTH_STORAGE_KEYS.token,
    );
  };

/* ============================================================
 * GET REFRESH TOKEN
 * ============================================================ */

export const getRefreshToken =
  async (): Promise<
    string | null
  > => {
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
 * ============================================================ */

export const logout =
  async (): Promise<void> => {
    /**
     * The new backend logout endpoint
     * revokes the refresh token.
     *
     * Access token is not enough for logout.
     */
    const refreshToken =
      await getRefreshToken();

    try {
      if (refreshToken) {
        const response =
          await fetch(
            `${API_URL}/logout`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                refreshToken,
              }),
            },
          );

        console.log(
          '[AUTH] Logout response status:',
          response.status,
        );

        if (!response.ok) {
          const message =
            await extractResponseErrorMessage(
              response,
            );

          console.warn(
            '[AUTH] Logout API failed:',
            message ||
              `HTTP ${response.status}`,
          );
        }
      }
    } catch (error) {
      console.warn(
        '[AUTH] LOGOUT API ERROR:',
        error,
      );
    } finally {
      /**
       * Always clear local authentication state,
       * even if the backend request fails.
       */
      await clearAuthSession();

      await AsyncStorage.multiRemove([
        'selectedLanguageId',
        'appLanguageCode',
      ]);
    }
  };

/* ============================================================
 * FETCH CURRENT USER PROFILE
 * ============================================================ */

export const fetchUserProfile =
  async () => {
    const token =
      await AsyncStorage.getItem(
        AUTH_STORAGE_KEYS.token,
      );

    if (!token) {
      throw new Error(
        'Authentication token not found',
      );
    }

    const response =
      await apiFetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method: 'GET',

          headers: {
            'Content-Type':
              'application/json',
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

    const json =
      await response.json();

    console.log(
      '[AUTH] User profile response received:',
      {
        status: json?.status,
        message: json?.message,
        hasData: Boolean(json?.data),
        userId:
          json?.data?.userId ??
          json?.userId ??
          null,
        residentId:
          json?.data?.residentId ??
          json?.residentId ??
          null,
      },
    );

    /**
     * Your backend profile response is:
     *
     * {
     *   status: true,
     *   message: "...",
     *   data: {
     *     userId: "...",
     *     residentId: "...",
     *     ...
     *   }
     * }
     *
     * Return only `data` so AuthProvider receives
     * the actual user object.
     */
    const userData =
      json?.data ?? json;

    await AsyncStorage.setItem(
      'user',
      JSON.stringify(userData),
    );

    return userData;
  };