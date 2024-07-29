/* eslint-disable @typescript-eslint/no-require-imports */

import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";

import "@bacons/text-decoder/install";
import "~/i18n";

import type { FontSource } from "expo-font";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { Spinner, TamaguiProvider } from "tamagui";
import tamaguiConfig from "tamagui.config";

import { RootSafeAreaView } from "~/components/safe-area-view";
import { TRPCProvider } from "~/utils/api";
import { useAuth } from "~/utils/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

function MainLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf") as FontSource,
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf") as FontSource,
  });

  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const inProtectedPage = segments[0] === "home";

    if (!user) {
      if (inProtectedPage) {
        router.replace("/");
        return;
      }
      return;
    }

    if (!inProtectedPage) {
      router.replace("/home");
    }
  }, [user, isLoading, router, segments]);

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
        <RootSafeAreaView f={1} jc={"center"} ai={"center"}>
          <Spinner />
        </RootSafeAreaView>
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
