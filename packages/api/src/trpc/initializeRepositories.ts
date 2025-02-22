import {
  careTaskRepositoryFactory,
  public_appRepositoryFactory,
  teamRepositoryFactory,
} from "@kdx/db/repositories";

export interface TeamsRepositories {
  careTaskRepository: ReturnType<typeof careTaskRepositoryFactory>;
  teamRepository: ReturnType<typeof teamRepositoryFactory>;
}

export const initializeRepositoriesForTeams = (
  teamIds: string[],
): TeamsRepositories => {
  if (teamIds.length === 0) throw new Error("teamIds cannot be empty");

  return {
    careTaskRepository: careTaskRepositoryFactory(teamIds),
    teamRepository: teamRepositoryFactory(teamIds),
  };
};

export interface PublicRepositories {
  publicAppRepository: ReturnType<typeof public_appRepositoryFactory>;
}
export const initializePublicRepositories = (): PublicRepositories => {
  return {
    publicAppRepository: public_appRepositoryFactory(),
  };
};
