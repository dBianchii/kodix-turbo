import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const { teamRepository } = ctx.repositories;
  const invitations = await teamRepository.findManyInvitationsByTeamId();
  return invitations.map((invite) => ({
    inviteId: invite.id,
    inviteEmail: invite.email,
  }));
};
