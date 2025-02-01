import type { TRemoveUserSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import { teamRepository, userRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface RemoveUserOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TRemoveUserSchema;
}

export const removeUserHandler = async ({ ctx, input }: RemoveUserOptions) => {
  // const isUserTryingToRemoveSelfFromTeam = input.userId === ctx.auth.user.id;
  // if (isUserTryingToRemoveSelfFromTeam) {
  //   throw new TRPCError({
  //     message: ctx.t(
  //       "api.You cannot remove yourself from a team you are an owner of Delete this team instead",
  //     ),
  //     code: "FORBIDDEN",
  //   });
  // }

  let otherTeam =
    await teamRepository.findAnyOtherTeamAssociatedWithUserThatIsNotTeamId({
      userId: input.userId,
      teamId: ctx.auth.user.activeTeamId,
    });

  await db.transaction(async (tx) => {
    //check if there are more people in the team before removal
    if (!otherTeam) {
      //Create a new team for the user so we can move them to it
      const newTeamId = nanoid();
      await teamRepository.createTeamAndAssociateUser(tx, ctx.auth.user.id, {
        id: newTeamId,
        ownerId: input.userId,
        name: "Personal Team",
      });

      otherTeam = { id: newTeamId };
    }

    await userRepository.moveUserToTeam(tx, {
      userId: input.userId,
      newTeamId: otherTeam.id,
    });

    //Remove the user from the team
    await teamRepository.removeUserFromTeam(tx, {
      teamId: ctx.auth.user.activeTeamId,
      userId: input.userId,
    });

    //Remove the user association from the team's apps
    await teamRepository.removeUserAssociationsFromUserTeamAppRolesByTeamId(
      {
        teamId: ctx.auth.user.activeTeamId,
        userId: input.userId,
      },
      tx,
    );
  });
};
