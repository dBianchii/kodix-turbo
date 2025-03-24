import { trpcCaller } from "~/trpc/server";
import { AppSwitcherClient } from "./app-switcher-client";

export async function AppSwitcher({
  iconSize = 20,
  hideAddMoreApps = false,
  hrefPrefix,
}: {
  iconSize?: number;
  hideAddMoreApps?: boolean;
  hrefPrefix?: string;
}) {
  const apps = await trpcCaller.app.getInstalled();

  return (
    <AppSwitcherClient
      apps={apps}
      iconSize={iconSize}
      hideAddMoreApps={hideAddMoreApps}
      hrefPrefix={hrefPrefix}
    />
  );
}
