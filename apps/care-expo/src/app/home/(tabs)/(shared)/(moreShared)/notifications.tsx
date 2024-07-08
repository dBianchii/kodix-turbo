import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

export default function Tab() {
  return (
    <YStack bg={"$background"} flex={1} alignItems="center" px={"$3"}>
      <SafeAreaView>
        <Text>Settings page</Text>
      </SafeAreaView>
    </YStack>
  );
}
