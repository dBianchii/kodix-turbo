import { TRPCError } from "@trpc/server";

import type { TDeleteTeamInputSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface DeleteTeamOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TDeleteTeamInputSchema;
}

export const deleteTeamHandler = async ({ ctx, input }: DeleteTeamOptions) => {
  const { teamRepository, careTaskRepository } = ctx.repositories;
  const { publicUserRepository } = ctx.publicRepositories;
  const team = await teamRepository.findTeamById();

  if (!team)
    throw new TRPCError({
      code: "NOT_FOUND",
    });

  if (team.name !== input.teamNameConfirmation) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ctx.t(
        "api.The team name confirmation does not match the team name",
      ),
    });
  }

  if (team.UsersToTeams.length > 1) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.The team cannot be deleted while it has other members",
      ),
    });
  }

  const otherTeam =
    await teamRepository.findAnyOtherTeamAssociatedWithUserThatIsNotTeamId({
      userId: ctx.auth.user.id,
    });

  if (!otherTeam) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You are attempting to delete a team but you have no other teams Please create a new team first",
      ),
    });
  }

  await db.transaction(async (tx) => {
    //Move the user to the other team
    await publicUserRepository.moveUserToTeam(
      {
        userId: ctx.auth.user.id,
        newTeamId: otherTeam.id,
      },
      tx,
    );

    //Remove the team
    await careTaskRepository.deleteAllCareTasksForTeam(tx);
    await teamRepository.deleteTeam(tx); //! Should delete many other tables based on referential actions
  });
};
