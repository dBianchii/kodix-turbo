import { TRPCError } from "@trpc/server";

import type { TDoCheckoutForShiftInput } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";

import type { TProtectedProcedureContext } from "../../../trpc";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";

interface DoCheckoutForShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDoCheckoutForShiftInput;
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
  if (dayjs(input).isBefore(dayjs(currentShift.checkOut)))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Checkout time must be after checkin time",
    });

  await ctx.prisma.careShift.update({
    where: { id: currentShift.id },
    data: { checkOut: input },
  });
};
