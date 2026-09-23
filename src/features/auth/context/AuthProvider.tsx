import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
  type ReactNode,
} from 'react';

import {useDispatch} from 'react-redux';

import {
  restoreSession,
  loginUser,
  logout as logoutUser,
  fetchUserProfile,
} from '../services/authService';

import {
  restoreAuthSession,
  logout,
} from '../state/authSlice';

import type {AppDispatch} from '../../../redux/store';

import {
  registerDeviceToken,
  registerForPushNotifications,
} from '../../../services/notificationService';

import {
  getMessaging,
  onMessage,
  onTokenRefresh,
} from '@react-native-firebase/messaging';

import {Platform} from 'react-native';

/* ==============================================================
 * TYPES
 * ============================================================== */

type AuthStatus =
  | 'LOADING'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED';

interface AuthContextType {
  status: AuthStatus;
  user: any;

  login: (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;

  signOut: () => Promise<void>;

  initializeAuth: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/* ==============================================================
 * AUTH PROVIDER
 * ============================================================== */

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const dispatch =
    useDispatch<AppDispatch>();

  const [status, setStatus] =
    useState<AuthStatus>('LOADING');

  const [user, setUser] =
    useState<any>(null);

  /* ============================================================
   * RESOLVE USER ID
   * ============================================================ */

  /**
   * IMPORTANT:
   *
   * userId and residentId are different IDs.
   *
   * FCM/device registration must use userId.
   */
  const getUserId = useCallback(
    (userData: any): string | null => {
      if (!userData) {
        return null;
      }

      const userId =
        userData.userId ??
        userData.id ??
        null;

      if (!userId) {
        return null;
      }

      return String(userId);
    },
    [],
  );

  /* ============================================================
   * SETUP PUSH NOTIFICATIONS
   * ============================================================ */

  /**
   * Registers the current authenticated user's device
   * with Firebase and then with the backend.
   *
   * IMPORTANT:
   * - This function does NOT control authentication.
   * - Any FCM error is swallowed.
   * - Authentication must already be AUTHENTICATED before
   *   this function is called.
   */
  const setupPushNotifications = useCallback(
    async (
      userData: any,
    ): Promise<void> => {
      try {
        const userId =
          getUserId(userData);

        console.log(
          '[FCM] ========================================',
        );

        console.log(
          '[FCM] Starting device registration',
        );

        console.log(
          '[FCM] Platform:',
          Platform.OS,
        );

        console.log(
          '[FCM] User profile:',
          JSON.stringify(
            {
              userId:
                userData?.userId ??
                userData?.id ??
                null,

              residentId:
                userData?.residentId ??
                null,

              roleName:
                userData?.roleName ??
                null,
            },
            null,
            2,
          ),
        );

        console.log(
          '[FCM] Resolved user ID:',
          userId,
        );

        if (!userId) {
          console.warn(
            '[FCM] Unable to resolve user ID',
          );

          return;
        }

        console.log(
          '[FCM] Calling registerForPushNotifications...',
        );

        const token =
          await registerForPushNotifications(
            userId,
          );

        if (!token) {
          console.warn(
            '[FCM] No FCM token returned',
          );

          console.warn(
            '[FCM] Platform:',
            Platform.OS,
          );

          return;
        }

        console.log(
          '[FCM] ========================================',
        );

        console.log(
          '[FCM] Push registration completed successfully',
        );

        console.log(
          '[FCM] Platform:',
          Platform.OS,
        );

        console.log(
          '[FCM] FCM token received:',
          `${token.substring(0, 12)}...`,
        );

        console.log(
          '[FCM] FCM token length:',
          token.length,
        );

        console.log(
          '[FCM] User:',
          userId,
        );

        console.log(
          '[FCM] ========================================',
        );
      } catch (error: any) {
        console.warn(
          '[FCM] Device token registration failed:',
          error?.message ?? error,
        );

        console.warn(
          '[FCM] Error code:',
          error?.code,
        );

        /**
         * IMPORTANT:
         *
         * Never allow FCM failure to log the user out
         * or break authentication.
         */
      }
    },
    [getUserId],
  );

  /* ============================================================
   * INITIALIZE AUTH
   * ============================================================ */

  /**
   * Restores the previously persisted authentication session.
   *
   * FCM registration is intentionally NOT performed here.
   *
   * Authentication is completed first and the FCM registration
   * happens from the AUTHENTICATED useEffect below.
   */
  const initializeAuth = useCallback(
    async (): Promise<void> => {
      console.log(
        '[AUTH] ========================================',
      );

      console.log(
        '[AUTH] initializeAuth START',
      );

      try {
        setStatus('LOADING');

        console.log(
          '[AUTH] Calling restoreSession...',
        );

        const session =
          await restoreSession();

        console.log(
          '[AUTH] restoreSession FINISHED:',
          session
            ? 'SESSION FOUND'
            : 'NO SESSION',
        );

        /* --------------------------------------------------------
         * NO SESSION
         * -------------------------------------------------------- */

        if (!session) {
          console.log(
            '[AUTH] No saved session',
          );

          setUser(null);

          dispatch(logout());

          setStatus(
            'UNAUTHENTICATED',
          );

          console.log(
            '[AUTH] Status -> UNAUTHENTICATED',
          );

          return;
        }

        /* --------------------------------------------------------
         * SESSION FOUND
         * -------------------------------------------------------- */

        console.log(
          '[AUTH] Restored user:',
          JSON.stringify(
            session.user,
            null,
            2,
          ),
        );

        const restoredUserId =
          getUserId(session.user);

        console.log(
          '[AUTH] Restored user ID:',
          restoredUserId,
        );

        /* --------------------------------------------------------
         * RESTORE USER IN REACT STATE
         * -------------------------------------------------------- */

        setUser(session.user);

        /* --------------------------------------------------------
         * RESTORE AUTH STATE IN REDUX
         * -------------------------------------------------------- */

        dispatch(
          restoreAuthSession({
            token: session.token,

            isFirstLogin:
              session.isFirstLogin,

            user: session.user,
          }),
        );

        /**
         * IMPORTANT:
         *
         * DO NOT call setupPushNotifications() here.
         *
         * Authentication must become AUTHENTICATED first.
         */

        setStatus(
          'AUTHENTICATED',
        );

        console.log(
          '[AUTH] Status -> AUTHENTICATED',
        );

        console.log(
          '[AUTH] initializeAuth SUCCESS',
        );

        console.log(
          '[AUTH] ========================================',
        );
      } catch (error: any) {
        console.error(
          '[AUTH] INITIALIZATION ERROR:',
          error?.message ?? error,
        );

        setUser(null);

        dispatch(logout());

        setStatus(
          'UNAUTHENTICATED',
        );
      }
    },
    [
      dispatch,
      getUserId,
    ],
  );

  /* ============================================================
   * INITIAL AUTH EFFECT
   * ============================================================ */

  useEffect(() => {
    console.log(
      '[AUTH] Running initial authentication effect',
    );

    void initializeAuth();
  }, [initializeAuth]);

  /* ============================================================
   * REGISTER FCM AFTER AUTHENTICATION
   * ============================================================ */

  /**
   * IMPORTANT:
   *
   * This is the ONLY place where the initial FCM registration
   * is triggered.
   *
   * Flow:
   *
   * AUTH LOGIN / RESTORE
   *       ↓
   * Redux auth token restored
   *       ↓
   * status = AUTHENTICATED
   *       ↓
   * this effect runs
   *       ↓
   * registerForPushNotifications()
   *       ↓
   * APNs token
   *       ↓
   * FCM token
   *       ↓
   * backend /device-token
   */
  useEffect(() => {
    if (status !== 'AUTHENTICATED') {
      return;
    }

    if (!user) {
      console.warn(
        '[FCM] Authenticated but user is null',
      );

      return;
    }

    console.log(
      '[FCM] ========================================',
    );

    console.log(
      '[FCM] Authentication complete',
    );

    console.log(
      '[FCM] Starting push registration effect',
    );

    console.log(
      '[FCM] Platform:',
      Platform.OS,
    );

    console.log(
      '[FCM] User ID:',
      getUserId(user),
    );

    console.log(
      '[FCM] ========================================',
    );

    void setupPushNotifications(user);
  }, [
    status,
    user,
    setupPushNotifications,
    getUserId,
  ]);

  /* ============================================================
   * FCM TOKEN REFRESH LISTENER
   * ============================================================ */

  useEffect(() => {
    if (status !== 'AUTHENTICATED') {
      return;
    }

    let unsubscribe:
      | (() => void)
      | undefined;

    try {
      console.log(
        '[FCM] Initializing token refresh listener...',
      );

      const messaging =
        getMessaging();

      unsubscribe =
        onTokenRefresh(
          messaging,
          async newToken => {
            try {
              console.log(
                '[FCM] ========================================',
              );

              console.log(
                '[FCM] Token refreshed',
              );

              console.log(
                '[FCM] Platform:',
                Platform.OS,
              );

              if (!newToken) {
                console.warn(
                  '[FCM] Received empty refreshed token',
                );

                return;
              }

              console.log(
                '[FCM] New token length:',
                newToken.length,
              );

              console.log(
                '[FCM] Registering refreshed token with backend...',
              );

              const registered =
                await registerDeviceToken(
                  newToken,
                );

              if (registered) {
                console.log(
                  '[FCM] Refreshed token registered successfully',
                );
              } else {
                console.warn(
                  '[FCM] Refreshed token registration failed',
                );
              }

              console.log(
                '[FCM] ========================================',
              );
            } catch (error: any) {
              console.warn(
                '[FCM] Error registering refreshed token:',
                error?.message ?? error,
              );
            }
          },
        );

      console.log(
        '[FCM] Token refresh listener registered',
      );
    } catch (error: any) {
      console.warn(
        '[FCM] Unable to initialize token refresh listener:',
        error?.message ?? error,
      );
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();

          console.log(
            '[FCM] Token refresh listener removed',
          );
        } catch (error: any) {
          console.warn(
            '[FCM] Error removing token refresh listener:',
            error?.message ?? error,
          );
        }
      }
    };
  }, [status]);

  /* ============================================================
   * FOREGROUND FCM MESSAGE LISTENER
   * ============================================================ */

  useEffect(() => {
    if (status !== 'AUTHENTICATED') {
      return;
    }

    let unsubscribe:
      | (() => void)
      | undefined;

    try {
      console.log(
        '[FCM] Initializing foreground message listener...',
      );

      const messaging =
        getMessaging();

      unsubscribe =
        onMessage(
          messaging,
          async remoteMessage => {
            try {
              console.log(
                '[FCM] ========================================',
              );

              console.log(
                '[FCM] Foreground notification received',
              );

              const notificationId =
                remoteMessage.data
                  ?.notificationId;

              const type =
                remoteMessage.data?.type;

              const title =
                remoteMessage.notification
                  ?.title ??
                'Notification';

              const body =
                remoteMessage.notification
                  ?.body ??
                '';

              console.log(
                '[FCM] Title:',
                title,
              );

              console.log(
                '[FCM] Body:',
                body,
              );

              console.log(
                '[FCM] Notification ID:',
                notificationId,
              );

              console.log(
                '[FCM] Type:',
                type,
              );

              console.log(
                '[FCM] ========================================',
              );
            } catch (error: any) {
              console.warn(
                '[FCM] Error processing foreground notification:',
                error?.message ?? error,
              );
            }
          },
        );

      console.log(
        '[FCM] Foreground message listener registered',
      );
    } catch (error: any) {
      console.warn(
        '[FCM] Unable to initialize foreground message listener:',
        error?.message ?? error,
      );
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();

          console.log(
            '[FCM] Foreground message listener removed',
          );
        } catch (error: any) {
          console.warn(
            '[FCM] Error removing foreground listener:',
            error?.message ?? error,
          );
        }
      }
    };
  }, [status]);

  /* ============================================================
   * LOGIN
   * ============================================================ */

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean,
  ): Promise<void> => {
    try {
      setStatus('LOADING');

      console.log(
        '[AUTH] ========================================',
      );

      console.log(
        '[AUTH] Starting login...',
      );

      /* --------------------------------------------------------
       * LOGIN
       * -------------------------------------------------------- */

      const loginResponse =
        await loginUser(
          username,
          password,
          rememberMe,
        );

      console.log(
        '[AUTH] Login successful',
      );

      console.log(
        '[AUTH] Access token received:',
        Boolean(
          loginResponse.accessToken,
        ),
      );

      console.log(
        '[AUTH] Refresh token received:',
        Boolean(
          loginResponse.refreshToken,
        ),
      );

      console.log(
        '[AUTH] Is first login:',
        loginResponse.isFirstLogin,
      );

      /* --------------------------------------------------------
       * FETCH CURRENT USER
       * -------------------------------------------------------- */

      console.log(
        '[AUTH] Fetching user profile...',
      );

      const currentUser =
        await fetchUserProfile();

      console.log(
        '[AUTH] Current user:',
        JSON.stringify(
          currentUser,
          null,
          2,
        ),
      );

      /* --------------------------------------------------------
       * RESOLVE USER ID
       * -------------------------------------------------------- */

      const userId =
        getUserId(currentUser);

      console.log(
        '[AUTH] Resolved user ID:',
        userId,
      );

      if (!userId) {
        console.warn(
          '[AUTH] User profile does not contain userId',
        );
      }

      /* --------------------------------------------------------
       * STORE USER
       * -------------------------------------------------------- */

      setUser(currentUser);

      /* --------------------------------------------------------
       * STORE AUTH STATE IN REDUX
       * -------------------------------------------------------- */

      dispatch(
        restoreAuthSession({
          token:
            loginResponse.accessToken,

          isFirstLogin:
            loginResponse.isFirstLogin,

          user: currentUser,
        }),
      );

      /**
       * IMPORTANT:
       *
       * Do NOT call setupPushNotifications() here.
       *
       * Once status becomes AUTHENTICATED, the dedicated
       * FCM effect above will execute.
       */

      setStatus(
        'AUTHENTICATED',
      );

      console.log(
        '[AUTH] Status -> AUTHENTICATED',
      );

      console.log(
        '[AUTH] Login completed successfully',
      );

      console.log(
        '[AUTH] ========================================',
      );
    } catch (error: any) {
      console.error(
        '[AUTH] LOGIN INITIALIZATION ERROR:',
        error?.message ?? error,
      );

      setUser(null);

      dispatch(logout());

      setStatus(
        'UNAUTHENTICATED',
      );

      throw error;
    }
  };

  /* ============================================================
   * LOGOUT
   * ============================================================ */

  const signOut =
    async (): Promise<void> => {
      try {
        console.log(
          '[AUTH] Signing out...',
        );

        await logoutUser();

        console.log(
          '[AUTH] Logout completed',
        );
      } catch (error: any) {
        console.warn(
          '[AUTH] BACKEND LOGOUT ERROR:',
          error?.message ?? error,
        );
      } finally {
        setUser(null);

        dispatch(logout());

        setStatus(
          'UNAUTHENTICATED',
        );

        console.log(
          '[AUTH] User is now unauthenticated',
        );
      }
    };

  /* ============================================================
   * PROVIDER
   * ============================================================ */

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        login,
        signOut,
        initializeAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ==============================================================
 * USE AUTH
 * ============================================================== */

export const useAuth =
  (): AuthContextType => {
    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        'useAuth must be used inside AuthProvider',
      );
    }

    return context;
  };