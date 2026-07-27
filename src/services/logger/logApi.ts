import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
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

    await apiFetch(`${API_URL}/logs`, {
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
    console.log(
      '[Logger] Unable to upload log',
      error,
    );
  }
};

export const fetchLogs = async () => {
  try {
    const token = await getToken();

    const response = await apiFetch(
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
    console.error(
      '[Logger] Fetch logs failed',
      error,
    );

    throw error;
  }
};

export const clearLogs = async () => {
  try {
    const token = await getToken();

    await apiFetch(
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
    console.error(
      '[Logger] Clear logs failed',
      error,
    );

    throw error;
  }
};