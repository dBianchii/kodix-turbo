/* eslint-disable @typescript-eslint/no-require-imports */

import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";

import "@bacons/text-decoder/install";

import type { FontSource } from "expo-font";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { PortalProvider, Spinner, TamaguiProvider } from "tamagui";
import tamaguiConfig from "tamagui.config";
import { IntlProvider } from "use-intl";

/* prettier-ignore-start */ //!Do not format formatjs imports!
import "@formatjs/intl-getcanonicallocales/polyfill";
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-pluralrules/locale-data/pt";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-relativetimeformat/locale-data/pt";

/* prettier-ignore-end */

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  useToastState,
} from "@tamagui/toast";

import { en, pt_BR } from "@kdx/locales/messages/care-expo";

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
  const messages = {
    en,
    "pt-BR": pt_BR,
  };
  const [locale, _setLocale] = useState<"en" | "pt-BR">("pt-BR");
  return (
    <TRPCProvider>
      <IntlProvider
        messages={messages[locale]}
        locale={locale}
        timeZone="America/Sao_Paulo"
      >
        <TamaguiProvider config={tamaguiConfig} defaultTheme={"dark_blue"}>
          {/* <KeyboardProvider> need to use development build*/}
          <ToastProvider swipeDirection="up" swipeThreshold={20}>
            <PortalProvider shouldAddRootHost>
              <DefaultToast />
              <MainLayout />
              <SafeToastViewport />
            </PortalProvider>
          </ToastProvider>
          {/* </KeyboardProvider> */}
        </TamaguiProvider>
      </IntlProvider>
    </TRPCProvider>
  );
}

function DefaultToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;
  return (
    <Toast
      theme={currentToast.customData?.variant === "error" ? "red" : null}
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0, y: -25 }}
      exitStyle={{ opacity: 0, scale: 0, y: -25 }}
      y={0}
      scale={1}
      viewportName={currentToast.viewportName}
      animation={"quick"}
    >
      <Toast.Title textAlign="center">{currentToast.title}</Toast.Title>
      {!!currentToast.message && (
        <Toast.Description textAlign="center">
          {currentToast.message}
        </Toast.Description>
      )}
    </Toast>
  );
}

function SafeToastViewport() {
  const { left, top, right } = useSafeAreaInsets();
  return (
    <ToastViewport
      flexDirection="column-reverse"
      top={top}
      left={left}
      right={right}
    />
  );
}
