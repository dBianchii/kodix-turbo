import { Redis } from "@upstash/redis";

import type { apps, careTasks, teams, users } from "@kdx/db/schema";
import type { AppPermissionId } from "@kdx/shared";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

interface KeysMapping {
  apps: {
    tags: {
      teamId: typeof teams.$inferSelect.id | undefined; //? If teamId isn't provided, it will refer to all existant apps
    };
    value: {
      id: typeof apps.$inferSelect.id;
      installed: boolean;
    }[];
  };

  permissions: {
    tags: {
      userId: typeof users.$inferSelect.id;
      permissionId: AppPermissionId;
      teamId: typeof teams.$inferSelect.id;
    };
    value:
      | {
          permissionId: string;
        }
      | undefined;
  };

  careTasksUsersNotifs: {
    tags: {
      userId: typeof users.$inferSelect.id;
      careTaskIdOrEventMasterId: typeof careTasks.$inferSelect.id;
    };
    value: {
      date: string;
    };
  };
}

const constructKey = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return variableKeys ? `${key}-${Object.values(variableKeys).join("-")}` : key;
};

/**
 * If nothing is found, it will return `null`
 */
export const getUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  if (process.env.DISABLE_UPSTASH_CACHE) return Promise.resolve(null);
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
  if (process.env.DISABLE_UPSTASH_CACHE) return Promise.resolve("OK");
  const { variableKeys, value, ex } = options;
  const constructedKey = constructKey(key, variableKeys);
  return redis.set(constructedKey, value, { ex: ex ?? 60 * 60 * 6 }); // 6 hours
};

export const invalidateUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  if (process.env.DISABLE_UPSTASH_CACHE) return Promise.resolve(0);
  const constructedKey = constructKey(key, variableKeys);
  return redis.del(constructedKey);
};
