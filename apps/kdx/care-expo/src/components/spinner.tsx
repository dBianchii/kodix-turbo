import type { GetProps } from "@tamagui/core";
import { ActivityIndicator } from "react-native";
import { styled } from "@tamagui/core";

export const Spinner = styled(ActivityIndicator, {
  name: "Spinner",
});
export type SpinnerProps = GetProps<typeof Spinner>;
