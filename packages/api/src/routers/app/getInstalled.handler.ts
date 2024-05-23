import type { TProtectedProcedureContext } from "../../procedures";
import { getAllHandler } from "./getAll.handler";

interface GetInstalledOptions {
  ctx: TProtectedProcedureContext;
}

export const getInstalledHandler = async ({ ctx }: GetInstalledOptions) => {
  const installedApps = (await getAllHandler({ ctx }))
    .filter((app) => app.installed)
    .map((app) => ({ id: app.id }));

  return installedApps;
};
