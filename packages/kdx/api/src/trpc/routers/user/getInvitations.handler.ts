import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetInvitationsOptions {
  ctx: TProtectedProcedureContext;
}

export const getInvitationsHandler = async ({ ctx }: GetInvitationsOptions) => {
  const invitations = await teamRepository.findManyInvitationsByEmail(
    ctx.auth.user.email,
  );

  return invitations;
};
