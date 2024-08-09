import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "tamagui";

export const defaultPadding = "$4";

export const RootSafeAreaView = styled(SafeAreaView, {
  bg: "$background",
  h: "100%",
  p: defaultPadding,
});
