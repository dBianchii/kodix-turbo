import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { Button, Text, YStack } from "tamagui";

export default function NotFoundScreen() {
  return (
    <>
      <YStack bg={"$background"} flex={1} px={"$3"}>
        <SafeAreaView>
          <Stack.Screen options={{ title: "Oops!" }} />
          <YStack backgroundColor={"$background"} jc={"center"} ai={"center"}>
            <Text>This screen doesn't exist.</Text>
            <Link href="/" asChild>
              <Button>Go to home screen!</Button>
            </Link>
          </YStack>
        </SafeAreaView>
      </YStack>
    </>
  );
}
