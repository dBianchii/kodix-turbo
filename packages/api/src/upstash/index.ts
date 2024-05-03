import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

interface KeysMapping {
  installedApps: {
    tags: {
      teamId: string;
    };
    value: {
      id: string;
    }[];
  };
}

export const getUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const constructedKey = variableKeys
    ? `${key}-${Object.values(variableKeys).join("-")}`
    : key;
  return redis.get(constructedKey) as Promise<KeysMapping[T]["value"]> | null;
};

export const setUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
  value: KeysMapping[T]["value"],
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const constructedKey = variableKeys
    ? `${key}-${Object.values(variableKeys).join("-")}`
    : key;
  return redis.set(constructedKey, value);
};

export const invalidateUpstashCache = <T extends keyof KeysMapping>(
  key: T,
  variableKeys: KeysMapping[T]["tags"],
) => {
  return redis.del(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    variableKeys ? `${key}-${Object.values(variableKeys).join("-")}` : key,
  );
};
