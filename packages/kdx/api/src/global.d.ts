import type { formats, Locale } from "@kdx/locales";

type ApiMessages = typeof import("../../locales/src/messages/api/en.json");
type ValidatorsMessages =
  typeof import("../../locales/src/messages/validators/en.json");

declare module "next-intl" {
  interface AppConfig {
    Messages: ApiMessages & ValidatorsMessages;
    Formats: typeof formats;
    Locale: Locale;
  }
}
