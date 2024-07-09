import { TRPCError } from "@trpc/server";

import type { TRemoveUserSchema } from "@kdx/validators/trpc/team";
import { and, eq, not } from "@kdx/db";
import { nanoid } from "@kdx/db/nanoid";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface RemoveUserOptions {
  ctx: TProtectedProcedureContext;
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
    if (team.ownerId === ctx.session.user.id) {
      throw new TRPCError({
        message:
          "You are the owner of this team. You must transfer ownership first before leaving it",
        code: "BAD_REQUEST",
      });
    }
  }

  if (team.UsersToTeams.length <= 1)
    throw new TRPCError({
      message:
        "This user cannot leave since they are the only remaining owner of the team. Delete this team instead",
      code: "BAD_REQUEST",
    });

  //TODO: Implement role based access control
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
      //Create a new team for the user and move them to it
      const newTeamId = nanoid();
      await tx.insert(schema.teams).values({
        id: newTeamId,
        ownerId: input.userId,
        name: "Personal Team",
      });
      await tx
        .insert(schema.usersToTeams)
        .values({ userId: input.userId, teamId: newTeamId });
      await tx.update(schema.users).set({
        activeTeamId: newTeamId,
      });

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
  });
};
