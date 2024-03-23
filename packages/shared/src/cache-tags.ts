export const cacheTags = {
  INSTALLEDAPPS: ({ teamId }: { teamId: string }) => `INSTALLEDAPPS_${teamId}`,
  APPS: `APPS`,
} as const;

export const unstable_cache_keys = {
  app: {
    getInstalled: "app.getInstalledHandler",
    getAll: "app.getAllHandler",
  },
} as const;
