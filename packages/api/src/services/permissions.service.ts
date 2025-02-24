import type { User } from "@kdx/auth";
import type { teamRepositoryFactory } from "@kdx/db/repositories";
import type { ServerSideT } from "@kdx/locales";
import type { KodixCareMongoAbility } from "@kdx/permissions";
import type { KodixAppId } from "@kdx/shared";
import {
  defineAbilityForUserAndApp,
  defineAbilityForUserAndTeam,
} from "@kdx/permissions";

export const permissionsServiceFactory = ({
  t,
  teamRepository,
}: {
  t: ServerSideT;
  teamRepository: ReturnType<typeof teamRepositoryFactory>;
}) => {
  async function getUserPermissionsForApp<T extends KodixAppId>({
    user,
    appId,
  }: {
    user: User;
    appId: T;
  }): Promise<KodixCareMongoAbility> {
    const roles = await teamRepository.findUserRolesByTeamIdAndAppId({
      appId,
      userId: user.id,
    });

    return defineAbilityForUserAndApp({
      appId,
      roles,
      user,
      t,
    });
  }

  async function getUserPermissionsForTeam({ user }: { user: User }) {
    const team = await teamRepository.findTeamById();
    if (!team) {
      throw new Error("Team not found");
    }

    const ability = defineAbilityForUserAndTeam({ team, user, t });

    return ability;
  }

  return {
    getUserPermissionsForApp,
    getUserPermissionsForTeam,
  };
};
