import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "expo",
  slug: "expo",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/icon.png",
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
      projectId: "75dbcecc-5bc8-41c3-b79f-f8582a540fdf",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
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
  ],
});
