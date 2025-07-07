/* eslint-disable @typescript-eslint/consistent-type-imports */
// Use type safe message keys with `next-intl`
import type { formats } from "@kdx/locales";

//? @kdx/validators should only use "validators" namespaces

type ValidatorsMessages =
  typeof import("../../locales/src/messages/validators/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = ValidatorsMessages;
  type IntlFormats = Formats;
}
