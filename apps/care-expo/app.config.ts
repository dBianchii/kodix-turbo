import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Kodix Care",
  slug: "care-expo",
  scheme: "care-expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/kodixCare.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/kodixCare.png",
    resizeMode: "contain",
    backgroundColor: "#020817",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.kodix.kodixCare",
    supportsTablet: true,
  },
  android: {
    package: "com.kodix.kodixCare",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#020817",
    },
  },
  extra: {
    eas: {
      projectId: "d2701343-40d2-4b76-b504-34b546414b36",
    },
  },
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
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
});
