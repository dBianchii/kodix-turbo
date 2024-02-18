import type { TProtectedProcedureContext } from "../../../trpc";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
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
