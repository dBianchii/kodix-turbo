import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { AppRole, kodixCareAppId } from "@kdx/shared";

import type { User } from "../models/user";
import type { CareTask } from "./kodixCare.subjects";

type KodixCareAbilities = ["delete", CareTask];

export type KodixCareMongoAbility = MongoAbility<KodixCareAbilities>;

type KodixCareRole = AppRole<typeof kodixCareAppId>;
type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<KodixCareMongoAbility>,
) => void;
export const kodixCarePermissions: Record<KodixCareRole, PermissionsByRole> = {
  ADMIN(user, { can }) {
    can("delete", "CareTask");
    can("delete", "CareTask");
    can("delete", "CareTask");
  },
  CAREGIVER(user, { can, cannot }) {
    can("delete", "CareTask", {
      createdBy: {
        $eq: user.id,
      },
    });
    cannot("delete", "CareTask", {
      createdFromCalendar: {
        $eq: true,
      },
    }).because("Only admins can delete care tasks that came from calendar");
  },
};
