import { TRPCError } from "@trpc/server";

import type { TAcceptInputSchema } from "@kdx/validators/trpc/invitation";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface AcceptOptions {
  ctx: TProtectedProcedureContext;
  input: TAcceptInputSchema;
}

export const acceptHandler = async ({ ctx, input }: AcceptOptions) => {
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
