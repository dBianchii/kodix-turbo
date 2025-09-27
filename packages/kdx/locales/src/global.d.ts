import type { formats, Locale } from "@kdx/locales";

type KdxMessages = typeof import("./messages/kdx/en.json");
type ApiMessages = typeof import("./messages/api/en.json");
type CareExpoMessages = typeof import("./messages/care-expo/en.json");
type ValidatorsMessages = typeof import("./messages/validators/en.json");

declare module "next-intl" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: <We need declaration merging>
  interface AppConfig {
    Messages: KdxMessages & ApiMessages & CareExpoMessages & ValidatorsMessages;
    Formats: typeof formats;
    Locale: Locale;
  }
}
