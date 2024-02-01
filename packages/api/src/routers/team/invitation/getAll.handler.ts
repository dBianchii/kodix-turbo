import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetAllOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const invitations = await ctx.prisma.invitation.findMany({
    where: {
      teamId: ctx.session.user.activeTeamId,
    },
  });
  return invitations.map((invite) => ({
    inviteId: invite.id,
    inviteEmail: invite.email,
  }));
};
