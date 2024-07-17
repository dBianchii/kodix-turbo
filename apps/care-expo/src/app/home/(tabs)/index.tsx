import React from "react";
import { useRouter } from "expo-router";
import { Text, View, YStack } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

export default function Tab() {
  const { user } = useAuth();

  const router = useRouter();
  if (!user) router.replace("/");

  const shift = api.app.kodixCare.getCurrentShift.useQuery(undefined);

  return (
    <RootSafeAreaView>
      <YStack backgroundColor={"$background"} jc={"center"} ai={"center"}>
        <View>
          <Text>Current shift:</Text>
          <Text>asd</Text>
        </View>
        <Text>This is the tab screen!</Text>
      </YStack>
    </RootSafeAreaView>
  );
}
