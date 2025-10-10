import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZGetAppActivityLogsInputSchema,
  ZGetConfigInput,
  ZGetUserAppTeamConfigInputSchema,
  ZInstallAppInputSchema,
  ZSaveConfigInput,
  ZSaveUserAppTeamConfigInputSchema,
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
import { getAppActivityLogsHandler } from "./getAppActivityLogs.handler";
import { getConfigHandler } from "./getConfig.handler";
import { getInstalledHandler } from "./getInstalled.handler";
import { getUserAppTeamConfigHandler } from "./getUserAppTeamConfig.handler";
import { installAppHandler } from "./installApp.handler";
import { kodixCareRouter } from "./kodixCare/_router";
import { saveConfigHandler } from "./saveConfig.handler";
import { saveUserAppTeamConfigHandler } from "./saveUserAppTeamConfig.handler";
import { todoRouter } from "./todo/_router";
import { uninstallAppHandler } from "./uninstallApp.handler";

export const appRouter = {
  calendar: calendarRouter,
  getAll: publicProcedure.query(getAllHandler),
  getAppActivityLogs: protectedProcedure
    .input(ZGetAppActivityLogsInputSchema)
    .use(appInstalledMiddleware)
    .query(getAppActivityLogsHandler),
  getConfig: protectedProcedure
    .input(ZGetConfigInput)
    .use(appInstalledMiddleware)
    .query(getConfigHandler),
  getInstalled: protectedProcedure.query(getInstalledHandler),
  getUserAppTeamConfig: protectedProcedure
    .input(ZGetUserAppTeamConfigInputSchema)
    .use(appInstalledMiddleware)
    .query(getUserAppTeamConfigHandler),
  installApp: isTeamOwnerProcedure
    .input(ZInstallAppInputSchema)
    .mutation(installAppHandler),
  kodixCare: kodixCareRouter,
  saveConfig: protectedProcedure
    .input(ZSaveConfigInput)
    .mutation(saveConfigHandler),
  saveUserAppTeamConfig: protectedProcedure
    .input(ZSaveUserAppTeamConfigInputSchema)
    .use(appInstalledMiddleware)
    .mutation(saveUserAppTeamConfigHandler),
  todo: todoRouter,
  uninstallApp: isTeamOwnerProcedure
    .input(ZUninstallAppInputSchema)
    .mutation(uninstallAppHandler),
} satisfies TRPCRouterRecord;
