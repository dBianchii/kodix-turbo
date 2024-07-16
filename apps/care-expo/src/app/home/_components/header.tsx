import { SafeAreaView } from "react-native";
import { Link } from "expo-router";
import { useTheme, XStack } from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { defaultMargin } from "~/components/safe-area-view";
import { useAuth } from "~/utils/auth";

export function Header() {
  const { user } = useAuth();
  const theme = useTheme();
  if (!user) return;
  return (
    <SafeAreaView style={{ backgroundColor: theme.background.val }}>
      <XStack jc={"flex-end"} mx={defaultMargin} my={"$3"}>
        <Link href={"/home/account"} asChild>
          <AvatarWrapper src={user.image} fallback={user.name} />
        </Link>
      </XStack>
    </SafeAreaView>
  );
}
