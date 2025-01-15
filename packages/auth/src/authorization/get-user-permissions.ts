import type { KodixAppId } from "@kdx/shared";

import type { User } from "../config";
import type { KodixCareRoles } from "./roles";
import { defineAbilityFor } from ".";

export function getUserPermissionsForApp(
  user: User,
  appId: KodixAppId,
  userRoles: KodixCareRoles,
) {
  const ability = defineAbilityFor({
    appId,
    role: userRoles,
    user: user,
  });

  return ability;
}
