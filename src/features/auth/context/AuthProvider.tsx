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
   * RESOLVE AUTHENTICATED USER ID
   * ============================================================ */

  /**
   * IMPORTANT:
   *
   * userId and residentId are different IDs.
   *
   * userId:
   *   Authenticated application user ID.
   *
   * residentId:
   *   Resident domain/entity ID.
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
   * Register the device for push notifications.
   *
   * IMPORTANT:
   * FCM errors must NEVER prevent authentication.
   *
   * This function is intentionally isolated from the
   * authentication flow so that an FCM/native failure
   * cannot log the user out or break authentication.
   */
  const setupPushNotifications =
    useCallback(
      async (
        userData: any,
      ): Promise<void> => {
        try {
          const userId =
            getUserId(userData);

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
              '[FCM] Unable to resolve user ID for device registration',
            );

            return;
          }

          await registerForPushNotifications(
            userId,
          );

          console.log(
            '[FCM] Device registration completed for user:',
            userId,
          );
        } catch (error) {
          console.warn(
            '[FCM] Device token registration failed:',
            error,
          );

          // IMPORTANT:
          // Never throw FCM errors into the auth flow.
        }
      },
      [getUserId],
    );

  /* ============================================================
   * INITIALIZE AUTH
   * ============================================================ */

  /**
   * Restore previously persisted authentication.
   */
  const initializeAuth =
    useCallback(
      async (): Promise<void> => {
        console.log(
          '[AUTH] initializeAuth START',
        );

        try {
          setStatus('LOADING');

          console.log(
            '[AUTH] calling restoreSession...',
          );

          const session =
            await restoreSession();

          console.log(
            '[AUTH] restoreSession FINISHED:',
            session
              ? 'SESSION FOUND'
              : 'NO SESSION',
          );

          /* ------------------------------------------------------
           * No session
           * ------------------------------------------------------ */

          if (!session) {
            console.log(
              '[AUTH] Setting status -> UNAUTHENTICATED',
            );

            setUser(null);

            dispatch(logout());

            setStatus(
              'UNAUTHENTICATED',
            );

            return;
          }

          /* ------------------------------------------------------
           * Session found
           * ------------------------------------------------------ */

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

          setUser(session.user);

          dispatch(
            restoreAuthSession({
              token: session.token,

              isFirstLogin:
                session.isFirstLogin,

              user: session.user,
            }),
          );

          /* ------------------------------------------------------
           * Register FCM device
           *
           * FCM failure must NEVER fail authentication.
           * ------------------------------------------------------ */

          await setupPushNotifications(
            session.user,
          );

          setStatus(
            'AUTHENTICATED',
          );

          console.log(
            '[AUTH] initializeAuth SUCCESS',
          );
        } catch (error) {
          console.error(
            '[AUTH] INITIALIZATION ERROR:',
            error,
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
        setupPushNotifications,
      ],
    );

  /* ============================================================
   * INITIAL AUTH EFFECT
   * ============================================================ */

  /**
   * Restore authentication once when
   * application starts.
   */
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

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

      console.log(
        '[FCM] Setting up token refresh listener',
      );

      unsubscribe =
        onTokenRefresh(
          messaging,
          async newToken => {
            try {
              console.log(
                '[FCM] Token refreshed',
              );

              if (!newToken) {
                console.warn(
                  '[FCM] Received empty refreshed token',
                );

                return;
              }

              const registered =
                await registerDeviceToken(
                  newToken,
                );

              if (registered) {
                console.log(
                  '[FCM] Refreshed token registered with backend',
                );
              } else {
                console.warn(
                  '[FCM] Refreshed token registration failed',
                );
              }
            } catch (error) {
              console.warn(
                '[FCM] Error registering refreshed token:',
                error,
              );
            }
          },
        );
    } catch (error) {
      console.warn(
        '[FCM] Unable to initialize token refresh listener:',
        error,
      );
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn(
            '[FCM] Error removing token refresh listener:',
            error,
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

      console.log(
        '[FCM] Setting up foreground message listener',
      );

      unsubscribe =
        onMessage(
          messaging,
          async remoteMessage => {
            try {
              console.log(
                '[FCM] Foreground notification received:',
                remoteMessage,
              );

              const notificationId =
                remoteMessage.data
                  ?.notificationId;

              const type =
                remoteMessage.data?.type;

              const title =
                remoteMessage
                  .notification?.title ??
                'Notification';

              const body =
                remoteMessage
                  .notification?.body ??
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
            } catch (error) {
              console.warn(
                '[FCM] Error processing foreground notification:',
                error,
              );
            }
          },
        );
    } catch (error) {
      console.warn(
        '[FCM] Unable to initialize foreground message listener:',
        error,
      );
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn(
            '[FCM] Error removing foreground listener:',
            error,
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
        '[AUTH] Starting login...',
      );

      /* --------------------------------------------------------
       * Login
       *
       * loginUser() returns:
       *
       * {
       *   accessToken,
       *   refreshToken,
       *   isFirstLogin
       * }
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
       * Fetch current user
       * -------------------------------------------------------- */

      console.log(
        '[AUTH] Login completed. Fetching user profile...',
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
       * Resolve user ID
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
       * Store user in React state
       * -------------------------------------------------------- */

      setUser(currentUser);

      /* --------------------------------------------------------
       * Store auth state in Redux
       * -------------------------------------------------------- */

      dispatch(
        restoreAuthSession({
          /**
           * authSlice expects `token`.
           *
           * That value is the access token.
           */
          token:
            loginResponse.accessToken,

          isFirstLogin:
            loginResponse.isFirstLogin,

          user: currentUser,
        }),
      );

      /* --------------------------------------------------------
       * Register device for FCM
       *
       * This must never block authentication.
       * -------------------------------------------------------- */

      await setupPushNotifications(
        currentUser,
      );

      /* --------------------------------------------------------
       * Authentication complete
       * -------------------------------------------------------- */

      setStatus(
        'AUTHENTICATED',
      );

      console.log(
        '[AUTH] LOGIN INITIALIZATION SUCCESS',
      );
    } catch (error) {
      console.error(
        '[AUTH] LOGIN INITIALIZATION ERROR:',
        error,
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

        /**
         * logoutUser():
         *
         * 1. Sends refresh token to backend.
         * 2. Backend revokes refresh token.
         * 3. Local access/refresh tokens are removed.
         */
        await logoutUser();

        console.log(
          '[AUTH] Logout completed',
        );
      } catch (error) {
        console.warn(
          '[AUTH] BACKEND LOGOUT ERROR:',
          error,
        );
      } finally {
        /**
         * Always clear local state.
         */

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
 * ============================================================ */

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