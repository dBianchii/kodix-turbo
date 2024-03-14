import { revalidateTag } from "next/cache";

import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { eq, schema } from "@kdx/db";

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
  const team = await ctx.db.transaction(async (tx) => {
    const teamId = crypto.randomUUID();
    const team = await tx.insert(schema.teams).values({
      id: teamId,
      ownerId: input.userId,
      name: input.teamName,
    });
    await tx
      .update(schema.usersToTeams)
      .set({
        teamId,
        userId: input.userId,
      })
      .where(eq(schema.users.id, input.userId));
    return team;
  });
  revalidateTag("getAllForLoggedUser");
  return team;
};
