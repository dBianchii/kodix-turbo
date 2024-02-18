import { TRPCError } from "@trpc/server";

import type { TAcceptInputSchema } from "@kdx/validators/trpc/invitation";

import type { TProtectedProcedureContext } from "../../../trpc";

interface AcceptOptions {
  ctx: TProtectedProcedureContext;
  input: TAcceptInputSchema;
}

export const acceptHandler = async ({ ctx, input }: AcceptOptions) => {
  const invitation = await ctx.prisma.invitation.findUnique({
    where: {
      id: input.invitationId,
      email: ctx.session.user.email,
    },
    select: {
      Team: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!invitation)
    throw new TRPCError({
      message: "No Invitation Found",
      code: "NOT_FOUND",
    });

  await ctx.prisma.$transaction([
    ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        Teams: {
          connect: {
            id: invitation.Team.id,
          },
        },
        activeTeamId: invitation.Team.id,
      },
    }),
    ctx.prisma.invitation.delete({
      where: {
        id: input.invitationId,
      },
    }),
  ]);
};
