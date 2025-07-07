import z from "zod/v4";

/**
 * @description Base URL for the current environment.
 */
export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    if (process.env.VERCEL_ENV === "production")
      return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
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
 * @description A typesafe Object.entries
 */
export const typedObjectEntries = <T extends object>(
  obj: T,
): [keyof T, T[keyof T]][] => Object.entries(obj) as [keyof T, T[keyof T]][];

/**
 * @description A typesafe Object.keys
 */
export const typedObjectKeys = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

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

  return unknownError;
}
