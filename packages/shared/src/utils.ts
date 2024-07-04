import { isRedirectError } from "next/dist/client/components/redirect";
import { customAlphabet } from "nanoid";
import { z } from "zod";

import { kdxProductionURL } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let window: any;

export const NANOID_SIZE = 12; //If this is changed, the regex in zNanoIdRegex in @kdx/validators must be updated
export const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyz",
  NANOID_SIZE,
);

/**
 * @description Base URL for the KDX server. Make sure that when developing, your KDX app is on localhost:3000
 */
export const getBaseKdxUrl = () => {
  if (typeof window !== "undefined") return "http://localhost:3000";
  if (process.env.VERCEL_URL) return kdxProductionURL;
  return `http://localhost:3000`;
};

/**
 * @description Base URL for the current environment.
 */
export const getBaseUrl = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof window !== "undefined") return window.location.origin as string;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
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
