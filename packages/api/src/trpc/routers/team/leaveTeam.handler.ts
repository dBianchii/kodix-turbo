import { TRPCError } from "@trpc/server";

import type { TLeaveTeamInputSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../procedures";

interface LeaveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TLeaveTeamInputSchema;
}

export const leaveTeamHandler = async ({ ctx, input }: LeaveTeamOptions) => {
  const { teamRepository } = ctx.repositories;
  const { publicUserRepository } = ctx.publicRepositories;
  const team = await teamRepository.findTeamById();

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

  const otherTeam =
    await teamRepository.findAnyOtherTeamAssociatedWithUserThatIsNotTeamId({
      userId: ctx.auth.user.id,
    });

  if (!otherTeam) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You are attempting to leave a team but you have no other teams Please create a new team first",
      ),
    });
  }

  await db.transaction(async (tx) => {
    await publicUserRepository.moveUserToTeam(
      {
        userId: ctx.auth.user.id,
        newTeamId: otherTeam.id,
      },
      tx,
    );

    //Remove the user from the team
    await publicUserRepository.removeUserFromTeam(
      { userId: ctx.auth.user.id, teamId: input.teamId },
      tx,
    );

    //Remove the user association from the team's apps
    await teamRepository.removeUserAssociationsFromUserTeamAppRolesByTeamId(
      {
        userId: ctx.auth.user.id,
      },
      tx,
    );
  });
};
