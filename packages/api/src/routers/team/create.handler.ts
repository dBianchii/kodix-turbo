import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { revalidateTag } from "next/cache";

import type { TCreateInputSchema } from "@kdx/validators/trpc/team";

import type { protectedProcedure } from "../../trpc";

interface CreateOptions {
  ctx: inferProcedureBuilderResolverOptions<typeof protectedProcedure>["ctx"];
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
