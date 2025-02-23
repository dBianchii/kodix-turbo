import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllUsersOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllUsersHandler = async ({ ctx }: GetAllUsersOptions) => {
  const { teamRepository } = ctx.repositories;
  return await teamRepository.findAllTeamMembers(ctx.auth.user.activeTeamId);
};
