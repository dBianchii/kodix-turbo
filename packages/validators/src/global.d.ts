// Use type safe message keys with `next-intl`
//eslint-disable-next-line @typescript-eslint/consistent-type-imports
type ZodMessages = typeof import("../../locales/src/messages/zod/en.json");
type ValidatorsMessages =
  typeof import("../../locales/src/messages/validators/en.json");
type IntlMessages = ZodMessages & ValidatorsMessages;
