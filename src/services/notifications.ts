import Constants from 'expo-constants';
import { Platform } from 'react-native';

let hasRegistered = false;
let handlerConfigured = false;
let cachedNotificationsModule: typeof import('expo-notifications') | null = null;

const isExpoGoAndroid = Constants.appOwnership === 'expo' && Platform.OS === 'android';

const getNotificationsModule = async () => {
  if (isExpoGoAndroid) {
    return null;
  }

  if (!cachedNotificationsModule) {
    cachedNotificationsModule = await import('expo-notifications');
  }

  if (!handlerConfigured) {
    cachedNotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return cachedNotificationsModule;
};

export const registerForNotifications = async () => {
  if (hasRegistered) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    const permission = await Notifications.getPermissionsAsync();
    const finalStatus =
      permission.status !== 'granted'
        ? (await Notifications.requestPermissionsAsync()).status
        : permission.status;

    if (finalStatus === 'granted') {
      hasRegistered = true;
    }
  } catch {
  }
};

export const sendInAppNotification = async (title: string, body: string) => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  } catch {
  }
};
