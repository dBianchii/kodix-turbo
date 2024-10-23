import type { TSaveUserAppTeamConfigInputSchema } from "@kdx/validators/trpc/app";
import { and, eq } from "@kdx/db";
import { userAppTeamConfigs } from "@kdx/db/schema";
import { appIdToUserAppTeamConfigSchema } from "@kdx/validators/db-json";

import type { TProtectedProcedureContext } from "../../procedures";

interface SaveUserAppTeamConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveUserAppTeamConfigInputSchema;
}

export const saveUserAppTeamConfigHandler = async ({
  ctx,
  input,
}: SaveUserAppTeamConfigOptions) => {
  const existingConfig = await ctx.db.query.userAppTeamConfigs.findFirst({
    where: (userAppTeamConfigs, { eq, and }) =>
      and(
        eq(userAppTeamConfigs.appId, input.appId),
        eq(userAppTeamConfigs.teamId, ctx.auth.user.activeTeamId),
        eq(userAppTeamConfigs.userId, ctx.auth.user.id),
      ),
    columns: {
      config: true,
    },
  });

  const configSchema = appIdToUserAppTeamConfigSchema[input.appId];
  if (existingConfig) {
    return await ctx.db
      .update(userAppTeamConfigs)
      .set({
        config: {
          ...configSchema.parse(existingConfig.config),
          ...input.config,
        },
      })
      .where(
        and(
          eq(userAppTeamConfigs.appId, input.appId),
          eq(userAppTeamConfigs.teamId, ctx.auth.user.activeTeamId),
          eq(userAppTeamConfigs.userId, ctx.auth.user.id),
        ),
      );
  }

  //new record. We need to validate the whole config without partial()
  const parsedInput = configSchema.parse(input.config);

  await ctx.db.insert(userAppTeamConfigs).values({
    config: parsedInput,
    teamId: ctx.auth.user.activeTeamId,
    appId: input.appId,
    userId: ctx.auth.user.id,
  });
};
