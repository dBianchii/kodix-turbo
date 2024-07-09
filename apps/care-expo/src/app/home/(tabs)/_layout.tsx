import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs/src/types";
import React from "react";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Tabs, useRouter } from "expo-router";
import { Bell, Home } from "@tamagui/lucide-icons";

import { useUser } from "~/utils/auth";

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
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => <Bell color={color} />,
        }}
      />
    </Tabs>
  );
}
