import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

import { useSignOut } from "~/utils/auth";

export default function ProfilePage() {
  const signOut = useSignOut();
  return (
    <YStack bg={"$background"} flex={1} alignItems="center" px={"$3"}>
      <SafeAreaView>
        <Text>Home page. Yayy</Text>
        <Button onPress={() => signOut.mutate()}>Sign out</Button>
      </SafeAreaView>
    </YStack>
  );
}
