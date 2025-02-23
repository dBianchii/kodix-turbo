import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const { teamRepository } = ctx.repositories;
  const teams = await teamRepository.findTeamsByUserId(ctx.auth.user.id);

  return teams;
};
