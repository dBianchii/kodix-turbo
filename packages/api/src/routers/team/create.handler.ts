import { revalidateTag } from "next/cache";

import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { schema } from "@kdx/db";
import { nanoid } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../trpc";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  // const team = await ctx.prisma.team.create({
  //   data: {
  //     ownerId: input.userId,
  //     name: input.teamName,
  //     Users: input.userId
  //       ? {
  //           connect: [{ id: input.userId }],
  //         }
  //       : undefined,
  //   },
  // });
  const teamId = nanoid();
  await ctx.db.transaction(async (tx) => {
    const team = await tx.insert(schema.teams).values({
      id: teamId,
      ownerId: input.userId,
      name: input.teamName,
    });
    await tx
      .insert(schema.usersToTeams)
      .values({ userId: input.userId, teamId });
    return team;
  });
  revalidateTag("getAllForLoggedUser");
  return { name: input.teamName, id: teamId };
};
