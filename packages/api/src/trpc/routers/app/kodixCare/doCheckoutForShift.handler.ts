import { TRPCError } from "@trpc/server";

import type { TDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { getKodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";

interface DoCheckoutForShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDoCheckoutForShiftInputSchema;
}

export const doCheckoutForShiftHandler = async ({
  ctx,
  input,
}: DoCheckoutForShiftOptions) => {
  const kodixCareRepository = getKodixCareRepository(getTeamDbFromCtx(ctx));

  const currentShift = await kodixCareRepository.getCurrentCareShift();

  if (!currentShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No current shift found"),
    });
  }

  if (currentShift.shiftEndedAt) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t("api.Shift has already ended"),
    });
  }

  if (currentShift.Caregiver.id !== ctx.auth.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.You are not the caregiver for this shift"),
    });
  if (dayjs(input.date).isBefore(dayjs(currentShift.checkIn)))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t("api.Checkout time must be after checkin time"),
    });

  await kodixCareRepository.updateCareShift({
    id: currentShift.id,
    input: {
      checkOut: input.date,
      shiftEndedAt: input.date,
      notes: input.notes,
    },
  });
};
