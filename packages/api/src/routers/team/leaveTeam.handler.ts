import { TRPCError } from "@trpc/server";

import type { TLeaveTeamInputSchema } from "@kdx/validators/trpc/team";
import { and, eq, inArray, not } from "@kdx/db";
import { schema } from "@kdx/db/schema";

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
      message: "No team found",
    });

  if (team.ownerId === ctx.session.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "You cannot leave a team you are an owner of. Delete this team instead",
    });

  const otherTeam = await ctx.db
    .select({ id: schema.teams.id })
    .from(schema.teams)
    .innerJoin(
      schema.usersToTeams,
      eq(schema.teams.id, schema.usersToTeams.teamId),
    )
    .where(
      and(
        not(eq(schema.teams.id, ctx.session.user.activeTeamId)),
        eq(schema.usersToTeams.userId, ctx.session.user.id),
      ),
    )
    .then((res) => res[0]);

  if (!otherTeam) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "You are attempting to leave a team you are the only member of. Please create a new team first",
    });
  }

  await ctx.db.transaction(async (tx) => {
    //Move the user to the other team
    await tx
      .update(schema.users)
      .set({ activeTeamId: otherTeam.id })
      .where(eq(schema.users.id, ctx.session.user.id));

    await tx
      .delete(schema.usersToTeams)
      .where(
        and(
          eq(schema.usersToTeams.teamId, input.teamId),
          eq(schema.usersToTeams.userId, ctx.session.user.id),
        ),
      );

    await tx
      .delete(schema.teamAppRolesToUsers)
      .where(
        and(
          eq(schema.teamAppRolesToUsers.userId, ctx.session.user.id),
          inArray(
            schema.teamAppRolesToUsers.teamAppRoleId,
            ctx.db
              .select({ id: schema.teamAppRoles.id })
              .from(schema.teamAppRoles)
              .where(eq(schema.teamAppRoles.teamId, input.teamId)),
          ),
        ),
      );
  });
};
