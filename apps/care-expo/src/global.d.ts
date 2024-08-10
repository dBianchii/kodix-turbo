/* eslint-disable @typescript-eslint/consistent-type-imports */
// Use type safe message keys with `next-intl`

//? @kdx/care-expo should only use "care-expo" namespace
type CareExpoMessages =
  typeof import("../../../packages/locales/src/messages/care-expo/en.json");
declare global {
  type IntlMessages = CareExpoMessages;
}
