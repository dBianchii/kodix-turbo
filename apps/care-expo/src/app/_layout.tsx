import { SplashScreen, Stack, useRouter } from "expo-router";

import "@bacons/text-decoder/install";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { Spinner, TamaguiProvider, YStack } from "tamagui";
import tamaguiConfig from "tamagui.config";

import { TRPCProvider } from "~/utils/api";
import { useAuth } from "~/utils/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

function MainLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace("/home");
      return;
    }
    router.replace("/");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      {isLoading ? (
        <YStack
          backgroundColor={"$background"}
          f={1}
          ai={"center"}
          jc={"center"}
        >
          <Spinner />
        </YStack>
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TRPCProvider>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === "dark" ? "dark_blue" : "light_blue"}
      >
        <MainLayout />
      </TamaguiProvider>
    </TRPCProvider>
  );
}
