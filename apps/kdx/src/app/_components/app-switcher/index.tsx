import { api } from "~/trpc/server";
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
  const apps = await api.app.getInstalled();

  return (
    <AppSwitcherClient
      apps={apps}
      iconSize={iconSize}
      hideAddMoreApps={hideAddMoreApps}
      hrefPrefix={hrefPrefix}
    />
  );
}
