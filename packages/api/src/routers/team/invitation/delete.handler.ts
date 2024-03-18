import { TRPCError } from "@trpc/server";

import type { TDeleteUserSchema } from "@kdx/validators/trpc/invitation";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../trpc";

interface DeleteOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteUserSchema;
}

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  // const invitation = await ctx.prisma.invitation.findUnique({
  //   where: {
  //     id: input.invitationId,
  //     Team: {
  //       id: ctx.session.user.activeTeamId,
  //     },
  //   },
  // });
  const invitation = await ctx.db.query.invitations.findFirst({
    where: (invitation, { eq }) =>
      eq(invitation.id, input.invitationId) &&
      eq(invitation.teamId, ctx.session.user.activeTeamId),
  });

  if (!invitation)
    throw new TRPCError({
      message: "No Invitation Found",
      code: "NOT_FOUND",
    });

  // return await ctx.prisma.invitation.delete({
  //   where: {
  //     id: input.invitationId,
  //   },
  // });
  await ctx.db
    .delete(schema.invitations)
    .where(eq(schema.invitations.id, input.invitationId));
};
