import type { TRPCRouterRecord } from "@trpc/server";

import {
  PKodixCare_CanCreateCareTask,
  PKodixCare_CanDeleteCareTask,
  PKodixCare_CanToggleShiftId,
} from "@kdx/shared";
import {
  ZCheckEmailForRegisterInputSchema,
  ZCreateCareTaskInputSchema,
  ZDeleteCareTaskInputSchema,
  ZDoCheckoutForShiftInputSchema,
  ZEditCareTaskInputSchema,
  ZGetCareTasksInputSchema,
  ZSignInByPasswordInputSchema,
  ZUnlockMoreTasksInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import { T } from "../../../../utils/locales";
import {
  appPermissionMiddleware,
  kodixCareInstalledMiddleware,
} from "../../../middlewares";
import { protectedProcedure, publicProcedure } from "../../../procedures";
import { checkEmailForRegisterHandler } from "./checkEmailForRegister.handler";
import { createCareTaskHandler } from "./createCareTask.handler";
import { deleteCareTaskHandler } from "./deleteCareTask.handler";
import { doCheckoutForShiftHandler } from "./doCheckoutForShift.handler";
import { editCareTaskHandler } from "./editCareTask";
import { getCareTasksHandler } from "./getCareTasks.handler";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";
import { signInByPasswordHandler } from "./signInByPassword.handler";
import { syncCareTasksFromCalendarHandler } from "./syncCareTasksFromCalendar.handler";
import { toggleShiftHandler } from "./toggleShift.handler";
import { unlockMoreTasksHandler } from "./unlockMoreTasks.handler";

export const kodixCareRouter = {
  toggleShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(appPermissionMiddleware(PKodixCare_CanToggleShiftId))
    .mutation(toggleShiftHandler),
  doCheckoutForShift: protectedProcedure
    .input(T(ZDoCheckoutForShiftInputSchema))
    .use(kodixCareInstalledMiddleware)
    .mutation(doCheckoutForShiftHandler),
  getCareTasks: protectedProcedure
    .input(ZGetCareTasksInputSchema)
    .use(kodixCareInstalledMiddleware)
    .query(getCareTasksHandler),
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(getCurrentShiftHandler),
  editCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZEditCareTaskInputSchema))
    .mutation(editCareTaskHandler),
  unlockMoreTasks: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(ZUnlockMoreTasksInputSchema)
    .mutation(unlockMoreTasksHandler),
  checkEmailForRegister: publicProcedure
    .input(ZCheckEmailForRegisterInputSchema)
    .query(checkEmailForRegisterHandler),
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
  syncCareTasksFromCalendar: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .mutation(syncCareTasksFromCalendarHandler),
  createCareTask: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(appPermissionMiddleware(PKodixCare_CanCreateCareTask))
    .input(T(ZCreateCareTaskInputSchema))
    .mutation(createCareTaskHandler),
  deleteCareTask: protectedProcedure
    .use(appPermissionMiddleware(PKodixCare_CanDeleteCareTask))
    .input(ZDeleteCareTaskInputSchema)
    .mutation(deleteCareTaskHandler),
} satisfies TRPCRouterRecord;
