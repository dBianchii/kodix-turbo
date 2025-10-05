import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCheckEmailForRegisterInputSchema,
  ZCreateCareShiftInputSchema,
  ZDeleteCareShiftInputSchema,
  ZEditCareShiftInputSchema,
  ZFindOverlappingShiftsInputSchema,
  ZSignInByPasswordInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import { T } from "../../../../utils/locales";
import { kodixCareInstalledMiddleware } from "../../../middlewares";
import { protectedProcedure, publicProcedure } from "../../../procedures";
import { careTaskRouter } from "./careTask/_router";
import { checkEmailForRegisterHandler } from "./checkEmailForRegister.handler";
import { createCareShiftHandler } from "./createCareShift.handler";
import { deleteCareShiftHandler } from "./deleteCareShift.handler";
import { editCareShiftHandler } from "./editCareShift.handler";
import { findOverlappingShiftsHandler } from "./findOverlappingShifts.handler";
import { getAllCaregiversHandler } from "./getAllCaregivers.handler";
import { getAllCareShiftsHandler } from "./getAllCareShifts.handler";
import { signInByPasswordHandler } from "./signInByPassword.handler";

export const kodixCareRouter = {
  careTask: careTaskRouter,

  checkEmailForRegister: publicProcedure
    .input(ZCheckEmailForRegisterInputSchema)
    .query(checkEmailForRegisterHandler),
  createCareShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareShiftInputSchema))
    .mutation(createCareShiftHandler),
  deleteCareShift: protectedProcedure
    .input(ZDeleteCareShiftInputSchema)
    .mutation(deleteCareShiftHandler),
  editCareShift: protectedProcedure
    .input(T(ZEditCareShiftInputSchema))
    .mutation(editCareShiftHandler),
  findOverlappingShifts: protectedProcedure
    .input(ZFindOverlappingShiftsInputSchema)
    .query(findOverlappingShiftsHandler),
  getAllCaregivers: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(getAllCaregiversHandler),
  getAllCareShifts: protectedProcedure.query(getAllCareShiftsHandler),
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
} satisfies TRPCRouterRecord;
