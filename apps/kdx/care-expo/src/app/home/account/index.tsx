import { TouchableOpacity } from "react-native";
import { ArrowRight, LogOut, X } from "@tamagui/lucide-icons";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  H4,
  ListItem,
  Separator,
  SizableText,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { MenuListItem } from "~/components/menu-list-item";
import { useAuth, useSignOut } from "~/utils/auth";

export default function ProfilePage() {
  const signOutMutation = useSignOut();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.replace("/");
    return null;
  }

  const items = [
    {
      text: "Nome",
      textRight: user.name,
      onPress: () => {
        router.push("/home/account/edit/name");
      },
    },
    {
      text: "Time",
      textRight: user.activeTeamName,
      onPress: () => {
        router.push("/home/account/edit/team");
      },
    },
  ];

  return (
    <YStack bg={"$background"} flex={1} p={"$4"}>
      <Stack.Screen
        options={{
          animation: "slide_from_bottom",
          gestureEnabled: false,
        }}
      />
      <SafeAreaView>
        <XStack jc={"space-between"} gap={"$4"}>
          <View alignSelf="center">
            <TouchableOpacity onPress={() => router.back()}>
              <X ml={"$3"} />
            </TouchableOpacity>
          </View>
          <XStack gap={"$4"}>
            <H4 alignSelf="center">{user.name}</H4>
            <AvatarWrapper src={user.image} fallback={user.name} />
          </XStack>
        </XStack>
        <YGroup width={"100%"} alignSelf="center" my={"$7"}>
          {items.map((item) => (
            <MenuListItem
              key={item.text}
              iconAfter={ArrowRight}
              onPress={item.onPress}
            >
              <XStack jc={"space-between"} f={1}>
                <SizableText fontWeight={"$7"} fontFamily={"$silkscreen"}>
                  {item.text}
                </SizableText>
                <SizableText size={"$4"} color={"$color10"}>
                  {item.textRight}
                </SizableText>
              </XStack>
            </MenuListItem>
          ))}
        </YGroup>

        <YGroup
          theme={"dark_red"}
          alignSelf="center"
          size="$4"
          bordered
          separator={
            <XStack>
              <Separator />
              <Separator />
            </XStack>
          }
          my={"$7"}
        >
          <ListItem
            hoverTheme
            pressTheme
            onPress={() => signOutMutation.mutate()}
            icon={LogOut}
            py={"$5"}
            fontSize={"$5"}
            scaleIcon={1.5}
            fontFamily={"$silkscreen"}
          >
            Sair
          </ListItem>
        </YGroup>
      </SafeAreaView>
    </YStack>
  );
}
