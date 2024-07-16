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
import { createTRPCRouter } from "../../trpc";
import { calendarRouter } from "./calendar/_calendar.router";
import { getAllHandler } from "./getAll.handler";
import { getConfigHandler } from "./getConfig.handler";
import { getInstalledHandler } from "./getInstalled.handler";
import { installAppHandler } from "./installApp.handler";
import { kodixCareRouter } from "./kodixCare/_kodixCare.router";
import { saveConfigHandler } from "./saveConfig.handler";
import { todoRouter } from "./todo/_todo.router";
import { uninstallAppHandler } from "./uninstallApp.handler";

export const appRouter = createTRPCRouter({
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
  uninstallApp: isTeamOwnerProcedure
    .input(ZUninstallAppInputSchema)
    .mutation(uninstallAppHandler),
});
