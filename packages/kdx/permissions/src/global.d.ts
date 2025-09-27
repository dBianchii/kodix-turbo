import type { formats, Locale } from "@kdx/locales";

type ApiMessages = typeof import("../../locales/src/messages/api/en.json");

declare module "next-intl" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: <We need declaration merging>
  interface AppConfig {
    Messages: ApiMessages;
    Formats: typeof formats;
    Locale: Locale;
  }
}
