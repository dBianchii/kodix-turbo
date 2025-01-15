import type { AbilityBuilder } from "@casl/ability";

import type { AppAbility } from ".";
import type { User } from "./models/user";
import type { KodixCareRoles } from "./roles";

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

export const kodixCarePermissions: Record<KodixCareRoles, PermissionsByRole> = {
  ADMIN(user, { can }) {
    can("invite", "User");
  },
  CAREGIVER(user, { cannot }) {},
};
