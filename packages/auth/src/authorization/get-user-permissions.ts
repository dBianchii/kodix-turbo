import type { AppRole, KodixAppId } from "@kdx/shared";
import { teamRepository } from "@kdx/db/repositories";

import type { User } from "./models/user";
import { defineAbilityForUserAndApp, defineAbilityForUserAndTeam } from ".";

export function getUserPermissionsForApp<T extends KodixAppId>({
  user,
  appId,
  userRoles,
}: {
  user: User;
  appId: T;
  userRoles: AppRole[];
}) {
  const ability = defineAbilityForUserAndApp({
    appId,
    roles: userRoles,
    user,
  });

  return ability;
}

export async function getUserPermissionsForTeam({
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

  const ability = defineAbilityForUserAndTeam({ team, user });

  return ability;
}
