import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform} from 'react-native';
import { apiFetch } from '../../shared/api/apiClient';
import { API_BASE_URL } from '../../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

const LOG_STORAGE_KEY = 'authToken';

export type LogLevel =
  | 'INFO'
  | 'WARN'
  | 'ERROR'
  | 'DEBUG';

export interface LogPayload {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(LOG_STORAGE_KEY);
};

export const sendLog = async (
  payload: LogPayload,
): Promise<void> => {
  try {
    const token = await getToken();

    await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify({
        ...payload,
        platform: Platform.OS,
      }),
    });
  } catch (error) {
  Alert.alert(
    'Logger Error',
    JSON.stringify(error)
  );
}
};

export const fetchLogs = async () => {
  try {
    const token = await getToken();

    const response = await fetch(
      `${API_URL}/logs`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      },
    );

    return await response.json();
  } catch (error) {
    Alert.alert(
        'Logger Error',
        JSON.stringify(error)
    );
    }
};

export const clearLogs = async () => {
  try {
    const token = await getToken();

    await fetch(
      `${API_URL}/logs`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      },
    );
  } catch (error) {
  Alert.alert(
    'Logger Error',
    JSON.stringify(error)
  );
}
};