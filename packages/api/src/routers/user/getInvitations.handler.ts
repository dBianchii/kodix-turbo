import type { TProtectedProcedureContext } from "../../procedures";

interface GetInvitationsOptions {
  ctx: TProtectedProcedureContext;
}

export const getInvitationsHandler = async ({ ctx }: GetInvitationsOptions) => {
  //... your handler logic here <3
  const invitations = await ctx.db.query.invitations.findMany({
    where: (invitation, { eq }) => eq(invitation.email, ctx.session.user.email),
    columns: {
      id: true,
    },
    with: {
      Team: {
        columns: {
          id: true,
          name: true,
        },
      },
      InvitedBy: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return invitations;
};
