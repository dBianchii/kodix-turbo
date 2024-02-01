import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetCurrentCareShiftOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const getCurrentCareShiftHandler = async ({
  ctx,
}: GetCurrentCareShiftOptions) => {
  //TODO: orderBy?
  return await ctx.prisma.careShift.findFirst({
    where: {
      teamId: ctx.session.user.activeTeamId,
      shiftEndedAt: null,
    },
    select: {
      shiftEndedAt: true,
      checkIn: true,
      checkOut: true,
      id: true,
      Caregiver: {
        select: {
          email: true,
          id: true,
          image: true,
          name: true,
        },
      },
    },
  });
};
