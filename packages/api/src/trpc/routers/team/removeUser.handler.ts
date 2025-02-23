import { ForbiddenError } from "@casl/ability";

import type { TRemoveUserSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface RemoveUserOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TRemoveUserSchema;
}

export const removeUserHandler = async ({ ctx, input }: RemoveUserOptions) => {
  const { permissionsService } = ctx.services;
  const { teamRepository } = ctx.repositories;
  const { publicTeamRepository, publicUserRepository } = ctx.publicRepositories;

  const permissions = await permissionsService.getUserPermissionsForTeam({
    user: ctx.auth.user,
  });
  ForbiddenError.from(permissions).throwUnlessCan("RemoveFromTeam", {
    __typename: "User",
    id: input.userId,
  });

  let otherTeam =
    await teamRepository.findAnyOtherTeamAssociatedWithUserThatIsNotTeamId({
      userId: input.userId,
    });

  await db.transaction(async (tx) => {
    //check if there are more people in the team before removal
    if (!otherTeam) {
      //Create a new team for the user so we can move them to it
      const newTeamId = nanoid();
      await publicTeamRepository.createTeamAndAssociateUser(
        ctx.auth.user.id,
        {
          id: newTeamId,
          ownerId: input.userId,
          name: "Personal Team",
        },
        tx,
      );

      otherTeam = { id: newTeamId };
    }

    await publicUserRepository.moveUserToTeam(
      {
        userId: input.userId,
        newTeamId: otherTeam.id,
      },
      tx,
    );

    //Remove the user from the team
    await publicUserRepository.removeUserFromTeam(
      {
        teamId: ctx.auth.user.activeTeamId,
        userId: input.userId,
      },
      tx,
    );

    //Remove the user association from the team's apps
    await teamRepository.removeUserAssociationsFromUserTeamAppRolesByTeamId(
      {
        userId: input.userId,
      },
      tx,
    );
  });
};
