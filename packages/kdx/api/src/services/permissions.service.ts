import type { KodixAppId } from "@kodix/shared/db";

import type { User } from "@kdx/auth";
import type { ServerSideT } from "@kdx/locales";
import type { KodixCareMongoAbility } from "@kdx/permissions";
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
      appId,
      teamId: user.activeTeamId,
      userId: user.id,
    });

    return defineAbilityForUserAndApp({
      appId,
      roles,
      t,
      user,
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

    const ability = defineAbilityForUserAndTeam({ t, team, user });

    return ability;
  }

  return {
    getUserPermissionsForApp,
    getUserPermissionsForTeam,
  };
};
