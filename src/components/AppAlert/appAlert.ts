import { Alert, AlertButton, AlertOptions } from 'react-native';
import { translateLiteral } from '../../i18n';

type AlertPayload = {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
};

type Listener = (payload: AlertPayload) => void;

let listener: Listener | null = null;
let isInstalled = false;
let originalAlert: typeof Alert.alert | null = null;

const NETWORK_ERROR_MESSAGE =
  'Unable to connect right now. Please check your internet and try again.';
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please log in again.';
const SERVER_ERROR_MESSAGE =
  'Our server is temporarily unavailable. Please try again in a moment.';

const extractServerMessage = (raw: string): string => {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed === 'object') {
      const candidate =
        (parsed as any).message ||
        (parsed as any).error ||
        (parsed as any).title ||
        (parsed as any).detail;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  } catch {
    // Keep raw message if it is not JSON.
  }
  return raw;
};

const normalizeErrorMessage = (message?: unknown): string | undefined => {
  if (message === undefined || message === null) return undefined;

  const raw = String(message).trim();
  if (!raw) return undefined;

  const extracted = extractServerMessage(raw);
  const normalized = extracted.toLowerCase();

  if (
    normalized.includes('network request failed') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('network error') ||
    normalized.includes('socket') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout')
  ) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (
    normalized.includes('unauthorized') ||
    normalized.includes('session expired') ||
    normalized.includes('token expired') ||
    normalized.includes('http 401') ||
    normalized.includes(' 401')
  ) {
    return SESSION_ERROR_MESSAGE;
  }

  if (
    normalized.includes('internal server') ||
    normalized.includes('server error') ||
    normalized.includes('http 500') ||
    normalized.includes(' 500') ||
    normalized.startsWith('<!doctype html') ||
    normalized.startsWith('<html')
  ) {
    return SERVER_ERROR_MESSAGE;
  }

  return extracted;
};

export const setAppAlertListener = (next: Listener | null) => {
  listener = next;
};

const showFallbackAlert = (
  title?: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
) => {
  if (originalAlert) {
    const safeMessage = normalizeErrorMessage(message);
    const translatedButtons = buttons?.map(button => ({
      ...button,
      text: button.text ? translateLiteral(button.text) : button.text,
    }));
    originalAlert(
      title ? translateLiteral(title) : '',
      safeMessage ? translateLiteral(safeMessage) : safeMessage,
      translatedButtons,
      options
    );
  }
};

export const showAppAlert = (
  title?: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
) => {
  const translatedButtons = buttons?.map(button => ({
    ...button,
    text: button.text ? translateLiteral(button.text) : button.text,
  }));
  const safeMessage = normalizeErrorMessage(message);

  if (listener) {
    listener({
      title: title ? translateLiteral(title) : title,
      message: safeMessage ? translateLiteral(safeMessage) : safeMessage,
      buttons: translatedButtons,
      options,
    });
    return;
  }
  showFallbackAlert(title, safeMessage, translatedButtons, options);
};

export const installAppAlertPatch = () => {
  if (isInstalled) return;
  isInstalled = true;

  originalAlert = Alert.alert.bind(Alert);

  Alert.alert = ((title, message, buttons, options) => {
    showAppAlert(title, message, buttons, options);
  }) as typeof Alert.alert;
};
