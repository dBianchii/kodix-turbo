import type { TFindOverlappingShiftsInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { TProtectedProcedureContext } from "../../../procedures";

interface FindOverlappingShiftsOptions {
  ctx: TProtectedProcedureContext;
  input: TFindOverlappingShiftsInputSchema;
}

export const findOverlappingShiftsHandler = async ({
  ctx,
  input,
}: FindOverlappingShiftsOptions) => {
  const { kodixCareRepository } = ctx.repositories;
  const overlaps = await kodixCareRepository.findOverlappingShifts({
    teamId: ctx.auth.user.activeTeamId,
    start: input.start,
    end: input.end,
    inclusive: input.inclusive,
  });
  return overlaps;
};
