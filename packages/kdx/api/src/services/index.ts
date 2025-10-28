import type { ServerSideT } from "@kdx/locales";

import { permissionsServiceFactory } from "./permissions.service";

// biome-ignore lint/performance/noBarrelFile: Fix me!
export * as appActivityLogsService from "./app-activity-logs.service";

export const initializeServices = ({ t }: { t: ServerSideT }) => ({
  permissions: permissionsServiceFactory({ t }),
});
