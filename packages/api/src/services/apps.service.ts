import type { public_appRepositoryFactory } from "@kdx/db/repositories";

export function appServiceFactory({
  publicAppRepository,
}: {
  publicAppRepository: ReturnType<typeof public_appRepositoryFactory>;
}) {
  async function getAllInstalledAppsForTeam({ teamId }: { teamId: string }) {
    const _apps = await publicAppRepository.findInstalledAppsByTeamId(teamId);

    if (!_apps.length) throw new Error("No apps found");

    return _apps;
  }

  return {
    getAllInstalledAppsForTeam,
  };
}
