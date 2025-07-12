import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateCareTaskInputSchema,
  ZDeleteCareTaskInputSchema,
  ZEditCareTaskInputSchema,
  ZGetCareTasksInputSchema,
  ZUnlockMoreTasksInputSchema,
} from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { T } from "../../../../../utils/locales";
import { kodixCareInstalledMiddleware } from "../../../../middlewares";
import { protectedProcedure } from "../../../../procedures";
import { createCareTaskHandler } from "./createCareTask.handler";
import { deleteCareTaskHandler } from "./deleteCareTask.handler";
import { editCareTaskHandler } from "./editCareTask";
import { getCareTasksHandler } from "./getCareTasks.handler";
import { syncCareTasksFromCalendarHandler } from "./syncCareTasksFromCalendar.handler";
import { unlockMoreTasksHandler } from "./unlockMoreTasks.handler";

export const careTaskRouter = {
  getCareTasks: protectedProcedure
    .input(ZGetCareTasksInputSchema)
    .use(kodixCareInstalledMiddleware)
    .query(async ({ ctx, input }) => {
      return getCareTasksHandler({
        ctx: ctx as TProtectedProcedureContext,
        input,
      });
    }),
  editCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZEditCareTaskInputSchema))
    .mutation(async ({ ctx, input }) => {
      return editCareTaskHandler({
        ctx: ctx as TProtectedProcedureContext,
        input,
      });
    }),
  unlockMoreTasks: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(ZUnlockMoreTasksInputSchema)
    .mutation(async ({ ctx, input }) => {
      return unlockMoreTasksHandler({
        ctx: ctx as TProtectedProcedureContext,
        input,
      });
    }),
  createCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareTaskInputSchema))
    .mutation(async ({ ctx, input }) => {
      return createCareTaskHandler({
        ctx: ctx as TProtectedProcedureContext,
        input,
      });
    }),
  deleteCareTask: protectedProcedure
    .input(ZDeleteCareTaskInputSchema)
    .mutation(deleteCareTaskHandler),
  syncCareTasksFromCalendar: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .mutation(async ({ ctx }) => {
      return syncCareTasksFromCalendarHandler({
        ctx: ctx as TProtectedProcedureContext,
      });
    }),
} satisfies TRPCRouterRecord;
