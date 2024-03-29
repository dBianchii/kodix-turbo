import type { TSaveConfigInput } from "@kdx/validators/trpc/app";
import { and, eq, schema } from "@kdx/db";
import { nanoid } from "@kdx/shared";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import type { TProtectedProcedureContext } from "../../trpc";

interface SaveConfigOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveConfigInput;
}

export const saveConfigHandler = async ({ ctx, input }: SaveConfigOptions) => {
  const existingConfig = await ctx.db.query.appTeamConfigs.findFirst({
    where: (appteamConfig, { eq, and }) =>
      and(
        eq(appteamConfig.appId, input.appId),
        eq(appteamConfig.teamId, ctx.session.user.activeTeamId),
      ),
    columns: {
      config: true,
    },
  });

  const configSchema = appIdToAppTeamConfigSchema[input.appId];
  if (existingConfig) {
    //Existing config. This means we can save even with partial data
    // return await ctx.prisma.appTeamConfig.update({
    //   where: {
    //     appId_teamId: {
    //       appId: input.appId,
    //       teamId: ctx.session.user.activeTeamId,
    //     },
    //   },
    //   data: {
    //     config: {
    //       ...(existingConfig.config as Prisma.JsonObject),
    //       ...input.config,
    //     },
    //   },
    // });

    return await ctx.db
      .update(schema.appTeamConfigs)
      .set({
        config: {
          ...configSchema.parse(existingConfig.config),
          ...input.config,
        },
      })
      .where(
        and(
          eq(schema.appTeamConfigs.appId, input.appId),
          eq(schema.appTeamConfigs.teamId, ctx.session.user.activeTeamId),
        ),
      );
  }

  //new record. We need to validate the whole config without partial()
  const parsedInput = configSchema.parse(input.config);

  // return await ctx.prisma.appTeamConfig.create({
  //   data: {
  //     config: parsedInput,
  //     teamId: ctx.session.user.activeTeamId,
  //     appId: input.appId,
  //   },
  // });

  return await ctx.db.insert(schema.appTeamConfigs).values({
    id: nanoid(),
    config: parsedInput,
    teamId: ctx.session.user.activeTeamId,
    appId: input.appId,
  });
};
