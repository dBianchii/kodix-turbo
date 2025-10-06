import type { ViewProps } from "tamagui";
import { Link, useRouter } from "expo-router";
import { Button, H1, View } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";

export default function Index() {
  return (
    <RootSafeAreaView ai={"center"} f={1} jc={"center"}>
      <H1 alignSelf="center">Kodix Care</H1>
      <MobileAuth mt={"$6"} />
    </RootSafeAreaView>
  );
}

function MobileAuth(props: ViewProps) {
  const router = useRouter();

  return (
    <View gap="$4" {...props}>
      <Link asChild href="/register">
        <Button themeInverse w={"$20"}>
          Novo cadastro
        </Button>
      </Link>
      <Button
        onPress={() => {
          router.push("/signIn");
        }}
        theme="active"
        w={"$20"}
      >
        Entrar
      </Button>
    </View>
  );
}
