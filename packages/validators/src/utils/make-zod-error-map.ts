/**
 * This error map is a modified version of the one used by zod-i18n
 * Checkout the original at: https://github.com/aiji42/zod-i18n
 */

import type { useTranslations } from "next-intl";
import type { ZodErrorMap } from "zod";
import { defaultErrorMap, ZodIssueCode, ZodParsedType } from "zod";

import type { customErrorsNs, formNs, zodNs } from "./zod-namespaces";

const jsonStringifyReplacer = (_: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

function joinValues<T extends unknown[]>(array: T, separator = " | "): string {
  return array
    .map((val) => (typeof val === "string" ? `'${val}'` : val))
    .join(separator);
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;

  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) return false;
  }

  return true;
};

const getKeyAndValues = (
  param: unknown,
  defaultKey: string,
): {
  values: Record<string, unknown>;
  key: string;
} => {
  if (typeof param === "string") return { key: param, values: {} };

  if (isRecord(param)) {
    const key =
      "key" in param && typeof param.key === "string" ? param.key : defaultKey;
    const values =
      "values" in param && isRecord(param.values) ? param.values : {};
    return { key, values };
  }

  return { key: defaultKey, values: {} };
};

interface ZodI18nMapOption {
  t: ReturnType<typeof useTranslations<typeof zodNs>>;
  tForm?: ReturnType<typeof useTranslations<typeof formNs>>;
  tCustom?: ReturnType<typeof useTranslations<typeof customErrorsNs>>;
  ns?: string | readonly string[];
}

type MakeZodI18nMap = (option: ZodI18nMapOption) => ZodErrorMap;

export const makeZodI18nMap: MakeZodI18nMap = (option) => (issue, ctx) => {
  const { t, tForm, tCustom } = {
    ...option,
  };

  let message: string;
  message = defaultErrorMap(issue, ctx).message;

  const path =
    issue.path.length > 0 && !!tForm
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tForm(issue.path.join(".") as any)
      : "missingTranslation";

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = t("errors.invalid_type_received_undefined", {
          path,
        });
      } else {
        message = t("errors.invalid_type", {
          expected: t(`types.${issue.expected}`),
          received: t(`types.${issue.received}`),
          path,
        });
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = t("errors.invalid_literal", {
        expected: JSON.stringify(issue.expected, jsonStringifyReplacer),
        path,
      });
      break;
    case ZodIssueCode.unrecognized_keys:
      message = t("errors.unrecognized_keys", {
        keys: joinValues(issue.keys, ", "),
        count: issue.keys.length,
        path,
      });
      break;
    case ZodIssueCode.invalid_union:
      message = t("errors.invalid_union", {
        path,
      });
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = t("errors.invalid_union_discriminator", {
        options: joinValues(issue.options),
        path,
      });
      break;
    case ZodIssueCode.invalid_enum_value:
      message = t("errors.invalid_enum_value", {
        options: joinValues(issue.options),
        received: issue.received,
        path,
      });
      break;
    case ZodIssueCode.invalid_arguments:
      message = t("errors.invalid_arguments", {
        path,
      });
      break;
    case ZodIssueCode.invalid_return_type:
      message = t("errors.invalid_return_type", {
        path,
      });
      break;
    case ZodIssueCode.invalid_date:
      message = t("errors.invalid_date", {
        path,
      });
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("startsWith" in issue.validation) {
          message = t("errors.invalid_string.startsWith", {
            startsWith: issue.validation.startsWith,
            path,
          });
        } else if ("endsWith" in issue.validation) {
          message = t("errors.invalid_string.endsWith", {
            endsWith: issue.validation.endsWith,
            path,
          });
        }
      } else {
        message = t(`errors.invalid_string.${issue.validation}`, {
          validation: t(`validations.${issue.validation}`),
          path,
        });
      }
      break;
    case ZodIssueCode.too_small: {
      const minimum =
        issue.type === "date"
          ? new Date(issue.minimum as number)
          : (issue.minimum as number);
      message = t(
        `errors.too_small.${issue.type}.${
          issue.exact
            ? "exact"
            : issue.inclusive
              ? "inclusive"
              : "not_inclusive"
        }`,
        {
          minimum,
          count: typeof minimum === "number" ? minimum : undefined,
          path,
        },
      );
      break;
    }
    case ZodIssueCode.too_big: {
      const maximum =
        issue.type === "date"
          ? new Date(issue.maximum as number)
          : (issue.maximum as number);
      message = t(
        `errors.too_big.${issue.type}.${
          issue.exact
            ? "exact"
            : issue.inclusive
              ? "inclusive"
              : "not_inclusive"
        }`,
        {
          maximum,
          count: typeof maximum === "number" ? maximum : undefined,
          path,
        },
      );
      break;
    }
    case ZodIssueCode.custom: {
      const { key, values } = getKeyAndValues(
        issue.params?.i18n,
        "errors.custom",
      );

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      message = (tCustom || t)(key as Parameters<typeof t>[0], {
        ...values,
        path,
      });
      break;
    }
    case ZodIssueCode.invalid_intersection_types:
      message = t("errors.invalid_intersection_types", {
        path,
      });
      break;
    case ZodIssueCode.not_multiple_of:
      message = t("errors.not_multiple_of", {
        multipleOf: issue.multipleOf as number,
        path,
      });
      break;
    case ZodIssueCode.not_finite:
      message = t("errors.not_finite", {
        path,
      });
      break;
    default:
  }

  return { message };
};
