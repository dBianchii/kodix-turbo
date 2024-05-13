import { Redis } from "@upstash/redis";

import type { schema } from "@kdx/db/schema";

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
  variableKeys: KeysMapping[T]["tags"],
  value: KeysMapping[T]["value"],
) => {
  const constructedKey = constructKey(key, variableKeys);
  return redis.set(constructedKey, value, { ex: 60 * 60 * 5 }); // 5 hours
};

export const invalidateUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  const constructedKey = constructKey(key, variableKeys);
  return redis.del(constructedKey);
};
