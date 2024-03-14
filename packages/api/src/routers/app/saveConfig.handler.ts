import type { TSaveConfigInput } from "@kdx/validators/trpc/app";
import { and, eq } from "@kdx/db";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import type { TProtectedProcedureContext } from "../../trpc";
import { appTeamConfigs } from "../../../../db/src/schema/schema";

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
          eq(appTeamConfigs.teamId, ctx.session.user.activeTeamId),
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

  return await ctx.db.insert(appTeamConfigs).values({
    id: crypto.randomUUID(),
    config: parsedInput,
    teamId: ctx.session.user.activeTeamId,
    appId: input.appId,
  });
};
