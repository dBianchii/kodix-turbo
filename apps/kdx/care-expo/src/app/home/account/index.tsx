import { TouchableOpacity } from "react-native";
import { View } from "@tamagui/core";
import { YGroup } from "@tamagui/group";
import { ListItem } from "@tamagui/list-item";
import { ArrowRight, LogOut, X } from "@tamagui/lucide-icons";
import { Separator } from "@tamagui/separator";
import { XStack, YStack } from "@tamagui/stacks";
import { H4, SizableText } from "@tamagui/text";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
      onPress: () => {
        router.push("/home/account/edit/name");
      },
      text: "Nome",
      textRight: user.name,
    },
    {
      onPress: () => {
        router.push("/home/account/edit/team");
      },
      text: "Time",
      textRight: user.activeTeamName,
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
        <XStack gap={"$4"} jc={"space-between"}>
          <View alignSelf="center">
            <TouchableOpacity onPress={() => router.back()}>
              <X ml={"$3"} />
            </TouchableOpacity>
          </View>
          <XStack gap={"$4"}>
            <H4 alignSelf="center">{user.name}</H4>
            <AvatarWrapper fallback={user.name} src={user.image} />
          </XStack>
        </XStack>
        <YGroup alignSelf="center" my={"$7"} width={"100%"}>
          {items.map((item) => (
            <MenuListItem
              iconAfter={ArrowRight}
              key={item.text}
              onPress={item.onPress}
            >
              <XStack f={1} jc={"space-between"}>
                <SizableText fontFamily={"$silkscreen"} fontWeight={"$7"}>
                  {item.text}
                </SizableText>
                <SizableText color={"$color10"} size={"$4"}>
                  {item.textRight}
                </SizableText>
              </XStack>
            </MenuListItem>
          ))}
        </YGroup>

        <YGroup
          alignSelf="center"
          bordered
          my={"$7"}
          separator={
            <XStack>
              <Separator />
              <Separator />
            </XStack>
          }
          size="$4"
          theme={"dark_red"}
        >
          <ListItem
            fontFamily={"$silkscreen"}
            fontSize={"$5"}
            hoverTheme
            icon={LogOut}
            onPress={() => signOutMutation.mutate()}
            pressTheme
            py={"$5"}
            scaleIcon={1.5}
          >
            Sair
          </ListItem>
        </YGroup>
      </SafeAreaView>
    </YStack>
  );
}
