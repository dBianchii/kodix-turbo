import { TRPCError } from "@trpc/server";

import type { TAcceptInputSchema } from "@kdx/validators/trpc/invitation";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../trpc";

interface AcceptOptions {
  ctx: TProtectedProcedureContext;
  input: TAcceptInputSchema;
}

export const acceptHandler = async ({ ctx, input }: AcceptOptions) => {
  // const invitation = await ctx.prisma.invitation.findUnique({
  //   where: {
  //     id: input.invitationId,
  //     email: ctx.session.user.email,
  //   },
  //   select: {
  //     Team: {
  //       select: {
  //         id: true,
  //       },
  //     },
  //   },
  // });
  const invitation = await ctx.db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(
        eq(invitation.id, input.invitationId),
        eq(invitation.email, ctx.session.user.email),
      ),
    with: {
      Team: {
        columns: {
          id: true,
        },
      },
    },
  });

  if (!invitation)
    throw new TRPCError({
      message: "No Invitation Found",
      code: "NOT_FOUND",
    });

  await ctx.db.transaction(async (tx) => {
    await tx
      .update(schema.users)
      .set({
        activeTeamId: invitation.Team.id,
      })
      .where(eq(schema.users.id, ctx.session.user.id));
    await tx.insert(schema.usersToTeams).values({
      userId: ctx.session.user.id,
      teamId: invitation.Team.id,
    });
    await tx
      .delete(schema.invitations)
      .where(eq(schema.invitations.id, input.invitationId));
  });
};
