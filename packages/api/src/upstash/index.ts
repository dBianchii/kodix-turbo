import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

interface KeysMapping {
  kodixCare_onboarding_completed: {
    variableKeys: {
      teamId: string;
    };
    value: boolean;
  };

  somethingElse: {
    value: boolean;
  };
}

export const getUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
  variableKeys?: KeysMapping[T] extends { variableKeys: infer V }
    ? V
    : undefined,
) => {
  const constructedKey = variableKeys
    ? `${key}-${Object.values(variableKeys).join("-")}`
    : key;
  const cached = await redis.get(constructedKey);
  if (!cached) return null;
  return cached as KeysMapping[T]["value"];
};

export const setUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
  value: KeysMapping[T]["value"],
  variableKeys: KeysMapping[T]["variableKeys"],
) => {
  const constructedKey = `${key}-${Object.values(variableKeys).join("-")}`;
  await redis.set(constructedKey, value);
};

export const invalidateUpstashCache = async <T extends keyof KeysMapping>(
  key: T,
) => {
  await redis.del(key);
};

const used = await getUpstashCache(`kodixCare-OnboardingCompleted`, {
  teamId: "123",
});

const used2 = await getUpstashCache(`somethingElse`);
