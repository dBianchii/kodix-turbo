import { TRPCError } from "@trpc/server";

import type { TDeleteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { and, eq } from "@kdx/db";
import { invitations } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";

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

  if (!invitation) {
    const t = await getTranslations({ locale: ctx.locale });

    throw new TRPCError({
      message: t("api.No Invitation Found"),
      code: "NOT_FOUND",
    });
  }

  await ctx.db
    .delete(invitations)
    .where(eq(invitations.id, input.invitationId));
};
