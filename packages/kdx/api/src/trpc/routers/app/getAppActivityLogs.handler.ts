import type { TGetAppActivityLogsInputSchema } from "@kdx/validators/trpc/app";

import type { TProtectedProcedureContext } from "../../procedures";
import { getAppActivityLogs } from "../../../services/app-activity-logs.service";

interface GetAppActivityLogsOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAppActivityLogsInputSchema;
}

export const getAppActivityLogsHandler = async ({
  ctx,
  input,
}: GetAppActivityLogsOptions) =>
  await getAppActivityLogs({
    appId: input.appId,
    format: ctx.format,
    page: input.page,
    pageSize: input.perPage,
    rowId: input.rowId,
    t: ctx.t,
    tableNames: input.tableNames,
    teamId: ctx.auth.user.activeTeamId,
  });
