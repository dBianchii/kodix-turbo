import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text, YStack } from "tamagui";

import { useAuth } from "~/utils/auth";
import { Header } from "../_components/header";

export default function Tab() {
  const { user } = useAuth();

  const router = useRouter();
  if (!user) router.replace("/");

  return (
    <YStack bg={"$background"} flex={1} px={"$3"} ai={"flex-end"}>
      <SafeAreaView>
        <Header />
        <Text>Home page. Yayy</Text>
      </SafeAreaView>
    </YStack>
  );
}
