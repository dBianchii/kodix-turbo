import type { ViewProps } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";

export function RootSafeAreaView({ children, ...props }: ViewProps) {
  return (
    <View bg={"$background"} f={1}>
      <SafeAreaView>
        <View {...props}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
