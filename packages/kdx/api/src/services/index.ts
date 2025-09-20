import type { ServerSideT } from "@kdx/locales";

import { permissionsServiceFactory } from "./permissions.service";

export * as appActivityLogsService from "./appActivityLogs.service";
export * from "./productAnalytics.service";

export const initializeServices = ({ t }: { t: ServerSideT }) => {
  return {
    permissions: permissionsServiceFactory({ t }),
  };
};
