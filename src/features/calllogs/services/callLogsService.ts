import { API_BASE_URL } from '../../../config/api';
import { apiFetch } from '../../../shared/api/apiClient';

export interface SecurityCallLog {
  id: string;
  name: string;
  time: string;
  type: string;
  details: string;
}

const formatTime = (value?: string) => {
  if (!value) {
    return 'Date unavailable';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

const normalizeCallLog = (item: any): SecurityCallLog => {
  const type = String(
    item?.callDirection || item?.type || item?.callType || item?.direction || 'Unknown',
  );
  const fromNumber = String(item?.calledFromNumber || item?.fromNumber || '');
  const toNumber = String(item?.calledToNumber || item?.toNumber || '');
  const durationSeconds = item?.callDurationSeconds;
  const durationLabel =
    durationSeconds === null || durationSeconds === undefined
      ? 'Duration: Ongoing/NA'
      : `Duration: ${durationSeconds}s`;
  const primaryNumber =
    type.toLowerCase() === 'incoming'
      ? fromNumber || toNumber
      : toNumber || fromNumber;

  return {
    id: String(
      item?.id ||
        item?.callLogId ||
        item?.callId ||
        item?.securityCallLogId ||
        item?.conversationId ||
        Math.random().toString(36).slice(2),
    ),
    name: primaryNumber ? `Security (${primaryNumber})` : 'Security Team',
    time: formatTime(item?.callStartedOn || item?.time || item?.callTime || item?.createdAt),
    type,
    details: durationLabel,
  };
};

export const getSecurityCallLogs = async (userId: string): Promise<SecurityCallLog[]> => {
  const response = await apiFetch(`${API_BASE_URL}/api/security/call-logs/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch call logs');
  }

  const json = await response.json();
  const raw = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
  return raw.map(normalizeCallLog);
};
