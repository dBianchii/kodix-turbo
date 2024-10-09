import { isRedirectError } from "next/dist/client/components/redirect";
import { z } from "zod";

import { KDX_PRODUCTION_URL, KDX_VERCEL_PROJECT_NAME } from "./constants";

/**
 * @description Base URL for the current environment.
 */
export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) {
    if (
      process.env.VERCEL_URL.includes(`${KDX_VERCEL_PROJECT_NAME}-`) &&
      process.env.VERCEL_ENV === "production"
    )
      return KDX_PRODUCTION_URL;
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

/**
 * @description Extracts successes and errors from promise.allSettled in a typesafe maner
 */
export const getSuccessesAndErrors = <T>(
  results: PromiseSettledResult<T>[],
) => {
  const errors = results.filter((x) => x.status === "rejected");
  const successes = results.filter(
    (x): x is PromiseFulfilledResult<T> => x.status === "fulfilled",
  );

  return { successes, errors };
};

/**
 * @description Gets the error message
 */
export function getErrorMessage(err: unknown) {
  const unknownError = "Something went wrong, please try again later.";

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return errors.join("\n");
  }
  if (err instanceof Error) return err.message;
  if (isRedirectError(err)) throw err;

  return unknownError;
}

export const objectGroupBy = <T, K extends keyof T>(
  arr: T[],
  key: K,
): Record<string, T[]> => {
  return arr.reduce(
    (acc, item) => {
      const group = item[key] as string;
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
};
