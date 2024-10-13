import type { TCheckEmailForRegisterInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { TPublicProcedureContext } from "../../../procedures";

interface CheckEmailForRegisterOptions {
  ctx: TPublicProcedureContext;
  input: TCheckEmailForRegisterInputSchema;
}

export const checkEmailForRegisterHandler = async ({
  ctx,
  input,
}: CheckEmailForRegisterOptions) => {
  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, input.email),
  });
  if (user) return { status: "already registered" as const };

  const invite = await ctx.db.query.invitations.findFirst({
    where: (invitations, { eq }) => eq(invitations.email, input.email),
  });
  if (!invite) return { status: "not invited" as const };

  const inviteLink = {
    inviteId: invite.id, //`${getBaseKdxUrl()}/team/invite/${invite.id}`,
    status: "invited" as const,
  };

  return inviteLink;
};
