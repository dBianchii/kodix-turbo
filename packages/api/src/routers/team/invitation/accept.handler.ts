import type { TAcceptInputSchema } from "@kdx/validators/trpc/invitation";
import { acceptInvite } from "@kdx/auth/db";

import type { TProtectedProcedureContext } from "../../../procedures";

interface AcceptOptions {
  ctx: TProtectedProcedureContext;
  input: TAcceptInputSchema;
}

export const acceptHandler = async ({ ctx, input }: AcceptOptions) => {
  await acceptInvite({
    invite: input.invitationId,
    userId: ctx.session.user.id,
    email: ctx.session.user.email,
    db: ctx.db,
  });
};
