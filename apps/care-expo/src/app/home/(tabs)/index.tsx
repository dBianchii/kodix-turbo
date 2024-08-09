import React from "react";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";
import { useAuth } from "~/utils/auth";

export default function Tab() {
  const { user } = useAuth();

  const router = useRouter();
  if (!user) router.replace("/");

  // const shift = api.app.kodixCare.getCurrentShift.useQuery(undefined);

  return (
    <RootSafeAreaView>
      <YStack
        backgroundColor={"$background"}
        jc={"center"}
        ai={"center"}
      ></YStack>
    </RootSafeAreaView>
  );
}
