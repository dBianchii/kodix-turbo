import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs/src/types";
import { Pressable } from "react-native";
import { Bell, Home } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Tabs, useRouter } from "expo-router";

import { useAuth } from "~/utils/auth";

import { Header } from "../_components/header";

function TabBarButton(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return props.onPress?.(e);
      }}
    />
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  if (!user) {
    router.replace("/");
    return null;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "$color",
        tabBarStyle: {
          backgroundColor: "rgba(34,36,40,1)",
          borderTopColor: "rgba(34,36,40,1)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          header: () => <Header />,
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => <Home color={color} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => <Bell color={color} />,
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}
