import type { ListItemProps } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, LogOut } from "@tamagui/lucide-icons";
import {
  H4,
  ListItem,
  Separator,
  SizableText,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { useAuth, useSignOut } from "~/utils/auth";

export default function ProfilePage() {
  const signOutMutation = useSignOut();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

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
      <SafeAreaView>
        <XStack jc={"flex-end"} gap={"$4"}>
          <H4 alignSelf="center">{user.name}</H4>
          <AvatarWrapper src={user.image} fallback={user.name} />
        </XStack>
        <YGroup
          width={"100%"}
          alignSelf="center"
          separator={<Separator />}
          my={"$7"}
        >
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
                <SizableText size={"$4"} color={"$color8"}>
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

function MenuListItem({ children, ...props }: ListItemProps) {
  return (
    <YGroup.Item>
      <ListItem
        hoverTheme
        pressTheme
        icon={props.icon}
        fontSize={"$5"}
        iconAfter={props.iconAfter}
        py={"$5"}
        {...props}
      >
        {children}
      </ListItem>
    </YGroup.Item>
  );
}
