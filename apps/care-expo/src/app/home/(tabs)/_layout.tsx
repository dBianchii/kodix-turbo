import { Text } from "react-native";
import { Tabs, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Bell, Home } from "@tamagui/lucide-icons";
import { View } from "tamagui";

import { useUser } from "~/utils/auth";

export default function TabLayout() {
  const user = useUser();
  const router = useRouter();
  if (!user) return router.replace("/");
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "$white",
        tabBarStyle: {
          borderTopColor: "rgba(34,36,40,1)",
          backgroundColor: "rgba(34,36,40,1)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => <Bell color={color} />,
        }}
      />
    </Tabs>
  );
}
