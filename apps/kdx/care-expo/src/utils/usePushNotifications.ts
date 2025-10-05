import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useToastController } from "@tamagui/toast";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { api } from "./api";
import { getStorageExpoToken, saveStorageExpoToken } from "./expoToken-store";

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#FF231F7C",
      name: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  if (!Device.isDevice) {
    //? Must use physical device for Push Notifications :)
    return;
  }

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
    throw new Error(`${e}`);
  }
}

export const usePushNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }),
  });
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  // const [notification, setNotification] = useState<
  //   Notifications.Notification | undefined
  // >();
  const saveExpoTokenMutation =
    api.user.notifications.saveExpoToken.useMutation();
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);
  const toast = useToastController();
  const utils = api.useUtils();

  useEffect(() => {
    const setupPushNotifications = async () => {
      // Check if the token is stored in AsyncStorage
      const storedToken = await getStorageExpoToken();
      if (storedToken) {
        setExpoPushToken(storedToken);
        return;
      }
      // If no token, register for push notifications
      registerForPushNotificationsAsync()
        .then(async (token) => {
          if (token) {
            setExpoPushToken(token);
            await saveStorageExpoToken(token);
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
        toast.show(notification.request.content.title ?? "", {
          message: notification.request.content.body ?? "",
          variant: "default",
        });
        void utils.user.getNotifications.invalidate();
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
  }, [saveExpoTokenMutation, toast, utils.user.getNotifications]);

  return { expoPushToken };
};
