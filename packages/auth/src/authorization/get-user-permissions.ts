import type { KodixCareRole } from "@kdx/db/constants";

import type { AppsWithPermissions } from ".";
import type { User } from "../config";
import { defineAbilityFor } from ".";

export function getUserPermissionsForApp<T extends AppsWithPermissions>(
  user: User,
  appId: T,
  userRoles: KodixCareRole[],
) {
  const ability = defineAbilityFor({
    appId,
    roles: userRoles,
    user: user,
  });

  return ability;
}
