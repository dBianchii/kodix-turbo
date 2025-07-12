import { kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllCaregiversOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllCaregiversHandler = async ({
  ctx,
}: GetAllCaregiversOptions) => {
  return await kodixCareRepository.getAllCareGivers(ctx.auth.user.activeTeamId);
};
