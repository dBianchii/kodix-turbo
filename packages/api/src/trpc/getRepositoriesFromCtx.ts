import { CareTaskRepository } from "@kdx/db/repositories";

export const getRepositoriesForTeams = (
  teamIds: string[],
): {
  careTask: InstanceType<typeof CareTaskRepository>;
} => {
  return {
    careTask: new CareTaskRepository(teamIds),
  };
};
