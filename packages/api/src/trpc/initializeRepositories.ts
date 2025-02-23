import {
  appRepositoryFactory,
  careTaskRepositoryFactory,
  kodixCareRepositoryFactory,
  public_appRepositoryFactory,
  public_authRepositoryFactory,
  public_notificationsRepositoryFactory,
  public_teamRepositoryFactory,
  public_userRepositoryFactory,
  teamRepositoryFactory,
} from "@kdx/db/repositories";

import { calendarRepositoryFactory } from "../../../db/src/repositories/app/calendar/calendarRepository";

export interface TeamsRepositories {
  careTaskRepository: ReturnType<typeof careTaskRepositoryFactory>;
  calendarRepository: ReturnType<typeof calendarRepositoryFactory>;
  teamRepository: ReturnType<typeof teamRepositoryFactory>;
  appRepository: ReturnType<typeof appRepositoryFactory>;
  kodixCareRepository: ReturnType<typeof kodixCareRepositoryFactory>;
}

export const initializeRepositoriesForTeams = (
  teamIds: string[],
): TeamsRepositories => {
  if (teamIds.length === 0) throw new Error("teamIds cannot be empty");
  const teamRepository = teamRepositoryFactory(teamIds);

  return {
    kodixCareRepository: kodixCareRepositoryFactory(teamIds, {
      teamRepository,
    }),
    calendarRepository: calendarRepositoryFactory(teamIds),
    appRepository: appRepositoryFactory(teamIds),
    careTaskRepository: careTaskRepositoryFactory(teamIds),
    teamRepository: teamRepositoryFactory(teamIds),
  };
};

export interface PublicRepositories {
  publicAppRepository: ReturnType<typeof public_appRepositoryFactory>;
  publicUserRepository: ReturnType<typeof public_userRepositoryFactory>;
  publicTeamRepository: ReturnType<typeof public_teamRepositoryFactory>;
  publicAuthRepository: ReturnType<typeof public_authRepositoryFactory>;
  publicNotificationsRepository: ReturnType<
    typeof public_notificationsRepositoryFactory
  >;
}
export const initializePublicRepositories = (): PublicRepositories => {
  return {
    publicNotificationsRepository: public_notificationsRepositoryFactory(),
    publicAuthRepository: public_authRepositoryFactory(),
    publicTeamRepository: public_teamRepositoryFactory(),
    publicUserRepository: public_userRepositoryFactory(),
    publicAppRepository: public_appRepositoryFactory(),
  };
};
