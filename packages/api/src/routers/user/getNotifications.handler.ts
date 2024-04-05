import type { TProtectedProcedureContext } from "../../trpc";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getNotificationsHandler = async ({ ctx }: GetAllOptions) => {
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
  return { invitations };
};
