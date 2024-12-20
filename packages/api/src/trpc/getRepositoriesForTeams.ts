import { CareTaskRepository } from "@kdx/db/repositories";

export const getRepositoriesForTeams = (
  teamIds: string[],
): {
  careTask: InstanceType<typeof CareTaskRepository>;
} => ({
  careTask: new CareTaskRepository(teamIds),
});
