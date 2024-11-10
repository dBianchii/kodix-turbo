import { TRPCError } from "@trpc/server";

import type { TDeclineInputSchema } from "@kdx/validators/trpc/team/invitation";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeclineOptions {
  ctx: TProtectedProcedureContext;
  input: TDeclineInputSchema;
}

export const declineHandler = async ({ ctx, input }: DeclineOptions) => {
  const invitation = await teamRepository.findInvitationByIdAndEmail({
    id: input.invitationId,
    email: ctx.auth.user.email,
  });

  if (!invitation) {
    throw new TRPCError({
      message: ctx.t("api.No Invitation Found"),
      code: "NOT_FOUND",
    });
  }

  await teamRepository.deleteInvitationById(db, input.invitationId);
};
