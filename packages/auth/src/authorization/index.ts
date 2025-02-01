import type { CreateAbility } from "@casl/ability";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { AppRole, KodixAppId } from "@kdx/shared";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import type { KodixCareMongoAbility } from "./kodixCare/kodixCare.permissions";
import type { Team } from "./models/team";
import type { User } from "./models/user";
import type { TeamAbility } from "./team/team.permissions";
import { kodixCarePermissions } from "./kodixCare/kodixCare.permissions";
import { teamPermissions } from "./team/team.permissions";

const appIdToPermissions = {
  [kodixCareAppId]: kodixCarePermissions,
  [todoAppId]: null,
  [calendarAppId]: null,
};

export function defineAbilityForUserAndApp<T extends KodixAppId>({
  user,
  appId,
  roles,
}: {
  user: User;
  appId: T;
  roles: AppRole[];
}) {
  const appBuilder = new AbilityBuilder(
    createMongoAbility as CreateAbility<KodixCareMongoAbility>,
  );

  const appPermissions = appIdToPermissions[appId];
  if (appPermissions)
    roles.forEach((role) => {
      appPermissions[role](user, appBuilder);
    });

  const appAbility = appBuilder.build({
    detectSubjectType(subject) {
      return subject.__typename;
    },
  });

  appAbility.can = appAbility.can.bind(appAbility);
  appAbility.cannot = appAbility.cannot.bind(appAbility);

  return appAbility;
}

export function defineAbilityForUserAndTeam({
  user,
  team,
}: {
  user: User;
  team: Team;
}) {
  const teamBuilder = new AbilityBuilder(
    createMongoAbility as CreateAbility<TeamAbility>,
  );

  teamPermissions({ team, user })(teamBuilder);

  const teamAbility = teamBuilder.build({
    detectSubjectType(subject) {
      return subject.__typename;
    },
  });

  teamAbility.can = teamAbility.can.bind(teamAbility);
  teamAbility.cannot = teamAbility.cannot.bind(teamAbility);

  return teamAbility;
}
