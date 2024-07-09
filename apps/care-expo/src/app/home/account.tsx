import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeftToLine,
  ArrowRight,
  Cloud,
  Moon,
  Star,
  Sun,
} from "@tamagui/lucide-icons";
import {
  Button,
  Card,
  H2,
  H3,
  H4,
  ListItem,
  Paragraph,
  Separator,
  Text,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { useSignOut, useUser } from "~/utils/auth";

export default function ProfilePage() {
  const signOutMutation = useSignOut();
  const user = useUser();
  if (!user) return null;

  return (
    <YStack bg={"$background"} flex={1} p={"$4"}>
      <SafeAreaView>
        <XStack jc={"flex-end"} gap={"$4"}>
          <H4>{user.name}</H4>
          <AvatarWrapper src={user.image} fallback={user.name} />
        </XStack>
        <YGroup
          alignSelf="center"
          size="$4"
          separator={<Separator />}
          my={"$7"}
        >
          <YGroup.Item>
            <ListItem hoverTheme icon={Moon} iconAfter={ArrowRight} py={"$5"}>
              Alterar nome
            </ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme icon={Moon} iconAfter={ArrowRight} py={"$5"}>
              Mudar de time
            </ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem
              onPress={() => signOutMutation.mutate()}
              theme={"dark_red"}
              icon={ArrowLeftToLine}
              iconAfter={ArrowRight}
              py={"$5"}
            >
              Sair
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </SafeAreaView>
    </YStack>
  );
}
