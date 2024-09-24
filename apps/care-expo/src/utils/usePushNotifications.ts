/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "./api";

const expoPushTokenKey = "expoPushToken";
const getTokenFromStorage = async () => {
  try {
    const token = await AsyncStorage.getItem(expoPushTokenKey);
    return token;
  } catch (error) {
    console.error("Failed to retrieve token from storage:", error);
    return null;
  }
};

async function saveTokenToStorage(token: string) {
  try {
    await AsyncStorage.setItem(expoPushTokenKey, token);
  } catch (error) {
    console.error("Failed to save push token to storage", error);
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice)
    throw new Error("Must use physical device for Push Notifications");

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    throw new Error(
      "Permission not granted to get push token for push notification!",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined;
  if (!projectId) {
    throw new Error("Project ID not found");
  }
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log(pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`${e}`);
  }
}

Notifications.setNotificationHandler({
  // eslint-disable-next-line @typescript-eslint/require-await
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const saveExpoTokenMutation =
    api.user.notifications.saveExpoToken.useMutation();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    const setupPushNotifications = async () => {
      // Check if the token is stored in AsyncStorage
      const storedToken = await getTokenFromStorage();
      if (storedToken) {
        setExpoPushToken(storedToken);
        return;
      }
      // If no token, register for push notifications
      registerForPushNotificationsAsync()
        .then(async (token) => {
          if (token) {
            setExpoPushToken(token);
            await saveTokenToStorage(token);
            saveExpoTokenMutation.mutate({ expoToken: token });
          }
        })
        .catch((error: unknown) => {
          console.error(error);
          setExpoPushToken(undefined);
        });
    };
    void setupPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        //Whenever the user interacts with the notification (taps on it for example)
        console.log(response);
      });

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { expoPushToken, notification };
};
