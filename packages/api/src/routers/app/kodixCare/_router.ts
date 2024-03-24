import type { TRPCRouterRecord } from "@trpc/server";

import { PKodixCare_CanToggleShiftId } from "@kdx/shared";
import {
  ZDoCheckoutForShiftInputSchema,
  ZGetCareTasksInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import {
  appPermissionMiddleware,
  kodixCareInstalledMiddleware,
} from "../../../middlewares";
import { protectedProcedure } from "../../../trpc";
import { doCheckoutForShiftHandler } from "./doCheckoutForShift.handler";
import { getCareTasksHandler } from "./getCareTasks.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";
import { onboardingCompletedHandler } from "./onboardingCompleted.handler";
import { toggleShiftHandler } from "./toggleShift.handler";

export const kodixCareRouter = {
  toggleShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(appPermissionMiddleware(PKodixCare_CanToggleShiftId))
    .mutation(async (opts) => await toggleShiftHandler(opts)),
  doCheckoutForShift: protectedProcedure
    .input(ZDoCheckoutForShiftInputSchema)
    .use(kodixCareInstalledMiddleware)
    .mutation(async (opts) => await doCheckoutForShiftHandler(opts)),
  getCareTasks: protectedProcedure
    .input(ZGetCareTasksInputSchema)
    .use(kodixCareInstalledMiddleware)
    .query(async (opts) => await getCareTasksHandler(opts)),
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(async (opts) => await getCurrentCareShiftHandler(opts)),
  onboardingCompleted: protectedProcedure.query(
    async (opts) => await onboardingCompletedHandler(opts),
  ),
} satisfies TRPCRouterRecord;
