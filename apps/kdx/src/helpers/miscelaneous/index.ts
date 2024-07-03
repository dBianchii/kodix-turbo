import type { TRPCClientErrorLike } from "@trpc/client";

import type { AppRouter } from "@kdx/api";
import type { KodixAppId } from "@kdx/shared";
import {
  calendarAppId,
  getErrorMessage,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";
import { toast } from "@kdx/ui/toast";

/**
 * @param error: TRPCClientError
 * @description This is the default toast error handler for trpc errors.
 */
export const trpcErrorToastDefault = (
  error: TRPCClientErrorLike<AppRouter>,
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
