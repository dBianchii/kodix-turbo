import type { AbilityBuilder, MongoAbility } from "@casl/ability";

import type { IsomorficT } from "@kdx/locales";
import type { AppRole, kodixCareAppId } from "@kdx/shared";

import type { Create, Delete, Edit } from "../actions";
import type { User } from "../models/user";
import type { CareShift, CareTask } from "./kodixCare.subjects";

type KodixCareAbilities =
  | [Delete | Create, CareTask]
  | [Delete | Edit, CareShift];

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
    can("Create", "CareTask");
    can("Delete", "CareTask");

    can("Delete", "CareShift");
    can("Edit", "CareShift");
  },
  CAREGIVER(user, { can, cannot }) {
    can("Create", "CareTask");

    can("Delete", "CareTask", {
      createdBy: {
        $eq: user.id,
      },
    });
    cannot("Delete", "CareTask", {
      createdFromCalendar: {
        $eq: true,
      },
    }).because(t("api.Only admins can delete a task created from calendar"));

    can("Delete", "CareShift");
    cannot("Delete", "CareShift", {
      createdById: {
        $ne: user.id,
      },
    }).because(
      t(
        "api.This shift was not originally created by you ask your team manager to delete it",
      ),
    );

    can("Edit", "CareShift", {
      caregiverId: {
        $eq: user.id,
      },
    });
    cannot("Edit", "CareShift", {
      caregiverId: {
        $ne: user.id,
      },
    }).because(t("api.Only admins can edit shifts for other caregivers"));
  },
});
