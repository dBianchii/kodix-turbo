import { Stack } from "expo-router/stack";
import { useTheme } from "tamagui";

import { Header } from "./_components/header";

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
          header: () => <Header />,
          title: "",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
