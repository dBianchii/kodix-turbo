import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateCareTaskInputSchema,
  ZDeleteCareTaskInputSchema,
  ZEditCareTaskInputSchema,
  ZGetCareTasksInputSchema,
  ZUnlockMoreTasksInputSchema,
} from "@kdx/validators/trpc/app/kodixCare/careTask";

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
    .query(getCareTasksHandler),
  editCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZEditCareTaskInputSchema))
    .mutation(editCareTaskHandler),
  unlockMoreTasks: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(ZUnlockMoreTasksInputSchema)
    .mutation(unlockMoreTasksHandler),
  createCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareTaskInputSchema))
    .mutation(createCareTaskHandler),
  deleteCareTask: protectedProcedure
    .input(ZDeleteCareTaskInputSchema)
    .mutation(deleteCareTaskHandler),
  syncCareTasksFromCalendar: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .mutation(syncCareTasksFromCalendarHandler),
} satisfies TRPCRouterRecord;
