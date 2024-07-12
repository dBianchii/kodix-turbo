import type { ViewProps } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";

export function RootSafeAreaView({ children, ...props }: ViewProps) {
  return (
    <View bg={"$background"} h={"100%"}>
      <View mx={"$4"} {...props}>
        <SafeAreaView>{children}</SafeAreaView>
      </View>
    </View>
  );
}
