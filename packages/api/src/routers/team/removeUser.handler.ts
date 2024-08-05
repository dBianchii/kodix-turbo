import { TRPCError } from "@trpc/server";

import type { TRemoveUserSchema } from "@kdx/validators/trpc/team";
import { and, eq, inArray, not } from "@kdx/db";
import { nanoid } from "@kdx/db/nanoid";
import {
  teamAppRoles,
  teamAppRolesToUsers,
  teams,
  users,
  usersToTeams,
} from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface RemoveUserOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TRemoveUserSchema;
}

export const removeUserHandler = async ({ ctx, input }: RemoveUserOptions) => {
  const isUserTryingToRemoveSelfFromTeam = input.userId === ctx.session.user.id;
  if (isUserTryingToRemoveSelfFromTeam) {
    const t = await getTranslations({ locale: ctx.locale });
    throw new TRPCError({
      message: t(
        "api.You cannot remove yourself from a team you are an owner of Delete this team instead",
      ),
      code: "FORBIDDEN",
    });
  }

  let otherTeam = await ctx.db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
    .where(
      and(
        not(eq(teams.id, ctx.session.user.activeTeamId)),
        eq(usersToTeams.userId, input.userId),
      ),
    )
    .then((res) => res[0]);

  await ctx.db.transaction(async (tx) => {
    //check if there are more people in the team before removal
    if (!otherTeam) {
      //Create a new team for the user so we can move them to it
      const newTeamId = nanoid();
      await tx.insert(teams).values({
        id: newTeamId,
        ownerId: input.userId,
        name: "Personal Team",
      });
      await tx
        .insert(usersToTeams)
        .values({ userId: input.userId, teamId: newTeamId });

      otherTeam = { id: newTeamId };
    }

    //Move the user to the other team
    await tx
      .update(users)
      .set({
        activeTeamId: otherTeam.id,
      })
      .where(eq(users.id, input.userId));

    //Remove the user from the team
    await tx
      .delete(usersToTeams)
      .where(
        and(
          eq(usersToTeams.userId, input.userId),
          eq(usersToTeams.teamId, ctx.session.user.activeTeamId),
        ),
      );

    //Remove the user association from the team's apps
    await tx
      .delete(teamAppRolesToUsers)
      .where(
        and(
          eq(teamAppRolesToUsers.userId, input.userId),
          inArray(
            teamAppRolesToUsers.teamAppRoleId,
            ctx.db
              .select({ id: teamAppRoles.id })
              .from(teamAppRoles)
              .where(eq(teamAppRoles.teamId, ctx.session.user.activeTeamId)),
          ),
        ),
      );
  });
};
