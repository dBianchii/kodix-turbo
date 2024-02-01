import { revalidateTag } from "next/cache";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";

interface CreateHandler {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: CreateHandler) => {
  const team = await ctx.prisma.team.update({
    where: {
      id: input.teamId,
    },
    data: {
      name: input.teamName,
    },
  });
  revalidateTag("getAllForLoggedUser");
  return team;
};
