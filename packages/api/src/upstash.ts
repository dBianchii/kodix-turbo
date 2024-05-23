import { Redis } from "@upstash/redis";

import type { schema } from "@kdx/db/schema";
import type { AppPermissionId } from "@kdx/shared";

export const redis = Redis.fromEnv();

interface KeysMapping {
  installedApps: {
    tags: {
      teamId: typeof schema.teams.$inferSelect.id;
    };
    value: {
      id: typeof schema.apps.$inferSelect.id;
    }[];
  };

  permissions: {
    tags: {
      userId: typeof schema.users.$inferSelect.id;
      permissionId: AppPermissionId;
      teamId: typeof schema.teams.$inferSelect.id;
    };
    value:
      | {
          id: string;
          AppPermissionsToTeamAppRoles: {
            teamAppRoleId: string;
            appPermissionId: string;
          }[];
          TeamAppRolesToUsers: {
            userId: string;
            teamAppRoleId: string;
          }[];
        }
      | undefined;
  };
}

const constructKey = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return variableKeys ? `${key}-${Object.values(variableKeys).join("-")}` : key;
};

export const getUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  const constructedKey = constructKey(key, variableKeys);
  return redis.get(constructedKey) as Promise<KeysMapping[T]["value"]> | null;
};

export const setUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  options: {
    variableKeys: KeysMapping[T]["tags"];
    value: KeysMapping[T]["value"];
    ex?: number;
  },
) => {
  const { variableKeys, value, ex } = options;
  const constructedKey = constructKey(key, variableKeys);
  return redis.set(constructedKey, value, { ex: ex ?? 60 * 60 * 6 }); // 6 hours
};

export const invalidateUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  const constructedKey = constructKey(key, variableKeys);
  return redis.del(constructedKey);
};
