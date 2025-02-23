import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllCaregiversOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllCaregiversHandler = async ({
  ctx,
}: GetAllCaregiversOptions) => {
  const { kodixCareRepository } = ctx.repositories;
  return await kodixCareRepository.getAllCareGivers(ctx.auth.user.activeTeamId);
};
