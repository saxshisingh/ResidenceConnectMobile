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
  createContext<AuthContextType | null>(
    null,
  );

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

  /*
   * Restore a previously persisted
   * authentication session.
   */
  const initializeAuth =
    useCallback(async (): Promise<void> => {
        console.log('[AUTH] initializeAuth START');

        try {
        setStatus('LOADING');

        console.log('[AUTH] calling restoreSession...');

        const session =
            await restoreSession();

        console.log(
            '[AUTH] restoreSession FINISHED:',
            session ? 'SESSION FOUND' : 'NO SESSION',
        );

        if (!session) {
            console.log(
            '[AUTH] Setting status -> UNAUTHENTICATED',
            );

            setUser(null);
            dispatch(logout());
            setStatus('UNAUTHENTICATED');

            return;
        }

        console.log(
            '[AUTH] Setting status -> AUTHENTICATED',
        );

        setUser(session.user);

        dispatch(
            restoreAuthSession({
            token: session.token,
            isFirstLogin: session.isFirstLogin,
            user: session.user,
            }),
        );

        setStatus('AUTHENTICATED');
        } catch (error) {
        console.error(
            '[AUTH] INITIALIZATION ERROR:',
            error,
        );

        setUser(null);
        dispatch(logout());
        setStatus('UNAUTHENTICATED');
        }
    }, [dispatch]);

  /*
   * Restore authentication once when
   * the application starts.
   */
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  /*
   * Login flow.
   *
   * IMPORTANT:
   * Do not call restoreSession() here.
   *
   * restoreSession() is specifically
   * for restoring persistent sessions
   * after an application restart.
   *
   * A user who selects rememberMe=false
   * must still be able to log in.
   */
  const login =
    async (
      username: string,
      password: string,
      rememberMe: boolean,
    ): Promise<void> => {
      try {
        setStatus('LOADING');

        const loginResponse =
          await loginUser(
            username,
            password,
            rememberMe,
          );

        /*
         * Fetch the authenticated user's
         * profile directly after login.
         */
        const currentUser =
          await fetchUserProfile();

        setUser(currentUser);

        dispatch(
          restoreAuthSession({
            token:
              loginResponse.token,
            isFirstLogin:
              loginResponse.isFirstLogin,
            user:
              currentUser,
          }),
        );

        /*
         * AppNavigator automatically
         * switches to the authenticated
         * navigator.
         */
        setStatus(
          'AUTHENTICATED',
        );
      } catch (error) {
        console.error(
          'LOGIN INITIALIZATION ERROR:',
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

  /*
   * Explicit user logout.
   */
  const signOut =
    async (): Promise<void> => {
      try {
        await logoutUser();
      } catch (error) {
        console.warn(
          'BACKEND LOGOUT ERROR:',
          error,
        );
      } finally {
        /*
         * Always clear local application
         * authentication state.
         */
        setUser(null);

        dispatch(logout());

        /*
         * AppNavigator automatically
         * switches to the unauthenticated
         * navigator.
         */
        setStatus(
          'UNAUTHENTICATED',
        );
      }
    };

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