import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text, View, YStack } from "tamagui";

import { useUser } from "~/utils/auth";

export default function Tab() {
  const user = useUser();

  const router = useRouter();
  if (!user) router.replace("/");

  return (
    <YStack bg={"$background"} flex={1} alignItems="center" px={"$3"}>
      <SafeAreaView>
        <Text>Home page. Yayy</Text>
      </SafeAreaView>
    </YStack>
  );
}
