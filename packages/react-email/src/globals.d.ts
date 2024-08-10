/* eslint-disable @typescript-eslint/consistent-type-imports */
//? @kdx/react-email should only use "emails" namespace
type ApiMessages = typeof import("../../locales/src/messages/api/en.json");

declare global {
  type IntlMessages = ApiMessages;
}
