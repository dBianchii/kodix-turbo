/* eslint-disable @typescript-eslint/consistent-type-imports */
// Use type safe message keys with `next-intl`
import type { formats } from "@kdx/locales";

//? @kdx/care-expo should only use "care-expo" namespace
type CareExpoMessages =
  typeof import("../../../packages/locales/src/messages/care-expo/en.json");

//TODO: Figure out why it errors when I remove this line below
type ApiMessages =
  typeof import("../../../packages/locales/src/messages/api/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = CareExpoMessages | ApiMessages;
  type IntlFormats = Formats;
}
