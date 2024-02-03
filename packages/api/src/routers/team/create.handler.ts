import { revalidateTag } from "next/cache";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TCreateInputSchema } from "@kdx/validators/trpc/team";

interface CreateOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const team = await ctx.prisma.team.create({
    data: {
      ownerId: input.userId,
      name: input.teamName,
      Users: input.userId
        ? {
            connect: [{ id: input.userId }],
          }
        : undefined,
    },
  });
  revalidateTag("getAllForLoggedUser");
  return team;
};
