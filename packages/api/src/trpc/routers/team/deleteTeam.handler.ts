import { TRPCError } from "@trpc/server";

import type { TDeleteTeamInputSchema } from "@kdx/validators/trpc/team";
import {
  getCareTaskRepository,
  teamRepository,
  userRepository,
} from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";
import { findTeamById } from "../../../../../db/src/repositories/teamRepository";
import { getTeamDbFromCtx } from "../../getTeamDbFromCtx";

interface DeleteTeamOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TDeleteTeamInputSchema;
}

export const deleteTeamHandler = async ({ ctx, input }: DeleteTeamOptions) => {
  const team = await findTeamById(input.teamId);

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
      teamId: input.teamId,
    });

  if (!otherTeam) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You are attempting to delete a team but you have no other teams Please create a new team first",
      ),
    });
  }

  const teamDb = getTeamDbFromCtx(ctx);
  const careTaskRepository = getCareTaskRepository(teamDb);
  await teamDb.transaction(async (tx) => {
    //Move the user to the other team
    await userRepository.moveUserToTeam(
      {
        userId: ctx.auth.user.id,
        newTeamId: otherTeam.id,
      },
      tx,
    );

    //Remove the team
    await careTaskRepository.deleteAllCareTasksForTeam(tx);
    await teamRepository.deleteTeam(tx, input.teamId); //! Should delete many other tables based on referential actions
  });
};
