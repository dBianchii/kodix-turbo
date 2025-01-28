import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { KodixCareRole } from "@kdx/db/constants";

import type { User } from "../models/user";
import type { CareTask } from "./kodixCare.subjects";

type KodixCareAbilities = ["delete", CareTask];

export type KodixCareMongoAbility = MongoAbility<KodixCareAbilities>;

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<KodixCareMongoAbility>,
) => void;
export const kodixCarePermissions: Record<KodixCareRole, PermissionsByRole> = {
  ADMIN(user, { can }) {
    can("delete", "CareTask");
  },
  CAREGIVER(user, { can, cannot }) {
    can("delete", "CareTask", {
      createdBy: {
        $eq: user.id,
      },
    });
    cannot("delete", "CareTask", {
      cameFromCalendar: {
        $eq: true,
      },
    }).because("Only admins can delete care tasks that came from calendar");
  },
};
