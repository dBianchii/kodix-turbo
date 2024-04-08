import { TRPCError } from "@trpc/server";

import type { TGetConfigInput } from "@kdx/validators/trpc/app";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import type { TProtectedProcedureContext } from "~/procedures";

interface GetConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetConfigInput;
}

export const getConfigHandler = async ({ ctx, input }: GetConfigOptions) => {
  const result = await ctx.db.query.appTeamConfigs.findFirst({
    where: (appteamConfig, { eq, and }) =>
      and(
        eq(appteamConfig.appId, input.appId),
        eq(appteamConfig.teamId, ctx.session.user.activeTeamId),
      ),
    columns: {
      config: true,
    },
  });
  if (!result)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No appTeamConfig found",
    });

  const schema = appIdToAppTeamConfigSchema[input.appId];

  return schema.parse(result?.config);
};
