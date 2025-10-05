import type { NamespaceKeys, NestedKeyOf, useTranslations } from "next-intl";
import type { getTranslations } from "next-intl/server";
import type { Formats } from "use-intl";

export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = "pt-BR";

import type { Messages } from "next-intl";

export const formats = {
  dateTime: {
    extensive: {
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      month: "long",
      year: "numeric",
    },
    full: {
      day: "2-digit",
      month: "long",
      weekday: "long",
      year: "numeric",
    },
    long: {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
    medium: {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
    short: {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    },
    shortWithHours: {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      year: "2-digit",
    },
  },
} satisfies Formats;

type AllowedMessageKeys = NamespaceKeys<Messages, NestedKeyOf<Messages>>;

type TranslationKeys = AllowedMessageKeys;
export type ServerSideT<S extends TranslationKeys = never> = Awaited<
  ReturnType<typeof getTranslations<S>>
>;
export type ClientSideT<S extends TranslationKeys = never> = ReturnType<
  typeof useTranslations<S>
>;
export type IsomorficT<S extends TranslationKeys = never> =
  | ServerSideT<S>
  | ClientSideT<S>; //This type is the same type as use-intl's useTranslations.

// type Paths<Schema, Path extends string = ""> = Schema extends string
//   ? Path
//   : Schema extends object
//     ? {
//         [K in keyof Schema & string]: Paths<
//           Schema[K],
//           `${Path}${Path extends "" ? "" : "."}${K}`
//         >;
//       }[keyof Schema & string]
//     : never;

// type Messages = Paths<IntlMessages>;
