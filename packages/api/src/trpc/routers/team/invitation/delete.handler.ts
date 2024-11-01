import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TDeleteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { and, eq } from "@kdx/db";
import { invitations } from "@kdx/db/schema";

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
        eq(invitation.teamId, ctx.auth.user.activeTeamId),
      ),
  });

  if (!invitation) {
    throw new TRPCError({
      message: ctx.t("api.No Invitation Found"),
      code: "NOT_FOUND",
    });
  }

  await ctx.db
    .delete(invitations)
    .where(eq(invitations.id, input.invitationId));
};
