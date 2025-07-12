import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCheckEmailForRegisterInputSchema,
  ZCreateCareShiftInputSchema,
  ZDeleteCareShiftInputSchema,
  ZEditCareShiftInputSchema,
  ZFindOverlappingShiftsInputSchema,
  ZSignInByPasswordInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import type { TProtectedProcedureContext } from "../../../procedures";
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
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
  getAllCareShifts: protectedProcedure.query(getAllCareShiftsHandler),
  createCareShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .input(T(ZCreateCareShiftInputSchema))
    .mutation(async ({ ctx, input }) => {
      // Type-safe wrapper que garante contexto correto
      return createCareShiftHandler({
        ctx: ctx as TProtectedProcedureContext,
        input,
      });
    }),
  getAllCaregivers: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(async ({ ctx }) => {
      // Type-safe wrapper que garante contexto correto
      return getAllCaregiversHandler({
        ctx: ctx as TProtectedProcedureContext,
      });
    }),
  findOverlappingShifts: protectedProcedure
    .input(ZFindOverlappingShiftsInputSchema)
    .query(findOverlappingShiftsHandler),
  editCareShift: protectedProcedure
    .input(T(ZEditCareShiftInputSchema))
    .mutation(editCareShiftHandler),
  deleteCareShift: protectedProcedure
    .input(ZDeleteCareShiftInputSchema)
    .mutation(deleteCareShiftHandler),
} satisfies TRPCRouterRecord;
