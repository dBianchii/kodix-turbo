import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TDeclineInputSchema } from "@kdx/validators/trpc/team/invitation";
import { eq } from "@kdx/db";
import { invitations } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeclineOptions {
  ctx: TProtectedProcedureContext;
  input: TDeclineInputSchema;
}

export const declineHandler = async ({ ctx, input }: DeclineOptions) => {
  const invitation = await ctx.db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(
        eq(invitation.id, input.invitationId),
        eq(invitation.email, ctx.auth.user.email),
      ),
  });
  const t = await getTranslations({ locale: ctx.locale });

  if (!invitation) {
    throw new TRPCError({
      message: t("api.No Invitation Found"),
      code: "NOT_FOUND",
    });
  }

  await ctx.db
    .delete(invitations)
    .where(eq(invitations.id, input.invitationId));
};
