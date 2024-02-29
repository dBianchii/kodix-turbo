import type { TGetUsersWithRolesInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface GetUsersWithRolesOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetUsersWithRolesInputSchema;
}

export const getUsersWithRolesHandler = async ({
  ctx,
  input,
}: GetUsersWithRolesOptions) => {
  //TODO: Enforce input.appId is installed. (middleware)
  const users = await ctx.prisma.user.findMany({
    where: {
      Teams: {
        some: {
          id: ctx.session.user.activeTeamId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      TeamAppRole: {
        select: {
          id: true,
          name: true,
        },
        where: {
          teamId: ctx.session.user.activeTeamId,
          appId: input.appId,
        },
      },
    },
  });

  return users;
};
