import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Button } from "~/components/Button";
import { useSignOut, useUser } from "~/utils/auth";

export default function Tab() {
  const signOut = useSignOut();
  const user = useUser();

  const router = useRouter();
  if (!user) router.replace("/");

  return (
    <View className="flex h-full w-full flex-col bg-background p-8">
      <SafeAreaView className="flex bg-background">
        <Text className="text-2xl text-foreground">Home page. Yayy</Text>
      </SafeAreaView>
    </View>
  );
}
