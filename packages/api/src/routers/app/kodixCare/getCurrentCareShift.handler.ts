import type { TProtectedProcedureContext } from "~/procedures";

interface GetCurrentCareShiftOptions {
  ctx: TProtectedProcedureContext;
}

export const getCurrentCareShiftHandler = async ({
  ctx,
}: GetCurrentCareShiftOptions) => {
  return await ctx.db.query.careShifts.findFirst({
    orderBy: (careShift, { desc }) => desc(careShift.checkIn),
    where: (careShift, { eq, and, isNull }) =>
      and(
        eq(careShift.teamId, ctx.session.user.activeTeamId),
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
};
