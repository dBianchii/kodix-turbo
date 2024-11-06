import { desc } from "@kdx/db";
import { careShifts } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetCurrentShiftOptions {
  ctx: TProtectedProcedureContext;
}

export const getCurrentShiftHandler = async ({
  ctx,
}: GetCurrentShiftOptions) => {
  const shift = await ctx.db.query.careShifts.findFirst({
    orderBy: desc(careShifts.checkIn),
    where: (careShift, { eq, and }) =>
      and(eq(careShift.teamId, ctx.auth.user.activeTeamId)),
    with: {
      Caregiver: {
        columns: {
          email: true,
          id: true,
          image: true,
          name: true,
        },
      },
    },
    columns: {
      shiftEndedAt: true,
      checkIn: true,
      checkOut: true,
      id: true,
    },
  });
  return shift ?? null;
};
