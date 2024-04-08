import type { TRPCRouterRecord } from "@trpc/server";

import { PKodixCare_CanToggleShiftId } from "@kdx/shared";
import {
  ZDoCheckoutForShiftInputSchema,
  ZGetCareTasksInputSchema,
  ZSaveCareTaskInputSchema,
  ZUnlockMoreTasksInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import {
  appPermissionMiddleware,
  kodixCareInstalledMiddleware,
} from "../../../middlewares";
import { protectedProcedure } from "../../../procedures";
import { doCheckoutForShiftHandler } from "./doCheckoutForShift.handler";
import { getCareTasksHandler } from "./getCareTasks.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";
import { onboardingCompletedHandler } from "./onboardingCompleted.handler";
import { saveCareTaskHandler } from "./saveCareTask.handler";
import { toggleShiftHandler } from "./toggleShift.handler";
import { unlockMoreTasksHandler } from "./unlockMoreTasks.handler";

export const kodixCareRouter = {
  toggleShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(appPermissionMiddleware(PKodixCare_CanToggleShiftId))
    .mutation(toggleShiftHandler),
  doCheckoutForShift: protectedProcedure
    .input(ZDoCheckoutForShiftInputSchema)
    .use(kodixCareInstalledMiddleware)
    .mutation(doCheckoutForShiftHandler),
  getCareTasks: protectedProcedure
    .input(ZGetCareTasksInputSchema)
    .use(kodixCareInstalledMiddleware)
    .query(getCareTasksHandler),
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(getCurrentCareShiftHandler),
  saveCareTask: protectedProcedure
    .input(ZSaveCareTaskInputSchema)
    .mutation(saveCareTaskHandler),
  onboardingCompleted: protectedProcedure.query(onboardingCompletedHandler),
  unlockMoreTasks: protectedProcedure
    .input(ZUnlockMoreTasksInputSchema)
    .mutation(unlockMoreTasksHandler),
} satisfies TRPCRouterRecord;
