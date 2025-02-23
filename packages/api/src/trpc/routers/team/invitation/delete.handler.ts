import { TRPCError } from "@trpc/server";

import type { TDeleteInputSchema } from "@kdx/validators/trpc/team/invitation";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeleteOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteInputSchema;
}

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  const { teamRepository } = ctx.repositories;
  const { publicUserRepository } = ctx.publicRepositories;
  const invitation = await teamRepository.findInvitationByIdAndTeamId(
    input.invitationId,
  );

  if (!invitation) {
    throw new TRPCError({
      message: ctx.t("api.No Invitation Found"),
      code: "NOT_FOUND",
    });
  }

  await publicUserRepository.deleteInvitationById(input.invitationId);
};
