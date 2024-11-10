import { TRPCError } from "@trpc/server";

import type { ServerSideT } from "@kdx/locales";
import dayjs from "@kdx/dayjs";

import type { TProtectedProcedureContext } from "../../../procedures";

export const assertIsUserCareGiver = (
  ctx: TProtectedProcedureContext,
  caregiverId: string,
) => {
  if (ctx.auth.user.id !== caregiverId)
    return new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.You are not the caregiver for this shift"),
    });
};

export const assertCheckoutTimeIsAfterCheckInTime = (
  t: ServerSideT,
  {
    checkInTime,
    checkOut,
  }: {
    checkInTime: Date;
    checkOut: Date;
  },
) => {
  if (!dayjs(checkOut).isAfter(checkInTime))
    return new TRPCError({
      code: "BAD_REQUEST",
      message: t("api.Checkout time must be after checkin time"),
    });
};
