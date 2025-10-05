import { TRPCError } from "@trpc/server";

import type { TDeleteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeleteOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteInputSchema;
}

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  const invitation = await teamRepository.findInvitationByIdAndTeamId({
    id: input.invitationId,
    teamId: ctx.auth.user.activeTeamId,
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No Invitation Found"),
    });
  }

  await teamRepository.deleteInvitationById(db, input.invitationId);
};
