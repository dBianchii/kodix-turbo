import { kdxProductionURL } from "./constants";

/**
 * @description Base URL for the KDX server. Make sure that when developing, your KDX app is on localhost:3000
 * @usedBy kdx/stays-ai kdx/kodix-care
 */
export const getBaseKdxUrl = () => {
  if (typeof window !== "undefined") return "http://localhost:3000";
  if (process.env.VERCEL_URL) return kdxProductionURL;
  return `http://localhost:3000`;
};

/**
 * @description Base URL for the current environment.
 * @usedBy kdx/kdx
 */
export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

/**
 * @description Extracts successes and errors from promise.allSettled in a typesafe maner
 * @usedBy kdx/api
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
