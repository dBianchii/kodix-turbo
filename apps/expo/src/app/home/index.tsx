import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

import { Button } from "~/components/Button";
import { useSignOut } from "~/utils/auth";

export default function HomePage() {
  const signOut = useSignOut();
  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home Page" }} />
      <Button
        className="rounded-full"
        label="Sign out"
        onPress={() => signOut()}
      />
    </SafeAreaView>
  );
}
