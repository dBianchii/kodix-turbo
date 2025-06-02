import { experimental_standaloneMiddleware, TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import { getAppName } from "@kdx/locales/next-intl/server-hooks";
import { chatAppId, getAppDependencies, kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "./procedures";
import { getInstalledHandler } from "./routers/app/getInstalled.handler";
import { t } from "./trpc";

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

/**
 * 🎯 NOVO: Middleware para validar se todas as dependências de um app estão instaladas
 * Este middleware verifica se um app específico e todas suas dependências estão instaladas
 */
const appWithDependenciesInstalledMiddlewareFactory = (appId: KodixAppId) =>
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
  }>().create(async ({ ctx, next }) => {
    const installedApps = await getInstalledHandler({ ctx });
    const installedAppIds = installedApps.map((app) => app.id);

    // Verificar se o app principal está instalado
    if (!installedAppIds.includes(appId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t("api.appName is not installed", {
          app: getAppName(ctx.t, appId),
        }),
      });
    }

    // Verificar se todas as dependências estão instaladas
    const dependencies = getAppDependencies(appId);
    const missingDependencies = dependencies.filter(
      (depId) => !installedAppIds.includes(depId),
    );

    if (missingDependencies.length > 0) {
      const missingAppNames = missingDependencies
        .map((depId) => getAppName(ctx.t, depId))
        .join(", ");

      console.error(
        `❌ [DEPENDENCIES] App ${appId} missing dependencies: ${missingDependencies.join(", ")}`,
      );

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Missing required dependencies: ${missingAppNames}`,
      });
    }

    return next({ ctx });
  });

/**
 * 🎯 MIDDLEWARE ESPECÍFICO: Chat requer AI Studio
 * Use este middleware em endpoints do Chat que precisam do AI Studio
 */
export const chatWithDependenciesMiddleware =
  appWithDependenciesInstalledMiddlewareFactory(chatAppId);

/**
 * 🎯 MIDDLEWARE DINÂMICO: Valida dependências baseado no input
 * Requer que o input tenha uma propriedade `appId`
 */
export const appWithDependenciesInstalledMiddleware =
  experimental_standaloneMiddleware<{
    ctx: TProtectedProcedureContext;
    input: { appId: KodixAppId };
  }>().create(async ({ ctx, input, next }) => {
    const installedApps = await getInstalledHandler({ ctx });
    const installedAppIds = installedApps.map((app) => app.id);

    // Verificar se o app principal está instalado
    if (!installedAppIds.includes(input.appId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t("api.appName is not installed", {
          app: getAppName(ctx.t, input.appId),
        }),
      });
    }

    // Verificar se todas as dependências estão instaladas
    const dependencies = getAppDependencies(input.appId);
    const missingDependencies = dependencies.filter(
      (depId) => !installedAppIds.includes(depId),
    );

    if (missingDependencies.length > 0) {
      const missingAppNames = missingDependencies
        .map((depId) => getAppName(ctx.t, depId))
        .join(", ");

      console.error(
        `❌ [DEPENDENCIES] App ${input.appId} missing dependencies: ${missingDependencies.join(", ")}`,
      );

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Missing required dependencies: ${missingAppNames}`,
      });
    }

    return next({ ctx });
  });

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
export const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});
