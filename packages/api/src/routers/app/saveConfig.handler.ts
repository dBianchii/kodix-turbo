import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TSaveConfigInput } from "@kdx/validators/trpc/app";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

interface SaveConfigOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TSaveConfigInput;
}

export const saveConfigHandler = async ({ ctx, input }: SaveConfigOptions) => {
  const updateConfig = {
    config: input.config,
  };

  const existingConfig = await ctx.prisma.appTeamConfig.findUnique({
    where: {
      appId_teamId: {
        appId: input.appId,
        teamId: ctx.session.user.activeTeamId,
      },
    },
    select: {
      config: true,
    },
  });

  if (existingConfig) {
    //Existing config. This means we can save even with partial data
    return await ctx.prisma.appTeamConfig.update({
      where: {
        appId_teamId: {
          appId: input.appId,
          teamId: ctx.session.user.activeTeamId,
        },
      },
      data: updateConfig,
    });
  }

  //new record. We need to validate the whole config without partial()
  const configSchema = appIdToAppTeamConfigSchema[input.appId];
  const parsedInput = configSchema.parse(input.config);

  return await ctx.prisma.appTeamConfig.create({
    data: {
      config: parsedInput,
      teamId: ctx.session.user.activeTeamId,
      appId: input.appId,
    },
  });
};
