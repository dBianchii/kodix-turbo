import type { TRPCRouterRecord } from "@trpc/server";

import { ZGetConfigInput, ZSaveConfigInput } from "@kdx/validators/trpc/app";

import { appInstalledMiddleware } from "../../middlewares";
import { protectedProcedure, publicProcedure } from "../../procedures";
import { calendarRouter } from "./calendar/_router";
import { getAllHandler } from "./getAll.handler";
import { getConfigHandler } from "./getConfig.handler";
import { getInstalledHandler } from "./getInstalled.handler";
import { kodixCareRouter } from "./kodixCare/_router";
import { saveConfigHandler } from "./saveConfig.handler";
import { todoRouter } from "./todo/_router";

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
  saveConfig: protectedProcedure
    .input(ZSaveConfigInput)
    .mutation(saveConfigHandler),
} satisfies TRPCRouterRecord;
