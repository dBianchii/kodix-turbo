// Use type safe message keys with `next-intl`
import type { formats } from "@kdx/locales";

//? @kdx/api needs access to both "api" and "validators" namespaces since it imports validators
type ApiMessages = typeof import("../../locales/src/messages/api/en.json");
type ValidatorsMessages =
  typeof import("../../locales/src/messages/validators/en.json");
type Formats = typeof formats;

declare global {
  type IntlMessages = ApiMessages & ValidatorsMessages;
  type IntlFormats = Formats;
}
