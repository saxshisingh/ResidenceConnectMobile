/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { callAuthMeAndLog, logout } from '../features/auth/state/authSlice';
import { AUTH_STORAGE_KEYS } from '../features/auth/services/authService';
import { navigationRef } from '../navigation/navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppDispatch } from '../redux/store';

export default function AuthWatcher() {
  const dispatch = useDispatch<AppDispatch>();
  const error = useSelector((state: any) => state.auth.error);
 

  useEffect(() => {
    const loadUserData = async () => {
      const [[, token], [, rememberMeRaw]] = await AsyncStorage.multiGet([
        AUTH_STORAGE_KEYS.token,
        AUTH_STORAGE_KEYS.rememberMe,
      ]);
      if (token && rememberMeRaw === 'true') {
       
        dispatch(callAuthMeAndLog() as any);
      }
    };

    loadUserData();
  }, [dispatch]);
  useEffect(() => {
    
    if (error === 'SESSION_EXPIRED' || error === 'UNAUTHORIZED') {
      dispatch(logout());

      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [dispatch, error]);

  return null;
}
