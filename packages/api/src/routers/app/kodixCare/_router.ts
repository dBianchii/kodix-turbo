import { kodixCareAdminRoleId, kodixCareCareGiverRoleId } from "@kdx/shared";

import {
  kodixCareInstalledMiddleware,
  roleMiddlewareOR,
} from "../../../middlewares";
import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";
import { onboardingCompletedHandler } from "./onboardingCompleted.handler";
import { startShiftHandler } from "./startShift.handler";

export const kodixCareRouter = createTRPCRouter({
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(async (opts) => await getCurrentCareShiftHandler(opts)),
  onboardingCompleted: protectedProcedure.query(
    async (opts) => await onboardingCompletedHandler(opts),
  ),
  startShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(roleMiddlewareOR([kodixCareCareGiverRoleId, kodixCareAdminRoleId]))
    .mutation(async (opts) => await startShiftHandler(opts)),
});
