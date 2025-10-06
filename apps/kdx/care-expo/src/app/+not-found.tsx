import { Link, Stack } from "expo-router";
import { Button, Text, YStack } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";
import { useAuth } from "~/utils/auth";

export default function NotFoundScreen() {
  const { user } = useAuth();
  return (
    <RootSafeAreaView>
      <Stack.Screen options={{ title: "Oops!" }} />
      <YStack ai={"center"} backgroundColor={"$background"} jc={"center"}>
        <Text>This screen doesn't exist.</Text>
        <Link asChild href={user ? "/home" : "/"}>
          <Button>Go to home screen!</Button>
        </Link>
      </YStack>
    </RootSafeAreaView>
  );
}
