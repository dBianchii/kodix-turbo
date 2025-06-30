import { describe, expect, it } from "vitest";

import { deepMerge } from "../deep-merge";

describe("deepMerge Utility", () => {
  it("should merge simple objects correctly", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
    expect(result).not.toBe(target); // Não deve mutar o original
  });

  it("should merge nested objects recursively", () => {
    const target = {
      app: {
        settings: {
          enableFeature: true,
          maxItems: 10,
        },
        metadata: {
          version: "1.0",
        },
      },
    };

    const source = {
      app: {
        settings: {
          maxItems: 20,
          newSetting: "value",
        },
        newSection: {
          enabled: true,
        },
      },
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      app: {
        settings: {
          enableFeature: true, // Mantido do target
          maxItems: 20, // Sobrescrito pelo source
          newSetting: "value", // Adicionado do source
        },
        metadata: {
          version: "1.0", // Mantido do target
        },
        newSection: {
          enabled: true, // Adicionado do source
        },
      },
    });
  });

  it("should handle undefined values correctly", () => {
    const target = { a: 1, b: 2 };
    const source = { b: undefined, c: 3 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 2, c: 3 }); // b não deve ser sobrescrito por undefined
  });

  it("should handle null values correctly", () => {
    const target = { a: 1, b: { nested: "value" } };
    const source = { b: null };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: null }); // null deve sobrescrever
  });

  it("should handle array values correctly (replace, not merge)", () => {
    const target = { items: [1, 2, 3] };
    const source = { items: [4, 5] };

    const result = deepMerge(target, source);

    expect(result).toEqual({ items: [4, 5] }); // Arrays são substituídos, não mesclados
  });

  it("should handle Date objects correctly (replace, not merge)", () => {
    const targetDate = new Date("2023-01-01");
    const sourceDate = new Date("2024-01-01");

    const target = { created: targetDate };
    const source = { created: sourceDate };

    const result = deepMerge(target, source);

    expect(result.created).toBe(sourceDate);
    expect(result.created).not.toBe(targetDate);
  });

  it("should handle mixed primitive and object types", () => {
    const target = { config: "simple string" };
    const source = { config: { complex: "object" } };

    const result = deepMerge(target, source);

    expect(result).toEqual({ config: { complex: "object" } }); // Object substitui string
  });

  it("should handle empty objects", () => {
    const target = { a: 1 };
    const source = {};

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1 });
  });

  it("should handle complex configuration merging scenario", () => {
    // Cenário realista: configuração de plataforma + configuração de team + configuração de usuário
    const platformConfig = {
      aiStudio: {
        models: {
          defaultProvider: "openai",
          enabledProviders: ["openai", "anthropic"],
        },
        instructions: {
          enabled: true,
          template: "Default template",
        },
        features: {
          advancedMode: false,
          maxTokens: 1000,
        },
      },
    };

    const teamConfig = {
      aiStudio: {
        models: {
          defaultProvider: "anthropic", // Team prefere Anthropic
        },
        features: {
          maxTokens: 2000, // Team tem limite maior
        },
      },
    };

    const userConfig = {
      aiStudio: {
        instructions: {
          template: "Personal template", // Usuário tem template personalizado
        },
        features: {
          advancedMode: true, // Usuário habilitou modo avançado
        },
      },
    };

    // Primeiro merge: platform + team
    const platformPlusTeam = deepMerge(platformConfig, teamConfig);

    // Segundo merge: (platform + team) + user
    const finalConfig = deepMerge(platformPlusTeam, userConfig);

    expect(finalConfig).toEqual({
      aiStudio: {
        models: {
          defaultProvider: "anthropic", // Do team config
          enabledProviders: ["openai", "anthropic"], // Do platform (mantido)
        },
        instructions: {
          enabled: true, // Do platform (mantido)
          template: "Personal template", // Do user config
        },
        features: {
          advancedMode: true, // Do user config
          maxTokens: 2000, // Do team config
        },
      },
    });
  });
});
