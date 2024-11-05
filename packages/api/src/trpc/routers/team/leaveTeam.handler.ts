import { TRPCError } from "@trpc/server";

import type { TLeaveTeamInputSchema } from "@kdx/validators/trpc/team";
import { and, eq, inArray, not } from "@kdx/db";
import {
  teamAppRoles,
  teamAppRolesToUsers,
  teams,
  users,
  usersToTeams,
} from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface LeaveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TLeaveTeamInputSchema;
}

export const leaveTeamHandler = async ({ ctx, input }: LeaveTeamOptions) => {
  const team = await ctx.db.query.teams.findFirst({
    where: (team, { eq }) => eq(team.id, input.teamId),
    columns: { id: true, ownerId: true },
  });

  if (!team)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No Team Found"),
    });

  if (team.ownerId === ctx.auth.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You cannot leave a team you are an owner of Delete this team instead",
      ),
    });

  const otherTeam = await ctx.db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
    .where(
      and(
        not(eq(teams.id, ctx.auth.user.activeTeamId)),
        eq(usersToTeams.userId, ctx.auth.user.id),
      ),
    )
    .then((res) => res[0]);

  if (!otherTeam) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You are attempting to leave a team but you have no other teams Please create a new team first",
      ),
    });
  }

  await ctx.db.transaction(async (tx) => {
    //Move the user to the other team
    await tx
      .update(users)
      .set({ activeTeamId: otherTeam.id })
      .where(eq(users.id, ctx.auth.user.id));

    //Remove the user from the team
    await tx
      .delete(usersToTeams)
      .where(
        and(
          eq(usersToTeams.teamId, input.teamId),
          eq(usersToTeams.userId, ctx.auth.user.id),
        ),
      );

    //Remove the user association from the team's apps
    await tx
      .delete(teamAppRolesToUsers)
      .where(
        and(
          eq(teamAppRolesToUsers.userId, ctx.auth.user.id),
          inArray(
            teamAppRolesToUsers.teamAppRoleId,
            ctx.db
              .select({ id: teamAppRoles.id })
              .from(teamAppRoles)
              .where(eq(teamAppRoles.teamId, input.teamId)),
          ),
        ),
      );
  });
};
