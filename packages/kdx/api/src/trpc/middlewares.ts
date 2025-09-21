import type { KodixAppId } from "@kodix/shared/db";
import { kodixCareAppId } from "@kodix/shared/db";
import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import { getAppName } from "@kdx/locales/next-intl/server-hooks";

import type { TProtectedProcedureContext } from "./procedures";
import { getInstalledHandler } from "./routers/app/getInstalled.handler";

/**
 *  Helper/factory that returns a reusable middleware that checks if a certain app is installed for the current team
 */
const appInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    //? By using the `getInstalledHandler`, we can use cached data, improving performance
    const apps = await getInstalledHandler({ ctx });

    if (!apps.some((app) => app.id === appId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t("api.appName is not installed", {
          app: getAppName(ctx.t, appId),
        }),
      });
    }

    return next({ ctx });
  });

export const kodixCareInstalledMiddleware =
  appInstalledMiddlewareFactory(kodixCareAppId);

/**
 * Same middleware as what is returned by `appInstalledMiddlewareFactory` but does it dynamically based on appId input.
 * This requires the input to have a `appId` as a property.
 */
export const appInstalledMiddleware = experimental_standaloneMiddleware<{
  ctx: TProtectedProcedureContext;
  input: { appId: KodixAppId };
}>().create(async ({ ctx, input, next }) => {
  //? By using the `getInstalledHandler`, we can use cached data, improving performance
  const installed = await getInstalledHandler({ ctx });

  if (!installed.some((app) => app.id === input.appId)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ctx.t("api.appName is not installed", {
        app: getAppName(ctx.t, input.appId),
      }),
    });
  }

  return next({ ctx });
});
