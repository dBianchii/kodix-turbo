// Use type safe message keys with `next-intl`
//eslint-disable-next-line @typescript-eslint/consistent-type-imports
type GlobalMessages =
  typeof import("../../packages/locales/src/messages/en.json");
type ZodMessages =
  typeof import("../../packages/locales/src/messages/zod/en.json");
type ValidatorsMessages =
  typeof import("../../packages/locales/src/messages/validators/en.json");

type IntlMessages = GlobalMessages & ZodMessages & ValidatorsMessages;
