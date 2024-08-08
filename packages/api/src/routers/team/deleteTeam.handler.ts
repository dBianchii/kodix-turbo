import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TDeleteTeamInputSchema } from "@kdx/validators/trpc/team";
import { and, eq, not } from "@kdx/db";
import { teams, users, usersToTeams } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface DeleteTeamOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TDeleteTeamInputSchema;
}

export const deleteTeamHandler = async ({ ctx, input }: DeleteTeamOptions) => {
  const team = await ctx.db.query.teams.findFirst({
    where: (team, { eq }) => eq(team.id, ctx.session.user.activeTeamId),
    columns: { name: true },
    with: {
      UsersToTeams: {
        columns: {
          userId: true,
        },
      },
    },
  });

  if (!team)
    throw new TRPCError({
      code: "NOT_FOUND",
    });

  const t = await getTranslations({ locale: ctx.locale });

  if (team.name !== input.teamNameConfirmation) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: t("api.The team name confirmation does not match the team name"),
    });
  }

  if (team.UsersToTeams.length > 1) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.The team cannot be deleted while it has other members"),
    });
  }

  const otherTeam = await ctx.db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
    .where(
      and(
        not(eq(teams.id, ctx.session.user.activeTeamId)),
        eq(usersToTeams.userId, ctx.session.user.id),
      ),
    )
    .then((res) => res[0]);
  if (!otherTeam) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t(
        "api.You are attempting to delete a team but you have no other teams Please create a new team first",
      ),
    });
  }

  await ctx.db.transaction(async (tx) => {
    //Move the user to the other team
    await tx
      .update(users)
      .set({ activeTeamId: otherTeam.id })
      .where(eq(users.id, ctx.session.user.id));

    //Remove the user from the team
    await tx
      .delete(usersToTeams)
      .where(
        and(
          eq(usersToTeams.teamId, ctx.session.user.activeTeamId),
          eq(usersToTeams.userId, ctx.session.user.id),
        ),
      );

    //Remove the team
    await tx.delete(teams).where(eq(teams.id, ctx.session.user.activeTeamId)); //! Should delete many other tables based on referential actions
  });
};
