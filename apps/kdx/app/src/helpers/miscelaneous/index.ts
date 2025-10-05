import type { KodixAppId } from "@kodix/shared/db";
import type { TRPCClientErrorLike } from "@trpc/client";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kodix/shared/db";
import { getErrorMessage } from "@kodix/shared/utils";
import { toast } from "@kodix/ui/toast";

import type { KdxTRPCRouter } from "@kdx/api";

/**
 * @param error: TRPCClientError
 * @description This is the default toast error handler for trpc errors.
 */
export const trpcErrorToastDefault = (
  error: TRPCClientErrorLike<KdxTRPCRouter>,
) => {
  // const zodContentErrors = error.data?.zodError?.fieldErrors.content;
  // const zodFormErrors = error.data?.zodError?.formErrors;
  // toast.error(zodContentErrors?.[0] ?? zodFormErrors?.[0] ?? error.message);
  //? Undo this comment if needed

  const errorMessage = getErrorMessage(error);

  return toast.error(errorMessage);
};

/**
 * @description Pathname for each app (used for app url and app image url)
 */
export const appIdToPathname = {
  [kodixCareAppId]: "kodixCare",
  [calendarAppId]: "calendar",
  [todoAppId]: "todo",
} as const;
export type AppPathnames =
  (typeof appIdToPathname)[keyof typeof appIdToPathname];

const reverseRecord = <T extends PropertyKey, U extends PropertyKey>(
  input: Record<T, U>,
) => {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [value, key]),
  ) as Record<U, T>;
};
/**
 * @description Does exactly the opposite of appIdToPathname
 * @see appIdToPathname
 */
export const appPathnameToAppId = reverseRecord(appIdToPathname);

/**
 * @description Prefix for app urls (ex: /apps/kodixCare)
 */
export const appUrlPrefix = "/apps";

/**
 * @description Gets the app url from the app id
 */
export const getAppUrl = (appId: KodixAppId) => {
  const pathname = appIdToPathname[appId];
  return `${appUrlPrefix}/${pathname}` as const;
};

/**
 * @description Gets the app icon url from the app id
 */
export const getAppIconUrl = (appId: KodixAppId) => {
  const pathname = appIdToPathname[appId];
  return `/appIcons/${pathname}.png` as const;
};
