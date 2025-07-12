import { Link, Stack } from "expo-router";
import { Button, Text, YStack } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";
import { useAuth } from "~/utils/auth";

export default function NotFoundScreen() {
  const { user } = useAuth();
  return (
    <>
      <RootSafeAreaView>
        <Stack.Screen options={{ title: "Oops!" }} />
        <YStack backgroundColor={"$background"} jc={"center"} ai={"center"}>
          <Text>This screen doesn't exist.</Text>
          <Link href={user ? "/home" : "/"} asChild>
            <Button>Go to home screen!</Button>
          </Link>
        </YStack>
      </RootSafeAreaView>
    </>
  );
}
