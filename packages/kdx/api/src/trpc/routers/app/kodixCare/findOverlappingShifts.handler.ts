import type { TFindOverlappingShiftsInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface FindOverlappingShiftsOptions {
  ctx: TProtectedProcedureContext;
  input: TFindOverlappingShiftsInputSchema;
}

export const findOverlappingShiftsHandler = async ({
  ctx,
  input,
}: FindOverlappingShiftsOptions) => {
  const overlaps = await kodixCareRepository.findOverlappingShifts({
    end: input.end,
    inclusive: input.inclusive,
    start: input.start,
    teamId: ctx.auth.user.activeTeamId,
  });
  return overlaps;
};
