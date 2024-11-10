import { kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetCurrentShiftOptions {
  ctx: TProtectedProcedureContext;
}

export const getCurrentShiftHandler = async ({
  ctx,
}: GetCurrentShiftOptions) => {
  return await kodixCareRepository.getCurrentCareShiftByTeamId(
    ctx.auth.user.activeTeamId,
  );
};
