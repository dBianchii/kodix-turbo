import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, XStack } from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { defaultPadding } from "~/components/safe-area-view";
import { useAuth } from "~/utils/auth";

export function Header() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  if (!user) {
    router.replace("/");
    return null;
  }
  return (
    <SafeAreaView style={{ backgroundColor: theme.background.val }}>
      <XStack jc={"flex-end"} mx={defaultPadding} my={"$3"}>
        <Link href={"/home/account"} asChild>
          <AvatarWrapper src={user.image} fallback={user.name} />
        </Link>
      </XStack>
    </SafeAreaView>
  );
}
