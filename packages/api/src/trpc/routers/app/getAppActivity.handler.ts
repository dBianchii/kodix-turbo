import type { TGetAppActivityInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAppActivityOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAppActivityInputSchema;
}

export const getAppActivityHandler = async ({
  ctx,
  input,
}: GetAppActivityOptions) => {
  return await appRepository.findManyAppActivityLogs({
    appId: input.appId,
    page: input.page,
    pageSize: input.perPage,
    teamId: ctx.auth.user.activeTeamId,
  });
};
