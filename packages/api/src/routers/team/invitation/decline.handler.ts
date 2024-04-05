import { TRPCError } from "@trpc/server";

import type { TDeclineInputSchema } from "@kdx/validators/trpc/invitation";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../trpc";

interface DeclineOptions {
  ctx: TProtectedProcedureContext;
  input: TDeclineInputSchema;
}

export const declineHandler = async ({ ctx, input }: DeclineOptions) => {
  const invitation = await ctx.db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(
        eq(invitation.id, input.invitationId),
        eq(invitation.email, ctx.session.user.email),
      ),
  });

  if (!invitation) {
    throw new TRPCError({
      message: "No Invitation Found",
      code: "NOT_FOUND",
    });
  }

  await ctx.db
    .delete(schema.invitations)
    .where(eq(schema.invitations.id, input.invitationId));
};
