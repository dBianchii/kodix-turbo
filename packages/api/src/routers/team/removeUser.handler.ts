import { TRPCError } from "@trpc/server";

import type { TRemoveUserSchema } from "@kdx/validators/trpc/team";
import { and, eq, inArray, not } from "@kdx/db";
import { nanoid } from "@kdx/db/nanoid";
import { schema } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface RemoveUserOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TRemoveUserSchema;
}

export const removeUserHandler = async ({ ctx, input }: RemoveUserOptions) => {
  const team = await ctx.db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, ctx.session.user.activeTeamId),
    columns: {
      ownerId: true,
    },
    with: {
      UsersToTeams: {
        with: {
          User: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });
  if (!team)
    throw new TRPCError({
      message: "No Team Found",
      code: "NOT_FOUND",
    });

  const isUserTryingToRemoveSelfFromTeam = input.userId === ctx.session.user.id;
  if (isUserTryingToRemoveSelfFromTeam) {
    throw new TRPCError({
      message:
        "You cannot remove yourself from a team you are an owner of. Delete this team instead",
      code: "BAD_REQUEST",
    });
  }

  if (team.UsersToTeams.length <= 1)
    throw new TRPCError({
      message:
        "This user cannot leave since they are the only remaining owner of the team. Delete this team instead",
      code: "BAD_REQUEST",
    });

  let otherTeam = await ctx.db
    .select({ id: schema.teams.id })
    .from(schema.teams)
    .innerJoin(
      schema.usersToTeams,
      eq(schema.teams.id, schema.usersToTeams.teamId),
    )
    .where(
      and(
        not(eq(schema.teams.id, ctx.session.user.activeTeamId)),
        eq(schema.usersToTeams.userId, input.userId),
      ),
    )
    .then((res) => res[0]);

  //check if there are more people in the team before removal
  await ctx.db.transaction(async (tx) => {
    if (!otherTeam) {
      //Create a new team for the user so we can move them to it
      const newTeamId = nanoid();
      await tx.insert(schema.teams).values({
        id: newTeamId,
        ownerId: input.userId,
        name: "Personal Team",
      });
      await tx
        .insert(schema.usersToTeams)
        .values({ userId: input.userId, teamId: newTeamId });

      otherTeam = { id: newTeamId };
    }

    //Move the user to the other team
    await tx
      .update(schema.users)
      .set({
        activeTeamId: otherTeam.id,
      })
      .where(eq(schema.users.id, input.userId));

    //Remove the user from the team
    await tx
      .delete(schema.usersToTeams)
      .where(
        and(
          eq(schema.usersToTeams.userId, input.userId),
          eq(schema.usersToTeams.teamId, ctx.session.user.activeTeamId),
        ),
      );

    //Remove the user association from the team's apps
    await tx
      .delete(schema.teamAppRolesToUsers)
      .where(
        and(
          eq(schema.teamAppRolesToUsers.userId, input.userId),
          inArray(
            schema.teamAppRolesToUsers.teamAppRoleId,
            ctx.db
              .select({ id: schema.teamAppRoles.id })
              .from(schema.teamAppRoles)
              .where(
                eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
              ),
          ),
        ),
      );
  });
};
