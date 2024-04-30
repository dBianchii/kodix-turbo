import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZGetConfigInput,
  ZInstallAppInputSchema,
  ZSaveConfigInput,
  ZUninstallAppInputSchema,
} from "@kdx/validators/trpc/app";

import { appInstalledMiddleware } from "../../middlewares";
import {
  isTeamOwnerProcedure,
  protectedProcedure,
  publicProcedure,
} from "../../procedures";
import { calendarRouter } from "./calendar/_router";
import { getAllHandler } from "./getAll.handler";
import { getConfigHandler } from "./getConfig.handler";
import { getInstalledHandler } from "./getInstalled.handler";
import { installAppHandler } from "./installApp.handler";
import { kodixCareRouter } from "./kodixCare/_router";
import { saveConfigHandler } from "./saveConfig.handler";
import { todoRouter } from "./todo/_router";
import { uninstallAppHandler } from "./uninstallApp.handler";

export const appRouter = {
  calendar: calendarRouter,
  kodixCare: kodixCareRouter,
  todo: todoRouter,
  getAll: publicProcedure.query(getAllHandler),
  getConfig: protectedProcedure
    .input(ZGetConfigInput)
    .use(appInstalledMiddleware)
    .query(getConfigHandler),
  getInstalled: protectedProcedure.query(getInstalledHandler),
  installApp: isTeamOwnerProcedure
    .input(ZInstallAppInputSchema)
    .mutation(installAppHandler),
  saveConfig: protectedProcedure
    .input(ZSaveConfigInput)
    .mutation(saveConfigHandler),
  uninstallApp: protectedProcedure
    .input(ZUninstallAppInputSchema)
    .mutation(uninstallAppHandler),
} satisfies TRPCRouterRecord;
