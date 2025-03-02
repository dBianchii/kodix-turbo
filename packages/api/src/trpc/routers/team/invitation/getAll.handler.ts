import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const invitations = await teamRepository.findManyInvitationsByTeamId(
    ctx.auth.user.activeTeamId,
  );
  return invitations.map((invite) => ({
    inviteId: invite.id,
    inviteEmail: invite.email,
  }));
};
