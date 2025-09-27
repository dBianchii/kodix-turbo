import type { formats, Locale } from "@kdx/locales";

type ValidatorsMessages =
  typeof import("../../locales/src/messages/validators/en.json");

declare module "next-intl" {
  interface AppConfig {
    Messages: ValidatorsMessages;
    Formats: typeof formats;
    Locale: Locale;
  }
}
