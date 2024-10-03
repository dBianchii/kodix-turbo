/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { formats } from "@kdx/locales";

//? @kdx/react-email should only use "emails" namespace
type ApiMessages = typeof import("../../locales/src/messages/api/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = ApiMessages;
  type IntlFormats = Formats;
}
