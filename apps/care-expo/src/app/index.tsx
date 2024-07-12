import type { ViewProps } from "tamagui";
import { Link, useRouter } from "expo-router";
import { Button, H1, View } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";

// Notifications.setNotificationHandler({
//   // eslint-disable-next-line @typescript-eslint/require-await
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// async function sendPushNotification(expoPushToken: string) {
//   const message = {
//     to: expoPushToken,
//     sound: "default",
//     title: "Oie",
//     body: "Como vai vc!",
//     data: { someData: "goes here" },
//   };

//   console.log(JSON.stringify(message));

//   await fetch("https://exp.host/--/api/v2/push/send", {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       "Accept-encoding": "gzip, deflate",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(message),
//   });
// }

// function handleRegistrationError(errorMessage: string) {
//   alert(errorMessage);
//   throw new Error(errorMessage);
// }

// async function registerForPushNotificationsAsync() {
//   if (Platform.OS === "android") {
//     void Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       handleRegistrationError(
//         "Permission not granted to get push token for push notification!",
//       );
//       return;
//     }

//     const projectId = "75dbcecc-5bc8-41c3-b79f-f8582a540fdf";
//     if (!projectId) {
//       handleRegistrationError("Project ID not found");
//     }
//     try {
//       const pushTokenString = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log(pushTokenString);
//       return pushTokenString;
//     } catch (e: unknown) {
//       // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
//       handleRegistrationError(`${e}`);
//     }
//     return;
//   }
//   handleRegistrationError("Must use physical device for push notifications");
// }

export default function Index() {
  // const [expoPushToken, setExpoPushToken] = useState("");
  // const [notification, setNotification] = useState<
  //   Notifications.Notification | undefined
  // >(undefined);
  // const notificationListener = useRef<Notifications.Subscription>();
  // const responseListener = useRef<Notifications.Subscription>();

  // useEffect(() => {
  //   registerForPushNotificationsAsync()
  //     .then((token) => setExpoPushToken(token ?? ""))
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     .catch((error: any) => setExpoPushToken(`${error}`));

  //   notificationListener.current =
  //     Notifications.addNotificationReceivedListener((notification) => {
  //       setNotification(notification);
  //     });

  //   responseListener.current =
  //     Notifications.addNotificationResponseReceivedListener((response) => {
  //       console.log(response);
  //     });

  //   return () => {
  //     notificationListener.current &&
  //       Notifications.removeNotificationSubscription(
  //         notificationListener.current,
  //       );
  //     responseListener.current &&
  //       Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);

  // const utils = api.useUtils();
  // const url = Linking.useURL();
  // if (url) {
  //   const { params } = QueryParams.getQueryParams(url);
  //   const { session_token } = params;
  //   if (session_token) {
  //     console.log(session_token, "has been set");
  //     setToken(session_token);
  //     void utils.invalidate();
  //   }
  // }

  return (
    <RootSafeAreaView f={1} jc={"center"} ai={"center"}>
      <H1 alignSelf="center">Kodix Care</H1>
      <MobileAuth mt={"$6"} />
    </RootSafeAreaView>
  );
}

function MobileAuth(props: ViewProps) {
  const router = useRouter();

  return (
    <View gap="$4" {...props}>
      <Link href="/register" asChild>
        <Button w={"$20"} themeInverse>
          Novo cadastro
        </Button>
      </Link>
      <Button
        w={"$20"}
        theme="active"
        onPress={() => {
          router.push("/signIn");
        }}
      >
        Entrar
      </Button>
    </View>
  );
}
