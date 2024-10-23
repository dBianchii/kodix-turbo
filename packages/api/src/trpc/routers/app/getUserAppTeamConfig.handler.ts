import type { TGetUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";
import { inArray } from "@kdx/db";
import { appIdToUserAppTeamConfigSchema } from "@kdx/validators/db-json";

import type { TCronJobContext } from "../../../crons/_utils";
import type { TProtectedProcedureContext } from "../../procedures";

interface GetUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetUserAppTeamConfigInputSchema;
}

export const getUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: GetUserAppTeamConfigOptions) => {
  const [userAppTeamConfig] = await getUsersAppTeamConfigs({
    ctx,
    userIds: [ctx.auth.user.id],
    teamIds: [ctx.auth.user.activeTeamId],
    appId: input.appId,
  });

  return userAppTeamConfig?.config;
};

export async function getUsersAppTeamConfigs({
  ctx,
  userIds,
  teamIds,
  appId,
}: {
  ctx: TProtectedProcedureContext | TCronJobContext;
  userIds: string[];
  teamIds: string[];
  appId: TGetUserAppTeamConfigInputSchema["appId"];
}) {
  const result = await ctx.db.query.userAppTeamConfigs.findMany({
    where: (userAppTeamConfigs, { eq, and }) =>
      and(
        eq(userAppTeamConfigs.appId, appId),
        inArray(userAppTeamConfigs.teamId, teamIds),
        inArray(userAppTeamConfigs.userId, userIds),
      ),
    columns: {
      userId: true,
      teamId: true,
      config: true,
    },
  });

  const schema = appIdToUserAppTeamConfigSchema[appId].optional(); //? Optional because the config may not exist yet

  const userAppTeamConfigs = result.map((x) => ({
    teamId: x.teamId,
    userId: x.userId,
    config: schema.parse(x.config),
  }));

  return userAppTeamConfigs;
}
