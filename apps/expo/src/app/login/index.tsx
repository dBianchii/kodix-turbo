import { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, useLocalSearchParams } from "expo-router";

import { api } from "~/utils/api";
import { setToken } from "~/utils/session-store";

export default function Login() {
  // const { session_token } = useLocalSearchParams();
  // const utils = api.useUtils();
  // useEffect(() => {
  //   if (session_token) {
  //     const sessionToken = String(session_token);
  //     if (!sessionToken) return;

  //     setToken(sessionToken);
  //     void utils.invalidate();
  //     router.push("/");
  //   }
  // }, [session_token, utils]);

  return (
    <SafeAreaView>
      <Link href="/">
        <Text className="text-foreground">Heree</Text>
      </Link>
    </SafeAreaView>
  );
}
