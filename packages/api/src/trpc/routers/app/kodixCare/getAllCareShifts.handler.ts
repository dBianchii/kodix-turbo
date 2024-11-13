import { getKodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";

interface GetAllCareShiftsOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllCareShiftsHandler = async ({
  ctx,
}: GetAllCareShiftsOptions) => {
  const kodixCareRepository = getKodixCareRepository(getTeamDbFromCtx(ctx));
  return await kodixCareRepository.getAllCareShifts();
};
