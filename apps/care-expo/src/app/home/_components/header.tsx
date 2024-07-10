import { Link } from "expo-router";
import { XStack } from "tamagui";

import { AvatarWrapper } from "~/components/avatar-wrapper";
import { useUser } from "~/utils/auth";

export function Header() {
  const user = useUser();
  if (!user) return;
  return (
    <XStack>
      <Link href={"/home/account"} asChild>
        <AvatarWrapper src={user.image} fallback={user.name} />
      </Link>
    </XStack>
  );
}
