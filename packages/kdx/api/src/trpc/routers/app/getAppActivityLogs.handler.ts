import type { TGetAppActivityLogsInputSchema } from "@kdx/validators/trpc/app";

import type { TProtectedProcedureContext } from "../../procedures";
import { getAppActivityLogs } from "../../../services/appActivityLogs.service";

interface GetAppActivityLogsOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAppActivityLogsInputSchema;
}

export const getAppActivityLogsHandler = async ({
  ctx,
  input,
}: GetAppActivityLogsOptions) => {
  return await getAppActivityLogs({
    t: ctx.t,
    format: ctx.format,
    appId: input.appId,
    page: input.page,
    rowId: input.rowId,
    tableNames: input.tableNames,
    pageSize: input.perPage,
    teamId: ctx.auth.user.activeTeamId,
  });
};
