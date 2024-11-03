import type { TDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import {
  getCurrentCareShiftByTeamId,
  updateCareShift,
} from "@kdx/db/kodixCare";

import type { TProtectedProcedureContext } from "../../../procedures";
import { protectedMutationFetchFirst } from "../../../protectedFetchAndMutations";
import {
  assertCheckoutTimeIsAfterCheckInTime,
  assertIsUserCareGiver,
} from "./_kodixCare.permissions";

interface DoCheckoutForShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDoCheckoutForShiftInputSchema;
}

export const doCheckoutForShiftHandler = async ({
  ctx,
  input,
}: DoCheckoutForShiftOptions) => {
  await protectedMutationFetchFirst({
    fetch: async () => getCurrentCareShiftByTeamId(ctx.auth.user.activeTeamId),
    notFoundMessage: ctx.t("api.No current shift found"),
    permissions: [
      (currentShift) => assertIsUserCareGiver(ctx, currentShift.Caregiver.id),
      (currentShift) =>
        assertCheckoutTimeIsAfterCheckInTime(ctx.t, {
          checkInTime: currentShift.checkIn,
          checkOut: input.date,
        }),
    ],
    operation: async (currentShift) => {
      await updateCareShift(ctx.db, {
        id: currentShift.id,
        checkOut: input.date,
      });
    },
  });
};
