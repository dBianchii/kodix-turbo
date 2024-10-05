import type { TGetUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";
import { appIdToUserAppTeamConfigSchema } from "@kdx/validators";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TGetUserAppTeamConfigInputSchema;
}

export const getUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: GetUserAppTeamConfigOptions) => {
  const result = await ctx.db.query.userAppTeamConfigs.findFirst({
    where: (userAppTeamConfigs, { eq, and }) =>
      and(
        eq(userAppTeamConfigs.appId, input.appId),
        eq(userAppTeamConfigs.teamId, ctx.session.user.activeTeamId),
        eq(userAppTeamConfigs.userId, ctx.session.user.id),
      ),
    columns: {
      config: true,
    },
  });

  const schema = appIdToUserAppTeamConfigSchema[input.appId].optional(); //? Optional because the config may not exist yet

  return schema.parse(result?.config);
};
