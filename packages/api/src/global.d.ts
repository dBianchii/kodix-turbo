/* eslint-disable @typescript-eslint/consistent-type-imports */
// Use type safe message keys with `next-intl`

//? @kdx/api should only use "api" namespace
type ApiMessages = typeof import("../../locales/src/messages/api/en.json");

declare global {
  type IntlMessages = ApiMessages;
}
