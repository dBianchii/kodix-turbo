import { TRPCError } from "@trpc/server";

import { appRepository } from "@kdx/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";
import { getUpstashCache, setUpstashCache } from "../../../sdks/upstash";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const cached = await getUpstashCache("apps", {
    teamId: ctx.auth.user?.activeTeamId,
  });
  if (cached) return cached;

  const _apps = await appRepository.findInstalledAppsByTeamId(
    ctx.auth.user?.activeTeamId,
  );

  if (!_apps.length)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No apps found"),
    });

  await setUpstashCache("apps", {
    variableKeys: {
      teamId: ctx.auth.user?.activeTeamId,
    },
    value: _apps,
  });

  return _apps;
};
