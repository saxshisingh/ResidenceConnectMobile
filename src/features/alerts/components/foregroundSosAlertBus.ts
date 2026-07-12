export type ForegroundSosAlertPayload = {
  alertId: string;
  title: string;
  message: string;
  location?: string;
  urgencyLevel?: string;
  alert?: any;
};

type Listener = (payload: ForegroundSosAlertPayload) => void;

let listener: Listener | null = null;

export const setForegroundSosAlertListener = (next: Listener | null) => {
  listener = next;
};

export const showForegroundSosAlert = (payload: ForegroundSosAlertPayload) => {
  listener?.(payload);
};
