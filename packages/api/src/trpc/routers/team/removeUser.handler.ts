import { ForbiddenError } from "@casl/ability";

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
  const { services } = ctx;
  const permissions = await services.permissions.getUserPermissionsForTeam({
    teamId: ctx.auth.user.activeTeamId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(permissions).throwUnlessCan("RemoveFromTeam", {
    __typename: "User",
    id: input.userId,
  });

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
