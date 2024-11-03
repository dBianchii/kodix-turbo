import type { useTranslations } from "next-intl";
import type { getTranslations } from "next-intl/server";
import type { Formats } from "use-intl";

export const locales = ["pt-BR", "en"] as const;
export type Locales = (typeof locales)[number];
export const defaultLocale = "pt-BR";

export const formats = {
  dateTime: {
    short: {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    },
    medium: {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
    long: {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
    full: {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    },
    extensive: {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    },
  },
} satisfies Formats;

//TODO: figure out how to make typed namespaces work. (Both with i18n-ally and next-intl/use-intl)
type TranslationKeys = never;
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
