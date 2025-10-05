import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    adaptiveIcon: {
      backgroundColor: "#020817",
      foregroundImage: "./assets/icon.png",
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    package: "com.kodix.kodixCare",
  },
  assetBundlePatterns: ["**/*"],
  experiments: {
    tsconfigPaths: true,
  },
  extra: {
    eas: {
      projectId: "d2701343-40d2-4b76-b504-34b546414b36",
    },
  },
  icon: "./assets/kodixCare.png",
  ios: {
    bundleIdentifier: "com.kodix.kodixCare",
    supportsTablet: true,
  },
  name: "Kodix Care",
  orientation: "portrait",
  plugins: [
    "expo-secure-store",
    "expo-router",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.42896229992-7k78j9qped4kbpcbghb8pkfbivop5g6c",
      },
    ],
    "expo-font",
    "expo-localization",
  ],
  scheme: "care-expo",
  slug: "care-expo",
  splash: {
    backgroundColor: "#020817",
    image: "./assets/kodixCare.png",
    resizeMode: "contain",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  userInterfaceStyle: "automatic",
  version: "0.1.0",
});
