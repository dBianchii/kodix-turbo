/* eslint-disable @typescript-eslint/consistent-type-imports */
// Use type safe message keys with `next-intl`
import type { formats } from "@kdx/locales";

//? @kdx/validators should only use "zod" and "validators" namespaces

type ZodMessages = typeof import("../../locales/src/messages/zod/en.json");
type ValidatorsMessages =
  typeof import("../../locales/src/messages/validators/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = ZodMessages & ValidatorsMessages;
  type IntlFormats = Formats;
}
