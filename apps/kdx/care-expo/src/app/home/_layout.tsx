import { useTheme } from "@tamagui/core";
import { Stack } from "expo-router/stack";

export default function Layout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerStyle: {
            backgroundColor: theme.background.val,
          },
        }}
      />
    </Stack>
  );
}
