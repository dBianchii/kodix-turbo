import type { TAcceptInputSchema } from "@kdx/validators/trpc/team/invitation";
import { acceptInvite } from "@kdx/auth/utils";

import type { TProtectedProcedureContext } from "../../../procedures";

interface AcceptOptions {
  ctx: TProtectedProcedureContext;
  input: TAcceptInputSchema;
}

export const acceptHandler = async ({ ctx, input }: AcceptOptions) => {
  await acceptInvite({
    invite: input.invitationId,
    userId: ctx.auth.user.id,
    email: ctx.auth.user.email,
    db: ctx.db,
  });
};
