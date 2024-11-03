import { getCurrentCareShiftByTeamId } from "@kdx/db/kodixCare";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetCurrentShiftOptions {
  ctx: TProtectedProcedureContext;
}

export const getCurrentShiftHandler = async ({
  ctx,
}: GetCurrentShiftOptions) => {
  return await getCurrentCareShiftByTeamId(ctx.auth.user.activeTeamId);
};
