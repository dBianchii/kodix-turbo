import { TRPCError } from "@trpc/server";

import type { TDeleteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { and, eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeleteOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteInputSchema;
}

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  const invitation = await ctx.db.query.invitations.findFirst({
    where: (invitation, { eq }) =>
      and(
        eq(invitation.id, input.invitationId),
        eq(invitation.teamId, ctx.session.user.activeTeamId),
      ),
  });

  if (!invitation)
    throw new TRPCError({
      message: "No Invitation Found",
      code: "NOT_FOUND",
    });

  await ctx.db
    .delete(schema.invitations)
    .where(eq(schema.invitations.id, input.invitationId));
};
