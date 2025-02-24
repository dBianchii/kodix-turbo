import type { TGetAppActivityLogsInputSchema } from "@kdx/validators/trpc/app";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAppActivityLogsOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAppActivityLogsInputSchema;
}

export const getAppActivityLogsHandler = async ({
  ctx,
  input,
}: GetAppActivityLogsOptions) => {
  const { appActivityLogsService } = ctx.services;
  return await appActivityLogsService.getAppActivityLogs({
    t: ctx.t,
    format: ctx.format,
    appId: input.appId,
    page: input.page,
    rowId: input.rowId,
    tableNames: input.tableNames,
    pageSize: input.perPage,
  });
};
