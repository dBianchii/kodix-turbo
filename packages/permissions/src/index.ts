import type { CreateAbility } from "@casl/ability";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { ServerSideT } from "@kdx/locales";
import type { AppRole, KodixAppId } from "@kdx/shared";
import {
  aiStudioAppId,
  calendarAppId,
  chatAppId,
  cupomAppId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import type { KodixCareMongoAbility } from "./kodixCare/kodixCare.permissions";
import type { Team } from "./models/team";
import type { User } from "./models/user";
import type { TeamAbility } from "./team/team.permissions";
import { kodixCarePermissionsFactory } from "./kodixCare/kodixCare.permissions";
import { teamPermissionsFactory } from "./team/team.permissions";

const appIdToPermissionsFactory = {
  [kodixCareAppId]: kodixCarePermissionsFactory,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  [todoAppId]: ({ t: _ }: { t: ServerSideT }) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  [calendarAppId]: ({ t: _ }: { t: ServerSideT }) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  [chatAppId]: ({ t: _ }: { t: ServerSideT }) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  [aiStudioAppId]: ({ t: _ }: { t: ServerSideT }) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  [cupomAppId]: ({ t: _ }: { t: ServerSideT }) => {},
};

export function defineAbilityForUserAndApp<T extends KodixAppId>({
  t,
  user,
  appId,
  roles,
}: {
  t: ServerSideT;
  user: User;
  appId: T;
  roles: AppRole[];
}) {
  const appBuilder = new AbilityBuilder(
    createMongoAbility as CreateAbility<KodixCareMongoAbility>,
  );

  const appPermissions = appIdToPermissionsFactory[appId]({ t });
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
  t,
}: {
  user: User;
  team: Team;
  t: ServerSideT;
}) {
  const teamBuilder = new AbilityBuilder(
    createMongoAbility as CreateAbility<TeamAbility>,
  );

  teamPermissionsFactory({ team, user, t })(teamBuilder);

  const teamAbility = teamBuilder.build({
    detectSubjectType(subject) {
      return subject.__typename;
    },
  });

  teamAbility.can = teamAbility.can.bind(teamAbility);
  teamAbility.cannot = teamAbility.cannot.bind(teamAbility);

  return teamAbility;
}

export type { KodixCareMongoAbility, TeamAbility };
