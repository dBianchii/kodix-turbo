import { TRPCError } from "@trpc/server";

import type { TLeaveTeamInputSchema } from "@kdx/validators/trpc/team";
import { teamRepository, userRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface LeaveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TLeaveTeamInputSchema;
}

export const leaveTeamHandler = async ({ ctx, input }: LeaveTeamOptions) => {
  const team = await teamRepository.findTeamById(input.teamId);

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
      teamId: ctx.auth.user.activeTeamId,
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

  await ctx.db.transaction(async (tx) => {
    await userRepository.moveUserToTeam(tx, {
      userId: ctx.auth.user.id,
      newTeamId: otherTeam.id,
    });

    //Remove the user from the team
    await teamRepository.removeUserFromTeam(tx, {
      teamId: input.teamId,
      userId: ctx.auth.user.id,
    });

    //Remove the user association from the team's apps
    await teamRepository.removeUserAssociationsFromTeamAppRoles(tx, {
      teamId: input.teamId,
      userId: ctx.auth.user.id,
    });
  });
};
