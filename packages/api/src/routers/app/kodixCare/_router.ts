import { kodixCareAdminRoleId, kodixCareCareGiverRoleId } from "@kdx/shared";
import { ZDoCheckoutForShiftInput } from "@kdx/validators/trpc/app/kodixCare";

import {
  kodixCareInstalledMiddleware,
  roleMiddlewareOR,
} from "../../../middlewares";
import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import { doCheckoutForShiftHandler } from "./doCheckoutForShift.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";
import { onboardingCompletedHandler } from "./onboardingCompleted.handler";
import { toggleShiftHandler } from "./toggleShift.handler";

export const kodixCareRouter = createTRPCRouter({
  toggleShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(roleMiddlewareOR([kodixCareCareGiverRoleId, kodixCareAdminRoleId]))
    .mutation(async (opts) => await toggleShiftHandler(opts)),
  doCheckoutForShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(ZDoCheckoutForShiftInput)
    .mutation(async (opts) => await doCheckoutForShiftHandler(opts)),
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(async (opts) => await getCurrentCareShiftHandler(opts)),
  onboardingCompleted: protectedProcedure.query(
    async (opts) => await onboardingCompletedHandler(opts),
  ),
});
