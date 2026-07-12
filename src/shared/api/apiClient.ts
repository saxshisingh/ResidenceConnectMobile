import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEYS } from '../../features/auth/services/authService';

export class UnauthorizedError extends Error {
  constructor() {
    super('UNAUTHORIZED');
  }
}

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

 
  if (response.status === 401) {
    await AsyncStorage.multiRemove([
      AUTH_STORAGE_KEYS.token,
      AUTH_STORAGE_KEYS.isFirstLogin,
      AUTH_STORAGE_KEYS.rememberMe,
    ]);
    throw new UnauthorizedError();
  }

  return response;
};
