import type { formats, Locale } from "@kdx/locales";

type ApiMessages = typeof import("../../locales/src/messages/api/en.json");

declare module "next-intl" {
  interface AppConfig {
    Messages: ApiMessages;
    Formats: typeof formats;
    Locale: Locale;
  }
}
