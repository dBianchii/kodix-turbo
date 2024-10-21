import type { TSaveConfigInput } from "@kdx/validators/trpc/app";
import { and, eq } from "@kdx/db";
import { appTeamConfigs } from "@kdx/db/schema";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import type { TProtectedProcedureContext } from "../../procedures";

interface SaveConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveConfigInput;
}

export const saveConfigHandler = async ({ ctx, input }: SaveConfigOptions) => {
  const existingConfig = await ctx.db.query.appTeamConfigs.findFirst({
    where: (appteamConfig, { eq, and }) =>
      and(
        eq(appteamConfig.appId, input.appId),
        eq(appteamConfig.teamId, ctx.auth.user.activeTeamId),
      ),
    columns: {
      config: true,
    },
  });

  const configSchema = appIdToAppTeamConfigSchema[input.appId];
  if (existingConfig) {
    return await ctx.db
      .update(appTeamConfigs)
      .set({
        config: {
          ...configSchema.parse(existingConfig.config),
          ...input.config,
        },
      })
      .where(
        and(
          eq(appTeamConfigs.appId, input.appId),
          eq(appTeamConfigs.teamId, ctx.auth.user.activeTeamId),
        ),
      );
  }

  //new record. We need to validate the whole config without partial()
  const parsedInput = configSchema.parse(input.config);

  await ctx.db.insert(appTeamConfigs).values({
    config: parsedInput,
    teamId: ctx.auth.user.activeTeamId,
    appId: input.appId,
  });
};
