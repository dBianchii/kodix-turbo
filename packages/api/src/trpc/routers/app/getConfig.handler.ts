import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TGetConfigInput } from "@kdx/validators/trpc/app";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import type { TCronJobContext } from "../../../crons/_utils";
import type { TProtectedProcedureContext } from "../../procedures";

interface GetConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetConfigInput;
}

export const getConfigHandler = async ({ ctx, input }: GetConfigOptions) => {
  const [teamConfig] = await getConfigs({
    appId: input.appId,
    teamIds: [ctx.auth.user.activeTeamId],
    ctx,
  });

  if (!teamConfig) {
    const t = await getTranslations();
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No appTeamConfig found"),
    });
  }

  return teamConfig.config;
};

export async function getConfigs({
  appId,
  teamIds,
  ctx,
}: {
  ctx: TProtectedProcedureContext | TCronJobContext;
  appId: TGetConfigInput["appId"];
  teamIds: string[];
}) {
  const teamConfigs = await ctx.db.query.appTeamConfigs.findMany({
    where: (appteamConfig, { eq, and, inArray }) =>
      and(
        eq(appteamConfig.appId, appId),
        inArray(appteamConfig.teamId, teamIds),
      ),
    columns: {
      config: true,
      teamId: true,
    },
  });

  const schema = appIdToAppTeamConfigSchema[appId];
  const parsedTeamConfigs = teamConfigs.map((teamConfig) => ({
    teamId: teamConfig.teamId,
    config: schema.parse(teamConfig.config),
  }));

  return parsedTeamConfigs;
}
