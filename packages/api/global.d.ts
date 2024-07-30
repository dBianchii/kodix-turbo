// Use type safe message keys with `next-intl`
type GlobalMessages = typeof import("../locales/src/messages/en.json");
type ZodMessages = typeof import("../locales/src/messages/zod/en.json");
type ValidatorsMessages =
  typeof import("../locales/src/messages/validators/en.json");
type IntlMessages = GlobalMessages & ZodMessages & ValidatorsMessages;
