// Use type safe message keys with `next-intl`
type ZodMessages =
  typeof import("../../../packages/locales/src/messages/zod/en.json");
type ValidatorsMessages =
  typeof import("../../../packages/locales/src/messages/validators/en.json");
type CareExpoMessages =
  typeof import("../../../packages/locales/src/messages/care-expo/en.json");

type IntlMessages = ZodMessages & ValidatorsMessages & CareExpoMessages;
