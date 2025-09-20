import type { formats } from "@kdx/locales";

//? @kdx/permissions should only use "api" namespace
type ApiMessages = typeof import("../../locales/src/messages/api/en.json");
type Formats = typeof formats;

declare global {
  type IntlMessages = ApiMessages;
  type IntlFormats = Formats;
}
