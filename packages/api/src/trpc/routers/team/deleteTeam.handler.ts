import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TDeleteTeamInputSchema } from "@kdx/validators/trpc/team";
import { and, eq, not } from "@kdx/db";
import { careTasks, teams, users, usersToTeams } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface DeleteTeamOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TDeleteTeamInputSchema;
}

export const deleteTeamHandler = async ({ ctx, input }: DeleteTeamOptions) => {
  const team = await ctx.db.query.teams.findFirst({
    where: (team, { eq }) => eq(team.id, input.teamId),
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
        not(eq(teams.id, input.teamId)),
        eq(usersToTeams.userId, ctx.auth.user.id),
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
      .where(eq(users.id, ctx.auth.user.id));

    //Remove the team
    await tx.delete(careTasks).where(eq(careTasks.teamId, input.teamId)); //?uuuuh...
    await tx.delete(teams).where(eq(teams.id, input.teamId)); //! Should delete many other tables based on referential actions
  });
};
