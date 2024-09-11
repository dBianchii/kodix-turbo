import type { TRPCRouterRecord } from "@trpc/server";

import { PKodixCare_CanToggleShiftId } from "@kdx/shared";
import {
  ZCheckEmailForRegisterInputSchema,
  ZDoCheckoutForShiftInputSchema,
  ZGetCareTasksInputSchema,
  ZSaveCareTaskInputSchema,
  ZSignInByPasswordInputSchema,
  ZUnlockMoreTasksInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import {
  appPermissionMiddleware,
  kodixCareInstalledMiddleware,
} from "../../../middlewares";
import { protectedProcedure, publicProcedure } from "../../../procedures";
import { checkEmailForRegisterHandler } from "./checkEmailForRegister.handler";
import { doCheckoutForShiftHandler } from "./doCheckoutForShift.handler";
import { getCareTasksHandler } from "./getCareTasks.handler";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";
import { saveCareTaskHandler } from "./saveCareTask.handler";
import { signInByPasswordHandler } from "./signInByPassword.handler";
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
    .query(getCurrentShiftHandler),
  saveCareTask: protectedProcedure
    .input(ZSaveCareTaskInputSchema)
    .mutation(saveCareTaskHandler),
  unlockMoreTasks: protectedProcedure
    .input(ZUnlockMoreTasksInputSchema)
    .mutation(unlockMoreTasksHandler),
  checkEmailForRegister: publicProcedure
    .input(ZCheckEmailForRegisterInputSchema)
    .query(checkEmailForRegisterHandler),
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
} satisfies TRPCRouterRecord;
