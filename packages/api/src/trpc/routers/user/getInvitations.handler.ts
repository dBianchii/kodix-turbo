import type { TProtectedProcedureContext } from "../../procedures";

interface GetInvitationsOptions {
  ctx: TProtectedProcedureContext;
}

export const getInvitationsHandler = async ({ ctx }: GetInvitationsOptions) => {
  const { publicUserRepository } = ctx.publicRepositories;
  const invitations = await publicUserRepository.findManyInvitationsByEmail(
    ctx.auth.user.email,
  );

  return invitations;
};
