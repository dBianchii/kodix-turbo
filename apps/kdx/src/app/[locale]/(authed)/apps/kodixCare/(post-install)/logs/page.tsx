import { createColumnHelper } from "@tanstack/react-table";

import { kodixCareAppId } from "@kdx/shared";

import { api } from "~/trpc/server";

export default function LogsPage() {
  const logsPromise = api.app.getAppActivity({
    appId: kodixCareAppId,
    tables: ["careShift"],
    page: 1,
    perPage: 10,
  });
  return <></>;
}
