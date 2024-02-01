import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TSaveConfigInput } from "@kdx/validators/trpc/app";

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
  return await ctx.prisma.appTeamConfig.upsert({
    where: {
      appId_teamId: {
        appId: input.appId,
        teamId: ctx.session.user.activeTeamId,
      },
    },
    update: updateConfig,
    create: {
      ...updateConfig,
      teamId: ctx.session.user.activeTeamId,
      appId: input.appId,
    },
  });
};
