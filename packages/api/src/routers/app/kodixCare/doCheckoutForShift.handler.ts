import { TRPCError } from "@trpc/server";

import type { TDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";

interface DoCheckoutForShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDoCheckoutForShiftInputSchema;
}

export const doCheckoutForShiftHandler = async ({
  ctx,
  input,
}: DoCheckoutForShiftOptions) => {
  const currentShift = await getCurrentCareShiftHandler({ ctx });
  if (!currentShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No current shift found",
    });
  }
  if (currentShift.Caregiver.id !== ctx.session.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not the caregiver for this shift",
    });
  if (dayjs(input.date).isBefore(dayjs(currentShift.checkOut)))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Checkout time must be after checkin time",
    });

  await ctx.db
    .update(schema.careShifts)
    .set({ checkOut: input.date })
    .where(eq(schema.careShifts.id, currentShift.id));
};
