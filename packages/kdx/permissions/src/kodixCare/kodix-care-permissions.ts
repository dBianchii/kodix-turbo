import type { AbilityBuilder, MongoAbility } from "@casl/ability";
import type { AppRole, kodixCareAppId } from "@kodix/shared/db";

import type { IsomorficT } from "@kdx/locales";

import type { Create, Delete, Edit } from "../actions";
import type { User } from "../models/user";
import type { CareShift, CareTask } from "./kodix-care-subjects";

type KodixCareAbilities =
  | [Delete | Create, CareTask]
  | [Delete | Edit | Create, CareShift];

export type KodixCareMongoAbility = MongoAbility<KodixCareAbilities>;
type KodixCareRole = AppRole<typeof kodixCareAppId>;
type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<KodixCareMongoAbility>
) => void;

export const kodixCarePermissionsFactory = ({
  t,
}: {
  t: IsomorficT;
}): Record<KodixCareRole, PermissionsByRole> => ({
  ADMIN(_user, { can }) {
    can("Create", "CareTask");
    can("Delete", "CareTask");

    can("Delete", "CareShift");
    can("Edit", "CareShift");
    can("Create", "CareShift");
  },
  CAREGIVER(user, { can, cannot }) {
    can("Create", "CareTask");

    can("Delete", "CareTask", {
      createdBy: {
        $eq: user.id,
      },
    }).because(t("api.Only admins and the creator can delete a task"));
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
        "api.This shift was not originally created by you ask your team manager to delete it"
      )
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

    can("Create", "CareShift", {
      caregiverId: user.id,
    }).because(t("api.Only admins can create shifts for other caregivers"));
  },
});
