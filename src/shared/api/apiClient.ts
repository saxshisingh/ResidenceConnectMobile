import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_BASE_URL} from '../../config/api';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/* ============================================================
 * TYPES
 * ============================================================ */

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

/* ============================================================
 * UNAUTHORIZED ERROR
 * ============================================================ */

export class UnauthorizedError extends Error {
  constructor(
    message = 'UNAUTHORIZED',
  ) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/* ============================================================
 * REFRESH LOCK
 * ============================================================
 *
 * Prevent multiple simultaneous refresh requests.
 *
 * Example:
 *
 * Request A -> 401
 * Request B -> 401
 * Request C -> 401
 *
 * Only ONE refresh request is sent.
 *
 * B and C wait for the same promise.
 * ============================================================ */

let refreshPromise:
  | Promise<RefreshTokenResult>
  | null = null;

/* ============================================================
 * CLEAR LOCAL SESSION
 * ============================================================ */

const clearLocalSession =
  async (): Promise<void> => {
    console.log(
      '[AUTH] Clearing local authentication session...',
    );

    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      REFRESH_TOKEN_KEY,

      'isFirstLogin',
      'authRememberMe',
      'authUsername',
      'Password',

      /* Language cache */
      'selectedLanguageId',
      'appLanguageCode',

      /* Cached user */
      'user',
    ]);

    console.log(
      '[AUTH] Local authentication session cleared.',
    );
  };

/* ============================================================
 * REFRESH ACCESS TOKEN
 * ============================================================ */

const refreshAccessToken =
  async (): Promise<RefreshTokenResult> => {
    console.log(
      '[AUTH] Starting access-token refresh...',
    );

    /* ----------------------------------------------------------
     * Get refresh token
     * ---------------------------------------------------------- */

    const refreshToken =
      await AsyncStorage.getItem(
        REFRESH_TOKEN_KEY,
      );

    console.log(
      '[AUTH] Refresh token available:',
      Boolean(refreshToken),
    );

    if (!refreshToken) {
      console.error(
        '[AUTH] Refresh token not found.',
      );

      await clearLocalSession();

      throw new UnauthorizedError(
        'REFRESH_TOKEN_NOT_FOUND',
      );
    }

    /* ----------------------------------------------------------
     * Refresh request
     * ---------------------------------------------------------- */

    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/auth/refresh`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body: JSON.stringify({
            refreshToken,
          }),
        },
      );
    } catch (error) {
      console.error(
        '[AUTH] Refresh network error:',
        error,
      );

      /*
       * IMPORTANT:
       *
       * Do NOT clear the session just because
       * of a network error.
       *
       * The refresh token may still be valid.
       */

      throw error;
    }

    console.log(
      '[AUTH] Refresh response status:',
      response.status,
    );

    console.log(
      '[AUTH] Refresh response OK:',
      response.ok,
    );

    /* ----------------------------------------------------------
     * Read response body once
     * ---------------------------------------------------------- */

    const responseText =
      await response.text();

    console.log(
      '[AUTH] Refresh response body:',
      {
        hasBody:
          Boolean(responseText),

        bodyLength:
          responseText.length,
      },
    );

    /* ----------------------------------------------------------
     * Refresh token invalid/expired/revoked
     * ---------------------------------------------------------- */

    if (response.status === 401) {
      console.error(
        '[AUTH] Refresh token is invalid, expired, or revoked.',
      );

      await clearLocalSession();

      throw new UnauthorizedError(
        'REFRESH_TOKEN_EXPIRED',
      );
    }

    /* ----------------------------------------------------------
     * Other HTTP errors
     * ---------------------------------------------------------- */

    if (!response.ok) {
      console.error(
        '[AUTH] Refresh request failed:',
        {
          status:
            response.status,
        },
      );

      /*
       * Don't automatically clear the session for
       * temporary server/network errors.
       *
       * A 500, 502, 503 etc. does not prove that
       * the refresh token is invalid.
       */

      throw new UnauthorizedError(
        `TOKEN_REFRESH_FAILED_${response.status}`,
      );
    }

    /* ----------------------------------------------------------
     * Parse JSON
     * ---------------------------------------------------------- */

    let json: any;

    try {
      json =
        JSON.parse(responseText);
    } catch (error) {
      console.error(
        '[AUTH] Invalid JSON from refresh endpoint:',
        error,
      );

      throw new UnauthorizedError(
        'INVALID_REFRESH_RESPONSE',
      );
    }

    console.log(
      '[AUTH] Refresh response structure:',
      {
        status:
          json?.status,

        message:
          json?.message,

        hasData:
          Boolean(json?.data),

        hasDirectAccessToken:
          Boolean(
            json?.accessToken,
          ),

        hasDirectRefreshToken:
          Boolean(
            json?.refreshToken,
          ),

        hasDataAccessToken:
          Boolean(
            json?.data?.accessToken,
          ),

        hasDataRefreshToken:
          Boolean(
            json?.data?.refreshToken,
          ),

        hasDataToken:
          Boolean(
            json?.data?.token,
          ),
      },
    );

    /* ========================================================
     * RESOLVE ACCESS TOKEN
     *
     * Supports:
     *
     * 1.
     * {
     *   accessToken: "...",
     *   refreshToken: "..."
     * }
     *
     * 2.
     * {
     *   data: {
     *     accessToken: "...",
     *     refreshToken: "..."
     *   }
     * }
     *
     * 3. Legacy:
     * {
     *   data: {
     *     token: "...",
     *     refreshToken: "..."
     *   }
     * }
     * ======================================================== */

    const newAccessToken =
      json?.data?.accessToken ??
      json?.data?.token ??
      json?.accessToken ??
      null;

    const newRefreshToken =
      json?.data?.refreshToken ??
      json?.refreshToken ??
      null;

    /* ----------------------------------------------------------
     * Validate refresh response
     * ---------------------------------------------------------- */

    if (!newAccessToken) {
      console.error(
        '[AUTH] Refresh response does not contain access token.',
      );

      throw new UnauthorizedError(
        'INVALID_REFRESH_RESPONSE',
      );
    }

    if (!newRefreshToken) {
      console.error(
        '[AUTH] Refresh response does not contain refresh token.',
      );

      throw new UnauthorizedError(
        'INVALID_REFRESH_RESPONSE',
      );
    }

    /* ----------------------------------------------------------
     * Token information
     *
     * Never log actual token values.
     * ---------------------------------------------------------- */

    console.log(
      '[AUTH] New tokens received:',
      {
        hasAccessToken:
          Boolean(
            newAccessToken,
          ),

        accessTokenLength:
          newAccessToken.length,

        hasRefreshToken:
          Boolean(
            newRefreshToken,
          ),

        refreshTokenLength:
          newRefreshToken.length,
      },
    );

    /* ========================================================
     * STORE NEW TOKENS
     * ======================================================== */

    await AsyncStorage.multiSet([
      [
        AUTH_TOKEN_KEY,
        newAccessToken,
      ],

      [
        REFRESH_TOKEN_KEY,
        newRefreshToken,
      ],
    ]);

    /* ----------------------------------------------------------
     * Verify storage
     * ---------------------------------------------------------- */

    const storedAccessToken =
      await AsyncStorage.getItem(
        AUTH_TOKEN_KEY,
      );

    const storedRefreshToken =
      await AsyncStorage.getItem(
        REFRESH_TOKEN_KEY,
      );

    console.log(
      '[AUTH] Refreshed tokens stored:',
      {
        accessTokenStored:
          Boolean(
            storedAccessToken,
          ),

        refreshTokenStored:
          Boolean(
            storedRefreshToken,
          ),

        accessTokenLength:
          storedAccessToken?.length ??
          0,

        refreshTokenLength:
          storedRefreshToken?.length ??
          0,
      },
    );

    if (
      !storedAccessToken ||
      !storedRefreshToken
    ) {
      throw new UnauthorizedError(
        'REFRESH_TOKEN_STORAGE_FAILED',
      );
    }

    console.log(
      '[AUTH] Access token refreshed successfully.',
    );

    return {
      accessToken:
        newAccessToken,

      refreshToken:
        newRefreshToken,
    };
  };

/* ============================================================
 * API FETCH
 * ============================================================ */

export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  console.log(
    '[API] REQUEST:',
    {
      url,
      method:
        options.method ?? 'GET',
    },
  );

  /* ----------------------------------------------------------
   * Get current access token
   * ---------------------------------------------------------- */

  let token =
    await AsyncStorage.getItem(
      AUTH_TOKEN_KEY,
    );

  console.log(
    '[API] Access token before request:',
    {
      hasToken:
        Boolean(token),

      tokenLength:
        token?.length ?? 0,
    },
  );

  /* ----------------------------------------------------------
   * Build headers
   * ---------------------------------------------------------- */

  const headers: Record<
    string,
    string
  > = {
    'Content-Type':
      'application/json',

    Accept:
      'application/json',
  };

  /* ----------------------------------------------------------
   * Preserve existing headers
   * ---------------------------------------------------------- */

  if (options.headers) {
    Object.assign(
      headers,
      options.headers,
    );
  }

  /* ----------------------------------------------------------
   * Add access token
   * ---------------------------------------------------------- */

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  /* ==========================================================
   * FIRST REQUEST
   * ========================================================== */

  let response: Response;

  try {
    response = await fetch(
      url,
      {
        ...options,
        headers,
      },
    );
  } catch (error) {
    console.error(
      '[API] NETWORK ERROR:',
      {
        url,
        error,
      },
    );

    throw error;
  }

  /* ----------------------------------------------------------
   * Log first response
   * ---------------------------------------------------------- */

  console.log(
    '[API] RESPONSE:',
    {
      url,

      status:
        response.status,

      ok:
        response.ok,
    },
  );

  /* ==========================================================
   * ACCESS TOKEN EXPIRED
   * ========================================================== */

  if (
    response.status === 401 &&
    !url.includes(
      '/api/auth/refresh',
    )
  ) {
    console.warn(
      '[API] Received 401. Attempting token refresh...',
    );

    try {
      /* ------------------------------------------------------
       * Only one refresh request at a time.
       * ------------------------------------------------------ */

      if (!refreshPromise) {
        console.log(
          '[API] Creating refresh promise...',
        );

        refreshPromise =
          refreshAccessToken().finally(
            () => {
              console.log(
                '[API] Refresh promise completed.',
              );

              refreshPromise = null;
            },
          );
      } else {
        console.log(
          '[API] Refresh already in progress. Waiting...',
        );
      }

      /* ------------------------------------------------------
       * Wait for refresh
       * ------------------------------------------------------ */

      const refreshed =
        await refreshPromise;

      token =
        refreshed.accessToken;

      console.log(
        '[API] Using refreshed access token to retry request.',
        {
          hasToken:
            Boolean(token),

          tokenLength:
            token?.length ?? 0,
        },
      );

      /* ======================================================
       * RETRY ORIGINAL REQUEST
       * ====================================================== */

      const retryHeaders: Record<
        string,
        string
      > = {
        'Content-Type':
          'application/json',

        Accept:
          'application/json',
      };

      /* ------------------------------------------------------
       * Preserve original headers
       * ------------------------------------------------------ */

      if (options.headers) {
        Object.assign(
          retryHeaders,
          options.headers,
        );
      }

      /* ------------------------------------------------------
       * IMPORTANT:
       *
       * Replace old access token with new token.
       * ------------------------------------------------------ */

      retryHeaders.Authorization =
        `Bearer ${token}`;

      console.log(
        '[API] Retrying original request:',
        {
          url,

          method:
            options.method ?? 'GET',
        },
      );

      response =
        await fetch(
          url,
          {
            ...options,
            headers:
              retryHeaders,
          },
        );

      /* ------------------------------------------------------
       * Retry response
       * ------------------------------------------------------ */

      console.log(
        '[API] RETRY RESPONSE:',
        {
          url,

          status:
            response.status,

          ok:
            response.ok,
        },
      );

      /* ------------------------------------------------------
       * Refresh succeeded but retry still returns 401.
       *
       * This means the newly issued token is not being
       * accepted by the backend.
       * ------------------------------------------------------ */

      if (
        response.status === 401
      ) {
        console.error(
          '[API] RETRY STILL RETURNED 401.',
        );

        await clearLocalSession();

        throw new UnauthorizedError(
          'AUTHENTICATION_FAILED_AFTER_REFRESH',
        );
      }
    } catch (error) {
      console.error(
        '[API] TOKEN REFRESH FLOW FAILED:',
        error,
      );

      if (
        error instanceof
        UnauthorizedError
      ) {
        throw error;
      }

      throw new UnauthorizedError(
        'UNABLE_TO_REFRESH_SESSION',
      );
    }
  }

  return response;
};