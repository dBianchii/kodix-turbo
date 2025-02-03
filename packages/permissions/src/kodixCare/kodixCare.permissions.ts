import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { IsomorficT } from "@kdx/locales";
import type { AppRole, kodixCareAppId } from "@kdx/shared";

import type { Delete, Edit } from "../actions";
import type { User } from "../models/user";
import type { CareShift, CareTask } from "./kodixCare.subjects";

type KodixCareAbilities = [Delete, CareTask] | [Delete | Edit, CareShift];

export type KodixCareMongoAbility = MongoAbility<KodixCareAbilities>;
type KodixCareRole = AppRole<typeof kodixCareAppId>;
type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<KodixCareMongoAbility>,
) => void;

export const kodixCarePermissionsFactory = ({
  t,
}: {
  t: IsomorficT;
}): Record<KodixCareRole, PermissionsByRole> => ({
  ADMIN(user, { can }) {
    can("delete", "CareTask");
    can("delete", "CareShift");
    can("edit", "CareShift");
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
    }).because(t("api.Only admins can delete a task created from calendar"));

    can("delete", "CareShift");
    cannot("delete", "CareShift", {
      createdById: {
        $ne: user.id,
      },
    }).because(
      t(
        "api.This shift was not originally created by you ask your team manager to delete it",
      ),
    );

    can("edit", "CareShift", {
      caregiverId: {
        $eq: user.id,
      },
    });
    cannot("edit", "CareShift", {
      caregiverId: {
        $ne: user.id,
      },
    }).because(t("api.Only admins can edit shifts for other caregivers"));
  },
});
