import { SplashScreen, Stack } from "expo-router";

import "@bacons/text-decoder/install";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "tamagui.config";

import { TRPCProvider } from "~/utils/api";

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontsError] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      // can hide splash screen here
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TRPCProvider>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === "dark" ? "dark_blue" : "light_blue"}
      >
        {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
          */}
        <Stack screenOptions={{ headerShown: false }} />
      </TamaguiProvider>
    </TRPCProvider>
  );
}
