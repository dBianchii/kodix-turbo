import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCheckEmailForRegisterInputSchema,
  ZCreateCareShiftInputSchema,
  ZFindOverlappingShiftsInputSchema,
  ZSignInByPasswordInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import { T } from "../../../../utils/locales";
import { kodixCareInstalledMiddleware } from "../../../middlewares";
import { protectedProcedure, publicProcedure } from "../../../procedures";
import { careTaskRouter } from "./careTask/_router";
import { checkEmailForRegisterHandler } from "./checkEmailForRegister.handler";
import { createCareShiftHandler } from "./createCareShift.handler";
import { findOverlappingShiftsHandler } from "./findOverlappingShifts.handler";
import { getAllCaregiversHandler } from "./getAllCaregivers.handler";
import { getAllCareShiftsHandler } from "./getAllCareShifts.handler";
import { signInByPasswordHandler } from "./signInByPassword.handler";

export const kodixCareRouter = {
  careTask: careTaskRouter,

  checkEmailForRegister: publicProcedure
    .input(ZCheckEmailForRegisterInputSchema)
    .query(checkEmailForRegisterHandler),
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
  getAllCareShifts: protectedProcedure.query(getAllCareShiftsHandler),
  createCareShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareShiftInputSchema))
    .mutation(createCareShiftHandler),
  getAllCaregivers: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(getAllCaregiversHandler),
  findOverlappingShifts: protectedProcedure
    .input(ZFindOverlappingShiftsInputSchema)
    .query(findOverlappingShiftsHandler),
} satisfies TRPCRouterRecord;
