import { Stack } from "expo-router/stack";
import { useColorScheme } from "nativewind";

export default function Layout() {
  const { colorScheme } = useColorScheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme == "dark" ? "#6d28d9" : "#FFFFFF",
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#6d28d9" : "#FFFFFF",
          },
        }}
      />
    </Stack>
  );
}