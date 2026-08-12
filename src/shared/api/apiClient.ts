import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_BASE_URL} from '../../config/api';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export class UnauthorizedError extends Error {
  constructor(message = 'UNAUTHORIZED') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/*
 * Prevent multiple API calls from starting multiple
 * refresh requests at the same time.
 *
 * Example:
 *
 * Request A -> 401
 * Request B -> 401
 * Request C -> 401
 *
 * Only ONE refresh request is sent.
 * B and C wait for the same refreshPromise.
 */
let refreshPromise: Promise<string> | null = null;

/* ============================================================
 * CLEAR LOCAL SESSION
 * ============================================================ */

const clearLocalSession = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    AUTH_TOKEN_KEY,
    REFRESH_TOKEN_KEY,

    'isFirstLogin',
    'authRememberMe',
    'authUsername',
    'Password',

    /*
     * Clear only local language cache.
     *
     * The actual language stored in the database
     * is NOT changed.
     */
    'selectedLanguageId',
    'appLanguageCode',

    /*
     * Cached user profile.
     */
    'user',
  ]);
};

/* ============================================================
 * REFRESH ACCESS TOKEN
 * ============================================================ */

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken =
    await AsyncStorage.getItem(
      REFRESH_TOKEN_KEY,
    );

  if (!refreshToken) {
    await clearLocalSession();

    throw new UnauthorizedError(
      'REFRESH_TOKEN_NOT_FOUND',
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/auth/refresh`,
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

  /*
   * IMPORTANT:
   *
   * 401 here means the REFRESH TOKEN itself
   * is invalid/expired/revoked.
   *
   * Only NOW should we clear the session.
   */
  if (response.status === 401) {
    await clearLocalSession();

    throw new UnauthorizedError(
      'REFRESH_TOKEN_EXPIRED',
    );
  }

  if (!response.ok) {
    await clearLocalSession();

    throw new UnauthorizedError(
      `TOKEN_REFRESH_FAILED_${response.status}`,
    );
  }

  let json: any;

  try {
    json = await response.json();
  } catch {
    await clearLocalSession();

    throw new UnauthorizedError(
      'INVALID_REFRESH_RESPONSE',
    );
  }

  /*
   * Expected backend response:
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

  const newAccessToken =
    json?.data?.token;

  const newRefreshToken =
    json?.data?.refreshToken;

  if (
    !json?.status ||
    !newAccessToken ||
    !newRefreshToken
  ) {
    await clearLocalSession();

    throw new UnauthorizedError(
      'INVALID_REFRESH_RESPONSE',
    );
  }

  /*
   * IMPORTANT:
   *
   * Your backend rotates the refresh token.
   *
   * Therefore BOTH values must be replaced.
   */

  await AsyncStorage.setItem(
    AUTH_TOKEN_KEY,
    newAccessToken,
  );

  await AsyncStorage.setItem(
    REFRESH_TOKEN_KEY,
    newRefreshToken,
  );

  return newAccessToken;
};

/* ============================================================
 * API FETCH
 * ============================================================ */

export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  /*
   * Get current access token.
   */
  let token =
    await AsyncStorage.getItem(
      AUTH_TOKEN_KEY,
    );

  /*
   * Build headers.
   */
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  /*
   * Preserve existing headers.
   */
  if (options.headers) {
    Object.assign(
      headers,
      options.headers,
    );
  }

  /*
   * Add current access token.
   */
  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  /*
   * ==========================================================
   * FIRST REQUEST
   * ==========================================================
   */

  let response = await fetch(
    url,
    {
      ...options,
      headers,
    },
  );

  /*
   * ==========================================================
   * ACCESS TOKEN EXPIRED
   * ==========================================================
   *
   * DO NOT LOG OUT HERE.
   *
   * Try the refresh token first.
   */

  if (
    response.status === 401 &&
    !url.includes('/api/auth/refresh')
  ) {
    try {
      /*
       * If another request is already refreshing,
       * wait for that request.
       *
       * Otherwise start a new refresh.
       */

      if (!refreshPromise) {
        refreshPromise =
          refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
      }

      /*
       * Wait for refresh.
       */
      token =
        await refreshPromise;

      /*
       * ======================================================
       * RETRY ORIGINAL REQUEST
       * ======================================================
       */

      const retryHeaders: Record<
        string,
        string
      > = {
        'Content-Type':
          'application/json',
      };

      if (options.headers) {
        Object.assign(
          retryHeaders,
          options.headers,
        );
      }

      retryHeaders.Authorization =
        `Bearer ${token}`;

      response = await fetch(
        url,
        {
          ...options,
          headers: retryHeaders,
        },
      );
    } catch (error) {
      /*
       * refreshAccessToken() already clears
       * local session if refresh fails.
       */

      if (
        error instanceof UnauthorizedError
      ) {
        throw error;
      }

      throw new UnauthorizedError();
    }
  }

  return response;
};