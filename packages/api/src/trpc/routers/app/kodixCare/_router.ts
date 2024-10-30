import type { TRPCRouterRecord } from "@trpc/server";

import { PKodixCare_CanToggleShiftId } from "@kdx/shared";
import {
  ZCheckEmailForRegisterInputSchema,
  ZDoCheckoutForShiftInputSchema,
  ZSignInByPasswordInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import { T } from "../../../../utils/locales";
import {
  appPermissionMiddleware,
  kodixCareInstalledMiddleware,
} from "../../../middlewares";
import { protectedProcedure, publicProcedure } from "../../../procedures";
import { careTaskRouter } from "./careTask/_router";
import { checkEmailForRegisterHandler } from "./checkEmailForRegister.handler";
import { doCheckoutForShiftHandler } from "./doCheckoutForShift.handler";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";
import { signInByPasswordHandler } from "./signInByPassword.handler";
import { toggleShiftHandler } from "./toggleShift.handler";

export const kodixCareRouter = {
  careTask: careTaskRouter,
  toggleShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(appPermissionMiddleware(PKodixCare_CanToggleShiftId))
    .mutation(toggleShiftHandler),
  doCheckoutForShift: protectedProcedure
    .input(T(ZDoCheckoutForShiftInputSchema))
    .use(kodixCareInstalledMiddleware)
    .mutation(doCheckoutForShiftHandler),
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(getCurrentShiftHandler),
  checkEmailForRegister: publicProcedure
    .input(ZCheckEmailForRegisterInputSchema)
    .query(checkEmailForRegisterHandler),
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
} satisfies TRPCRouterRecord;
