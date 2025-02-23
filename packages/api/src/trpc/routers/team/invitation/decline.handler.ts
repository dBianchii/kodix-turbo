import { TRPCError } from "@trpc/server";

import type { TDeclineInputSchema } from "@kdx/validators/trpc/team/invitation";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeclineOptions {
  ctx: TProtectedProcedureContext;
  input: TDeclineInputSchema;
}

export const declineHandler = async ({ ctx, input }: DeclineOptions) => {
  const { publicUserRepository } = ctx.publicRepositories;
  const invitation = await publicUserRepository.findInvitationByIdAndEmail({
    id: input.invitationId,
    email: ctx.auth.user.email,
  });

  if (!invitation) {
    throw new TRPCError({
      message: ctx.t("api.No Invitation Found"),
      code: "NOT_FOUND",
    });
  }

  await publicUserRepository.deleteInvitationById(input.invitationId);
};
