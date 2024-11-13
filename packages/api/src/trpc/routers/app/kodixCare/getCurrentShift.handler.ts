import { getKodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";

interface GetCurrentShiftOptions {
  ctx: TProtectedProcedureContext;
}

export const getCurrentShiftHandler = async ({
  ctx,
}: GetCurrentShiftOptions) => {
  const kodixCareRepository = getKodixCareRepository(getTeamDbFromCtx(ctx));

  return await kodixCareRepository.getCurrentCareShift();
};
