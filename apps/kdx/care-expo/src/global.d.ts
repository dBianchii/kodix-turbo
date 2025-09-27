import type { formats, Locale } from "@kdx/locales";

type CareExpoMessages =
  typeof import("../../../../packages/kdx/locales/src/messages/care-expo/en.json");

type ApiMessages =
  typeof import("../../../../packages/kdx/locales/src/messages/api/en.json");

type ValidatorsMessages =
  typeof import("../../../../packages/kdx/locales/src/messages/validators/en.json");

declare module "next-intl" {
  interface AppConfig {
    Messages: CareExpoMessages & ApiMessages & ValidatorsMessages;
    Formats: typeof formats;
    Locale: Locale;
  }
}
