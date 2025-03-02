import { TRPCError } from "@trpc/server";

import { appRepository } from "@kdx/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const _apps = await appRepository.findInstalledAppsByTeamId(
    ctx.auth.user?.activeTeamId,
  );

  if (!_apps.length)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No apps found"),
    });

  return _apps;
};
