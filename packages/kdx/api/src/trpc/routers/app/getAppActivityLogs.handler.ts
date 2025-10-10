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
    appId: input.appId,
    format: ctx.format,
    page: input.page,
    pageSize: input.perPage,
    rowId: input.rowId,
    t: ctx.t,
    tableNames: input.tableNames,
    teamId: ctx.auth.user.activeTeamId,
  });
};
