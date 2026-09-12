import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {logout} from '../features/auth/state/authSlice';
import {useAuth} from '../features/auth/context/AuthProvider';

import type {AppDispatch} from '../redux/store';

export default function AuthWatcher() {
  const dispatch = useDispatch<AppDispatch>();

  const error = useSelector(
    (state: any) => state.auth.error,
  );

  const {signOut} = useAuth();

  const isHandlingSessionExpiry = useRef(false);

  /*
   * AuthProvider handles:
   *
   * - Reading stored tokens
   * - Refreshing expired access tokens
   * - Fetching the current user
   * - Restoring the authenticated session
   *
   * Therefore AuthWatcher must NOT
   * independently restore the session.
   */
  useEffect(() => {
    const isSessionExpired =
      error === 'SESSION_EXPIRED' ||
      error === 'UNAUTHORIZED';

    if (
      !isSessionExpired ||
      isHandlingSessionExpiry.current
    ) {
      return;
    }

    isHandlingSessionExpiry.current = true;

    const handleSessionExpired = async () => {
      try {
        /*
         * Update AuthProvider authentication state
         * and clear persisted authentication.
         *
         * AppNavigator will automatically switch
         * from authenticated to unauthenticated
         * screens when status changes.
         */
        await signOut();

        /*
         * Clear Redux authentication state.
         */
        dispatch(logout());
      } catch (sessionError) {
        console.warn(
          'SESSION LOGOUT ERROR:',
          sessionError,
        );

        /*
         * Even if AuthProvider logout fails,
         * clear Redux state.
         */
        dispatch(logout());
      } finally {
        isHandlingSessionExpiry.current = false;
      }
    };

    handleSessionExpired();
  }, [
    dispatch,
    error,
    signOut,
  ]);

  return null;
}