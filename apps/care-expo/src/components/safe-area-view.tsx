import type { ViewProps } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";

export const defaultMargin = "$4";

export function RootSafeAreaView({ children, ...props }: ViewProps) {
  return (
    <View bg={"$background"} h={"100%"}>
      <View mx={defaultMargin} {...props}>
        <SafeAreaView>{children}</SafeAreaView>
      </View>
    </View>
  );
}
