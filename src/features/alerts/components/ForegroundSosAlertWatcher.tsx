import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { useAppSelector } from '../../../redux/hooks';
import { getSOSAlerts } from '../services/alertService';
import { playAlertTone } from '../utils/alertTone';
import { navigationRef } from '../../../navigation/navigationRef';
import { showForegroundSosAlert } from './foregroundSosAlertBus';

const POLL_INTERVAL_MS = 15000;

const getUrgencyMeta = (level?: string) => {
  switch ((level || '').toLowerCase()) {
    case 'critical':
    case 'high':
    case 'urgent':
      return { label: 'Urgent', icon: '●' };
    case 'medium':
    case 'important':
      return { label: 'Important', icon: '●' };
    default:
      return { label: 'Regular', icon: '●' };
  }
};

export default function ForegroundSosAlertWatcher() {
  const user = useAppSelector(state => state.auth.user);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const latestKnownAlertIdRef = useRef<string | null>(null);
  const shownAlertIdRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.data?.residentId) {
      latestKnownAlertIdRef.current = null;
      shownAlertIdRef.current = null;
      return;
    }

    const pollAlerts = async (skipPopupForBaseline = false) => {
      if (appStateRef.current !== 'active') return;

      try {
        const alerts = await getSOSAlerts();
        if (!Array.isArray(alerts) || alerts.length === 0) return;

        const latestAlert = [...alerts].sort((a, b) => {
          const aTime = new Date(a.createdAt || a.alertDate || 0).getTime();
          const bTime = new Date(b.createdAt || b.alertDate || 0).getTime();
          return bTime - aTime;
        })[0];

        const latestAlertId = latestAlert?.alertId || latestAlert?.sosAlertId || latestAlert?.id;
        if (!latestAlertId) return;

        if (!latestKnownAlertIdRef.current) {
          latestKnownAlertIdRef.current = latestAlertId;
          if (skipPopupForBaseline) return;
        }

        if (latestAlertId === latestKnownAlertIdRef.current) return;

        latestKnownAlertIdRef.current = latestAlertId;

        if (shownAlertIdRef.current === latestAlertId) return;
        shownAlertIdRef.current = latestAlertId;

        playAlertTone();

        showForegroundSosAlert({
          alertId: latestAlertId,
          title: latestAlert?.title || latestAlert?.alertCode || 'New SOS alert received',
          message: latestAlert?.message || latestAlert?.notes || 'A new alert has been received.',
          location: latestAlert?.location,
          urgencyLevel: latestAlert?.urgencyLevel,
          alert: latestAlert,
        });
      } catch (error) {
        console.log('Foreground SOS watcher error:', error);
      }
    };

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(() => {
        pollAlerts();
      }, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (!pollingRef.current) return;
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    };

    pollAlerts(true);
    startPolling();

    const subscription = AppState.addEventListener('change', nextAppState => {
      appStateRef.current = nextAppState;
      if (nextAppState === 'active') {
        pollAlerts(true);
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [user?.data?.residentId]);

  return null;
}
