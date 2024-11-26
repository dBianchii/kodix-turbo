import type { TGetAppActivityLogsInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAppActivityLogsOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAppActivityLogsInputSchema;
}

export const getAppActivityLogsHandler = async ({
  ctx,
  input,
}: GetAppActivityLogsOptions) => {
  return await appRepository.findManyAppActivityLogs({
    appId: input.appId,
    page: input.page,
    pageSize: input.perPage,
    teamId: ctx.auth.user.activeTeamId,
  });
};
