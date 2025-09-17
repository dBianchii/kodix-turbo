import type { formats } from "@kdx/locales";

//? @kdx/kdx should only use "kdx" json
type KdxMessages = typeof import("./messages/kdx/en.json");
type ApiMessages = typeof import("./messages/api/en.json");
type CareExpoMessages = typeof import("./messages/care-expo/en.json");
type ValidatorsMessages = typeof import("./messages/validators/en.json");

type Formats = typeof formats;

declare global {
  type IntlMessages = KdxMessages &
    ApiMessages &
    CareExpoMessages &
    ValidatorsMessages;
  type IntlFormats = Formats;
}
