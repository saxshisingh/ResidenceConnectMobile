/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import {name as appName} from './app.json';

const messaging = getMessaging();

console.log('[FCM] Messaging initialized:', messaging);

setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log(
    '[FCM] Background message received:',
    remoteMessage,
  );

  const notificationId =
    remoteMessage.data?.notificationId;

  const type =
    remoteMessage.data?.type;

  const title =
    remoteMessage.notification?.title ??
    'Notification';

  const body =
    remoteMessage.notification?.body ??
    '';

  console.log('[FCM] Background notification:', {
    notificationId,
    type,
    title,
    body,
  });
});

AppRegistry.registerComponent(
  appName,
  () => App,
);