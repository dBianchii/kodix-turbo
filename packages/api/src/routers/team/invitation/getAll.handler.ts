import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const invitations = await ctx.db.query.invitations.findMany({
    where: (invitation, { eq }) =>
      eq(invitation.teamId, ctx.session.user.activeTeamId),
    columns: {
      id: true,
      email: true,
    },
  });
  return invitations.map((invite) => ({
    inviteId: invite.id,
    inviteEmail: invite.email,
  }));
};
