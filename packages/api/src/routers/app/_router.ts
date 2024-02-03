import { ZGetConfigInput, ZSaveConfigInput } from "@kdx/validators/trpc/app";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { getAllHandler } from "./getAll.handler";
import { getConfigHandler } from "./getConfig.handler";
import { getInstalledHandler } from "./getInstalled.handler";
import { kodixCareRouter } from "./kodixCare/_router";
import { saveConfigHandler } from "./saveConfig.handler";
import { todoRouter } from "./todo/_router";

export const appRouter = createTRPCRouter({
  kodixCare: kodixCareRouter,
  todo: todoRouter,
  getAll: publicProcedure.query(async (opts) => await getAllHandler(opts)),
  getConfig: protectedProcedure
    .input(ZGetConfigInput)
    .query(async (opts) => await getConfigHandler(opts)),
  getInstalled: protectedProcedure.query(
    async (opts) => await getInstalledHandler(opts),
  ),
  saveConfig: protectedProcedure //TODO: dynamically check if app is installed?
    .input(ZSaveConfigInput)
    .mutation(async (opts) => await saveConfigHandler(opts)),
});