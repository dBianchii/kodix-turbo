import type { CreateAbility } from "@casl/ability";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { KodixCareRole } from "@kdx/db/constants";
import { kodixCareAppId } from "@kdx/shared";

import type { KodixCareMongoAbility } from "./kodixCare/kodixCare.permissions";
import type { User } from "./models/user";
import { kodixCarePermissions } from "./kodixCare/kodixCare.permissions";

export type AppsWithPermissions = typeof kodixCareAppId;

const getPermissions = <T extends AppsWithPermissions>(appId: T) => {
  const appIdToPermissions = {
    [kodixCareAppId]: kodixCarePermissions,
  };
  const permissions = appIdToPermissions[appId];

  return permissions as unknown as (typeof appIdToPermissions)[T];
};

export function defineAbilityFor<T extends AppsWithPermissions>({
  user,
  appId,
  roles,
}: {
  user: User;
  appId: T;
  roles: KodixCareRole[];
}) {
  const builder = new AbilityBuilder(
    createMongoAbility as CreateAbility<KodixCareMongoAbility>,
  );

  const permissions = getPermissions(appId);

  roles.forEach((role) => {
    permissions[role](user, builder);
  });

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename;
    },
  });

  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);

  return ability;
}
