import { Tabs, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { cn } from "@kdx/ui";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Avatar";
import { useUser } from "~/utils/auth";

export default function TabLayout() {
  const user = useUser();
  const router = useRouter();
  if (!user) return router.replace("/");
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6d28d9",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerStyle: {
            backgroundColor: "#6d28d9",
          },
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name=""
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="bell" color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="bell" color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="account"
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <Avatar
              className={cn(
                "size-10",
                focused && `border-{color} border-2 transition-all`,
              )}
            >
              <AvatarImage
                source={{
                  uri: user.image ?? "https://i.pravatar.cc/300",
                }}
              />
              <AvatarFallback>CG</AvatarFallback>
            </Avatar>
          ),
        }}
      /> */}
    </Tabs>
  );
}
