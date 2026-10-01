import notifee, {
  AndroidImportance,
} from '@notifee/react-native';

export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default',
    name: 'General Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
};