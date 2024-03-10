import { TRPCError } from "@trpc/server";

import type { TDeclineInputSchema } from "@kdx/validators/trpc/invitation";

import type { TProtectedProcedureContext } from "../../../trpc";

interface DeclineOptions {
  ctx: TProtectedProcedureContext;
  input: TDeclineInputSchema;
}

export const declineHandler = async ({ ctx, input }: DeclineOptions) => {
  const invitation = await ctx.prisma.invitation.findUnique({
    where: {
      id: input.invitationId,
      email: ctx.session.user.email,
    },
  });

  if (!invitation) {
    throw new TRPCError({
      message: "No Invitation Found",
      code: "NOT_FOUND",
    });
  }

  await ctx.prisma.invitation.delete({
    where: {
      id: input.invitationId,
    },
  });
};
