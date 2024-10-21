import type { TProtectedProcedureContext } from "../../../procedures";

interface GetCurrentShiftOptions {
  ctx: TProtectedProcedureContext;
}

export const getCurrentShiftHandler = async ({
  ctx,
}: GetCurrentShiftOptions) => {
  const shift = await ctx.db.query.careShifts.findFirst({
    orderBy: (careShift, { desc }) => desc(careShift.checkIn),
    where: (careShift, { eq, and, isNull }) =>
      and(
        eq(careShift.teamId, ctx.auth.user.activeTeamId),
        isNull(careShift.shiftEndedAt),
      ),
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
