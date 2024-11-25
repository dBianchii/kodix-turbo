import { kodixCareAppId } from "@kdx/shared";

import { api } from "~/trpc/server";

export default function LogsPage() {
  const _logs = api.app.getAppActivity({
    appId: kodixCareAppId,
    tables: ["careShift"],
    page: 1,
    perPage: 10,
  });
  return <></>;
}
