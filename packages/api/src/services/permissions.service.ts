import type { User } from "@kdx/auth";
import type { ServerSideT } from "@kdx/locales";
import type { KodixCareMongoAbility } from "@kdx/permissions";
import type { KodixAppId } from "@kdx/shared";
import { teamRepository } from "@kdx/db/repositories";
import {
  defineAbilityForUserAndApp,
  defineAbilityForUserAndTeam,
} from "@kdx/permissions";

export const permissionsServiceFactory = ({ t }: { t: ServerSideT }) => {
  async function getUserPermissionsForApp<T extends KodixAppId>({
    user,
    appId,
  }: {
    user: User;
    appId: T;
  }): Promise<KodixCareMongoAbility> {
    const roles = await teamRepository.findUserRolesByTeamIdAndAppId({
      teamId: user.activeTeamId,
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

  async function getUserPermissionsForTeam({
    user,
    teamId,
  }: {
    user: User;
    teamId: string;
  }) {
    const team = await teamRepository.findTeamById(teamId);
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
