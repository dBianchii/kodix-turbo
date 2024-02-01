import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";

interface SwitchActiveTeamOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TSwitchActiveTeamInputSchema;
}

export const switchActiveTeamHandler = async ({
  ctx,
  input,
}: SwitchActiveTeamOptions) => {
  revalidateTag("activeTeam"); //THIS WORKS!!

  const user = await ctx.prisma.user.update({
    where: {
      id: ctx.session.user.id,
      Teams: {
        some: {
          ActiveUsers: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
      },
    },
    data: {
      activeTeamId: input.teamId,
    },
    select: {
      Teams: {
        where: {
          id: input.teamId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!user.Teams[0])
    throw new TRPCError({
      message: "No Team Found",
      code: "INTERNAL_SERVER_ERROR",
    });

  return user.Teams[0];
};
