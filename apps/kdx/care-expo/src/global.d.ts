// Use type safe message keys with `next-intl`
import type { formats } from "@kdx/locales";

//? @kdx/care-expo needs access to "care-expo", "api", and "validators" namespaces since it imports validators
type CareExpoMessages =
  typeof import("../../../../packages/kdx/locales/src/messages/care-expo/en.json");

type ApiMessages =
  typeof import("../../../../packages/kdx/locales/src/messages/api/en.json");

type ValidatorsMessages =
  typeof import("../../../../packages/kdx/locales/src/messages/validators/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = CareExpoMessages & ApiMessages & ValidatorsMessages;
  type IntlFormats = Formats;
}
