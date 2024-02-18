import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";

import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";

import type { TProtectedProcedureContext } from "../../trpc";

interface SwitchActiveTeamOptions {
  ctx: TProtectedProcedureContext;
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
