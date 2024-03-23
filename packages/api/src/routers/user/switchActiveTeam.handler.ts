import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface SwitchActiveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TSwitchActiveTeamInputSchema;
}

export const switchActiveTeamHandler = async ({
  ctx,
  input,
}: SwitchActiveTeamOptions) => {
  // const user = await ctx.prisma.user.update({
  //   where: {
  //     id: ctx.session.user.id,
  //     Teams: {
  //       some: {
  //         ActiveUsers: {
  //           some: {
  //             id: ctx.session.user.id,
  //           },
  //         },
  //       },
  //     },
  //   },
  //   data: {
  //     activeTeamId: input.teamId,
  //   },
  //   select: {
  //     Teams: {
  //       where: {
  //         id: input.teamId,
  //       },
  //       select: {
  //         id: true,
  //       },
  //     },
  //   },
  // });
  await ctx.db.update(schema.users).set({ activeTeamId: input.teamId }).where(
    eq(schema.users.id, ctx.session.user.id),
    //TODO: Make sure they are part of the team!!
  );
};
