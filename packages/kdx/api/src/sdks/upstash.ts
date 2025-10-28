import { Redis } from "@upstash/redis";

import type { users } from "@kdx/db/schema";
import { env } from "@kdx/env";

import type { getCareTaskCompositeId } from "../internal/calendar-and-care-task-central";

const redis = new Redis({
  token: env.UPSTASH_REDIS_REST_TOKEN,
  url: env.UPSTASH_REDIS_REST_URL,
});

interface KeysMapping {
  careTasksUsersNotifs: {
    tags: {
      userId: typeof users.$inferSelect.id;
      careTaskCompositeId: ReturnType<typeof getCareTaskCompositeId>;
    };
    value: {
      userId: typeof users.$inferSelect.id;
      careTaskCompositeId: ReturnType<typeof getCareTaskCompositeId>;
      date: string;
    };
  };
}

const constructKey = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  const sortedEntries = Object.entries(variableKeys).sort((a, b) =>
    a[0].localeCompare(b[0]),
  ); // Sort entries alphabetically by keys

  const constructedKey = `${key}-${sortedEntries
    .map(([k, v]) => `${k}-${v}`)
    .join("-")}`;
  return constructedKey;
};

/**
 * If nothing is found, it will return `null`
 */
export const getUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  if (env.DISABLE_UPSTASH_CACHE) return Promise.resolve(null);
  const constructedKey = constructKey(key, variableKeys);
  const result = (await redis.get(constructedKey)) as Promise<
    KeysMapping[T]["value"]
  > | null;
  return result;
};

export const setUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  options: {
    variableKeys: KeysMapping[T]["tags"];
    value: KeysMapping[T]["value"];
    ex?: number;
  },
) => {
  if (env.DISABLE_UPSTASH_CACHE) return Promise.resolve("OK");
  const { variableKeys, value, ex } = options;
  const constructedKey = constructKey(key, variableKeys);
  return redis.set(constructedKey, value, { ex: ex ?? 60 * 60 * 6 }); // 6 hours
};

export const invalidateUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  if (env.DISABLE_UPSTASH_CACHE) return Promise.resolve(0);
  const constructedKey = constructKey(key, variableKeys);
  return redis.del(constructedKey);
};
