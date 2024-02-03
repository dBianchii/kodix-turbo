import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TGetConfigInput } from "@kdx/validators/trpc/app";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

interface GetConfigOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TGetConfigInput;
}

export const getConfigHandler = async ({ ctx, input }: GetConfigOptions) => {
  const result = await ctx.prisma.appTeamConfig.findUnique({
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
  if (!result)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No appTeamConfig found",
    });

  const schema = appIdToAppTeamConfigSchema[input.appId];

  return schema.parse(result?.config);
};
