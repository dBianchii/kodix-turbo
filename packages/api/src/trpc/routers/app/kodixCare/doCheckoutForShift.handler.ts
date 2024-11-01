import { TRPCError } from "@trpc/server";

import type { TDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { eq } from "@kdx/db";
import { careShifts } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";

interface DoCheckoutForShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDoCheckoutForShiftInputSchema;
}

export const doCheckoutForShiftHandler = async ({
  ctx,
  input,
}: DoCheckoutForShiftOptions) => {
  const currentShift = await getCurrentShiftHandler({ ctx });

  if (!currentShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No current shift found"),
    });
  }
  if (currentShift.Caregiver.id !== ctx.auth.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.You are not the caregiver for this shift"),
    });
  if (dayjs(input.date).isBefore(dayjs(currentShift.checkOut)))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t("api.Checkout time must be after checkin time"),
    });

  await ctx.db
    .update(careShifts)
    .set({ checkOut: input.date })
    .where(eq(careShifts.id, currentShift.id));
};
