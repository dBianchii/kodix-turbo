import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { Header } from "../_components/header";

export default function Tab() {
  return (
    <YStack bg={"$background"} flex={1} px={"$3"}>
      <SafeAreaView>
        <Header />
      </SafeAreaView>
    </YStack>
  );
}
