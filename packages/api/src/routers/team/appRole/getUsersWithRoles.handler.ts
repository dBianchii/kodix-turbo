import type { TGetUsersWithRolesInputSchema } from "@kdx/validators/trpc/team/appRole";
import { and, eq, schema } from "@kdx/db";

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
  // const users = await ctx.prisma.user.findMany({
  //   where: {
  //     Teams: {
  //       some: {
  //         id: ctx.session.user.activeTeamId,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //     image: true,
  //     TeamAppRole: {
  //       select: {
  //         id: true,
  //         name: true,
  //       },
  //       where: {
  //         teamId: ctx.session.user.activeTeamId,
  //         appId: input.appId,
  //       },
  //     },
  //   },
  // });

  const users = await ctx.db.query.users.findMany({
    where: (users, { eq, inArray }) =>
      inArray(
        users.id,
        ctx.db
          .select({ id: schema.usersToTeams.userId })
          .from(schema.usersToTeams)
          .where(eq(schema.usersToTeams.teamId, ctx.session.user.activeTeamId)),
      ),
    with: {
      TeamAppRolesToUsers: {
        where: (teamAppRolesToUsers, { inArray }) =>
          inArray(
            teamAppRolesToUsers.teamAppRoleId,
            ctx.db
              .select({ id: schema.teamAppRoles.id })
              .from(schema.teamAppRoles)
              .where(
                and(
                  eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
                  eq(schema.teamAppRoles.appId, input.appId),
                ),
              ),
          ),
        with: {
          TeamAppRole: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        columns: {
          teamAppRoleId: true,
          userId: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return users;
};
