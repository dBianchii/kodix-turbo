import type { ViewProps } from "tamagui";
import { Link, useRouter } from "expo-router";
import { Button, H1, View } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";

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

export default function Index() {
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
