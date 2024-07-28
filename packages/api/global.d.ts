// Use type safe message keys with `next-intl`
//eslint-disable-next-line @typescript-eslint/consistent-type-imports
type GlobalMessages = typeof import("../locales/src/messages/en.json");
type ZodMessages = typeof import("../locales/src/messages/zod/en.json");
type IntlMessages = GlobalMessages & ZodMessages;
