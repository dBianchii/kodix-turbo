import type { ViewProps } from "tamagui";
import { Link, useRouter } from "expo-router";
import { Button, H1, View } from "tamagui";

import { RootSafeAreaView } from "~/components/safe-area-view";

export default function Index() {
  return (
    <RootSafeAreaView f={1} jc={"center"} ai={"center"}>
      <H1 alignSelf="center">Kodix Care</H1>
      <MobileAuth mt={"$6"} />
    </RootSafeAreaView>
  );
}

function MobileAuth(props: ViewProps) {
  const router = useRouter();

  return (
    <View gap="$4" {...props}>
      <Link href="/register" asChild>
        <Button w={"$20"} themeInverse>
          Novo cadastro
        </Button>
      </Link>
      <Button
        w={"$20"}
        theme="active"
        onPress={() => {
          router.push("/signIn");
        }}
      >
        Entrar
      </Button>
    </View>
  );
}
