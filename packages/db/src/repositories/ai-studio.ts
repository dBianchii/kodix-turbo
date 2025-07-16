import { and, asc, count, desc, eq, inArray, like, sql } from "drizzle-orm";

import { db } from "../client";
import {
  aiAgent,
  aiLibrary,
  aiModel,
  aiProvider,
  aiTeamModelConfig,
  aiTeamProviderToken,
} from "../schema/apps/ai-studio";
import { chatFolder, chatSession } from "../schema/apps/chat";
import { teams } from "../schema/teams";
import { users } from "../schema/users";
import { decryptToken, encryptToken } from "../utils";

// Interface para tipar a resposta da API de chat completions
interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  id: string;
  object: string;
  created: number;
}

// Helper function to validate and suggest Google model names
function validateGoogleModelName(modelName: string): {
  isValid: boolean;
  suggestion?: string;
} {
  // Common Google model patterns
  const validPatterns = [
    /^gemini-\d+\.\d+-pro$/,
    /^gemini-\d+\.\d+-flash$/,
    /^gemini-\d+\.\d+-pro-\d+$/,
    /^gemini-\d+\.\d+-flash-\d+$/,
    /^gemini-exp-\d+$/,
  ];

  // Check if it matches any valid pattern
  const isValid = validPatterns.some((pattern) => pattern.test(modelName));

  if (!isValid) {
    // Common mistakes and suggestions
    if (modelName.includes("2.5") || modelName.includes("2.0")) {
      return {
        isValid: false,
        suggestion:
          "Try 'gemini-1.5-pro' or 'gemini-1.5-flash' instead. Note: Gemini 2.x models might need different naming.",
      };
    }

    if (modelName.includes("pro") && !modelName.includes("gemini")) {
      return {
        isValid: false,
        suggestion:
          "Model name should start with 'gemini-'. Try 'gemini-1.5-pro'.",
      };
    }

    if (
      modelName.toLowerCase().includes("gemini") &&
      !modelName.includes("-")
    ) {
      return {
        isValid: false,
        suggestion:
          "Google models need version numbers. Try 'gemini-1.5-pro' or 'gemini-1.5-flash'.",
      };
    }
  }

  return { isValid };
}

export const AiProviderRepository = {
  // Criar novo provider
  create: async (data: { name: string; baseUrl?: string }) => {
    // Validar se provider já existe
    const existingProvider = await AiProviderRepository.findByName(data.name);
    if (existingProvider) {
      throw new Error(`Provider com nome "${data.name}" já existe`);
    }

    const [result] = await db.insert(aiProvider).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar provider");
    return AiProviderRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiProvider.findFirst({
      where: eq(aiProvider.id, id),
      with: {
        models: {
          columns: { id: true, displayName: true, enabled: true },
        },
        tokens: {
          columns: { id: true, teamId: true, createdAt: true },
        },
      },
    });
  },

  // Buscar por nome
  findByName: async (name: string) => {
    return db.query.aiProvider.findFirst({
      where: eq(aiProvider.name, name),
      with: {
        models: {
          columns: { id: true, displayName: true, enabled: true },
        },
      },
    });
  },

  // Listar providers
  findMany: async (
    params: {
      limite?: number;
      offset?: number;
    } = {},
  ) => {
    const { limite = 50, offset = 0 } = params;

    return db.query.aiProvider.findMany({
      limit: limite,
      offset,
      orderBy: [asc(aiProvider.name)],
      with: {
        models: {
          columns: { id: true, displayName: true, enabled: true },
        },
        tokens: {
          columns: { id: true, teamId: true, createdAt: true },
        },
      },
    });
  },

  // Atualizar provider
  update: async (id: string, data: Partial<typeof aiProvider.$inferInsert>) => {
    await db.update(aiProvider).set(data).where(eq(aiProvider.id, id));
    return AiProviderRepository.findById(id);
  },

  // Excluir provider com validações
  delete: async (id: string) => {
    return db.transaction(async (tx) => {
      // Verificar se há modelos usando este provider
      const [modelsCount] = await tx
        .select({ count: count() })
        .from(aiModel)
        .where(eq(aiModel.providerId, id));

      if ((modelsCount?.count ?? 0) > 0) {
        throw new Error(
          `Não é possível excluir provider: ${modelsCount?.count ?? 0} modelos dependem dele`,
        );
      }

      // Verificar se há tokens para este provider
      const [tokensCount] = await tx
        .select({ count: count() })
        .from(aiTeamProviderToken)
        .where(eq(aiTeamProviderToken.providerId, id));

      if ((tokensCount?.count ?? 0) > 0) {
        throw new Error(
          `Não é possível excluir provider: ${tokensCount?.count ?? 0} tokens dependem dele`,
        );
      }

      // Excluir provider
      await tx.delete(aiProvider).where(eq(aiProvider.id, id));
    });
  },

  // Adicionar método count
  count: async () => {
    const [result] = await db.select({ count: count() }).from(aiProvider);
    return result?.count ?? 0;
  },
};

export const AiModelRepository = {
  // Criar novo modelo
  create: async (data: {
    displayName: string;
    universalModelId: string;
    providerId: string;
    config?: any;
    enabled?: boolean;
    status?: "active" | "archived";
  }) => {
    const now = new Date();
    const [result] = await db
      .insert(aiModel)
      .values({
        ...data,
      })
      .$returningId();
    if (!result) throw new Error("Falha ao criar modelo");
    return AiModelRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiModel.findFirst({
      where: eq(aiModel.id, id),
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });
  },

  // Buscar por ID com config original preservado
  findByIdWithOriginalConfig: async (id: string) => {
    const result = await db
      .select({
        id: aiModel.id,
        displayName: aiModel.displayName,
        universalModelId: aiModel.universalModelId,
        providerId: aiModel.providerId,
        status: aiModel.status,
        config: aiModel.config,
        originalConfig: aiModel.originalConfig, // Raw JSON string with preserved order
        enabled: aiModel.enabled,
        createdAt: aiModel.createdAt,
        updatedAt: aiModel.updatedAt,
      })
      .from(aiModel)
      .where(eq(aiModel.id, id))
      .limit(1);

    return result[0] || null;
  },

  // Listar modelos ativos
  findMany: async (params: {
    enabled?: boolean;
    providerId?: string;
    status?: "active" | "archived";
    limite?: number;
    offset?: number;
  }) => {
    const { enabled, providerId, status, limite = 50, offset = 0 } = params;
    const condicoes = [];

    if (enabled !== undefined) {
      condicoes.push(eq(aiModel.enabled, enabled));
    }

    if (providerId) {
      condicoes.push(eq(aiModel.providerId, providerId));
    }

    if (status) {
      condicoes.push(eq(aiModel.status, status));
    }

    return db.query.aiModel.findMany({
      where: condicoes.length > 0 ? and(...condicoes) : undefined,
      limit: limite,
      offset,
      orderBy: [asc(aiModel.displayName)],
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });
  },

  // Listar modelos com config original preservado
  findManyWithOriginalConfig: async (params: {
    enabled?: boolean;
    providerId?: string;
    status?: "active" | "archived";
    limite?: number;
    offset?: number;
  }) => {
    const { enabled, providerId, status, limite = 50, offset = 0 } = params;
    const condicoes = [];

    if (enabled !== undefined) {
      condicoes.push(eq(aiModel.enabled, enabled));
    }

    if (providerId) {
      condicoes.push(eq(aiModel.providerId, providerId));
    }

    if (status) {
      condicoes.push(eq(aiModel.status, status));
    }

    return db
      .select({
        id: aiModel.id,
        displayName: aiModel.displayName,
        universalModelId: aiModel.universalModelId,
        providerId: aiModel.providerId,
        status: aiModel.status,
        config: aiModel.config,
        originalConfig: aiModel.originalConfig, // Raw JSON string with preserved order
        enabled: aiModel.enabled,
        createdAt: aiModel.createdAt,
        updatedAt: aiModel.updatedAt,
      })
      .from(aiModel)
      .where(condicoes.length > 0 ? and(...condicoes) : undefined)
      .limit(limite)
      .offset(offset)
      .orderBy(asc(aiModel.displayName));
  },

  // Buscar modelos por provider (nome)
  findByProviderName: async (providerName: string) => {
    return db.query.aiModel.findMany({
      where: eq(
        aiModel.providerId,
        db
          .select({ id: aiProvider.id })
          .from(aiProvider)
          .where(eq(aiProvider.name, providerName))
          .limit(1),
      ),
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });
  },

  // Atualizar modelo
  update: async (id: string, data: Partial<typeof aiModel.$inferInsert>) => {
    await db
      .update(aiModel)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiModel.id, id));
    return AiModelRepository.findById(id);
  },

  // Bulk archive models - High-performance operation using set-based SQL
  bulkArchive: async (modelIds: string[]): Promise<number> => {
    if (modelIds.length === 0) return 0;

    await db
      .update(aiModel)
      .set({
        status: "archived",
        enabled: false,
        updatedAt: new Date(),
      })
      .where(inArray(aiModel.id, modelIds));

    // Return the number of IDs that were processed
    return modelIds.length;
  },

  // Excluir modelo
  delete: async (id: string) => {
    return db.transaction(async (tx) => {
      // Verificar se há chat sessions usando este modelo
      const [sessionsCount] = await tx
        .select({ count: count() })
        .from(chatSession)
        .where(eq(chatSession.aiModelId, id));

      if ((sessionsCount?.count ?? 0) > 0) {
        throw new Error(
          `Não é possível excluir modelo: ${sessionsCount?.count ?? 0} sessões de chat dependem dele`,
        );
      }

      // Verificar se há chat folders usando este modelo
      const [foldersCount] = await tx
        .select({ count: count() })
        .from(chatFolder)
        .where(eq(chatFolder.aiModelId, id));

      if ((foldersCount?.count ?? 0) > 0) {
        throw new Error(
          `Não é possível excluir modelo: ${foldersCount?.count ?? 0} pastas de chat dependem dele`,
        );
      }

      // Excluir modelo
      await tx.delete(aiModel).where(eq(aiModel.id, id));
    });
  },

  // Buscar modelo por universalModelId
  findByUniversalModelId: async (universalModelId: string) => {
    return db.query.aiModel.findFirst({
      where: eq(aiModel.universalModelId, universalModelId),
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });
  },

  // Upsert modelo (update if exists, create if not)
  upsert: async (data: {
    displayName: string;
    universalModelId: string;
    providerId: string;
    config?: any;
    enabled?: boolean;
    status?: "active" | "archived";
  }) => {
    const existingModel = await AiModelRepository.findByUniversalModelId(
      data.universalModelId,
    );

    if (existingModel) {
      // Update existing model
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await db
        .update(aiModel)
        .set(updateData)
        .where(eq(aiModel.universalModelId, data.universalModelId));
      return AiModelRepository.findById(existingModel.id);
    } else {
      // Create new model
      const [result] = await db.insert(aiModel).values(data).$returningId();
      if (!result) throw new Error("Falha ao criar modelo");
      return AiModelRepository.findById(result.id);
    }
  },
};

export const AiLibraryRepository = {
  // Criar nova biblioteca
  create: async (data: { name: string; teamId: string; files?: any }) => {
    const [result] = await db.insert(aiLibrary).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar biblioteca");
    return AiLibraryRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiLibrary.findFirst({
      where: eq(aiLibrary.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        agents: {
          columns: { id: true, name: true },
        },
      },
    });
  },

  // Listar por team
  findByTeam: async (params: {
    teamId: string;
    busca?: string;
    limite?: number;
    offset?: number;
  }) => {
    const { teamId, busca, limite = 20, offset = 0 } = params;
    const condicoes = [eq(aiLibrary.teamId, teamId)];

    if (busca) {
      condicoes.push(like(aiLibrary.name, `%${busca}%`));
    }

    return db.query.aiLibrary.findMany({
      where: and(...condicoes),
      limit: limite,
      offset,
      orderBy: [desc(aiLibrary.createdAt)],
      with: {
        agents: {
          columns: { id: true, name: true },
        },
      },
    });
  },

  // Contar por team
  countByTeam: async (teamId: string, busca?: string) => {
    const condicoes = [eq(aiLibrary.teamId, teamId)];

    if (busca) {
      condicoes.push(like(aiLibrary.name, `%${busca}%`));
    }

    const [result] = await db
      .select({ count: count() })
      .from(aiLibrary)
      .where(and(...condicoes));

    return result?.count ?? 0;
  },

  // Atualizar biblioteca
  update: async (id: string, data: Partial<typeof aiLibrary.$inferInsert>) => {
    await db
      .update(aiLibrary)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiLibrary.id, id));
    return AiLibraryRepository.findById(id);
  },

  // Excluir biblioteca
  delete: async (id: string) => {
    await db.delete(aiLibrary).where(eq(aiLibrary.id, id));
  },
};

export const AiAgentRepository = {
  // Criar novo agente
  create: async (data: {
    name: string;
    teamId: string;
    createdById: string;
    instructions: string; // Obrigatório conforme o plano
    libraryId?: string;
  }) => {
    try {
      // Verificar se o team existe
      const teamExists = await db.query.teams.findFirst({
        where: eq(teams.id, data.teamId),
        columns: { id: true },
      });

      // Verificar se o user existe
      const userExists = await db.query.users.findFirst({
        where: eq(users.id, data.createdById),
        columns: { id: true },
      });

      // Verificar se a library existe (se fornecida)
      if (data.libraryId && data.libraryId.trim() !== "") {
        const libraryExists = await db.query.aiLibrary.findFirst({
          where: eq(aiLibrary.id, data.libraryId),
          columns: { id: true },
        });

        if (!libraryExists) {
          throw new Error(`Biblioteca com ID ${data.libraryId} não encontrada`);
        }
      }

      // Limpar libraryId se for string vazia ou inválida
      const cleanedData = {
        ...data,
        libraryId:
          data.libraryId && data.libraryId.trim() !== ""
            ? data.libraryId
            : undefined,
      };

      const [result] = await db
        .insert(aiAgent)
        .values(cleanedData)
        .$returningId();

      if (!result) {
        console.error("[AiAgentRepository.create] No result from insert");
        throw new Error("Falha ao criar agente");
      }

      const createdAgent = await AiAgentRepository.findById(result.id);

      return createdAgent;
    } catch (error: any) {
      console.error("[AiAgentRepository.create] Error occurred:", error);
      console.error("[AiAgentRepository.create] Error details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        errno: error?.errno,
        sqlState: error?.sqlState,
        sqlMessage: error?.sqlMessage,
      });
      throw error;
    }
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiAgent.findFirst({
      where: eq(aiAgent.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        createdBy: {
          columns: { id: true, name: true, email: true },
        },
        library: {
          columns: { id: true, name: true, files: true },
        },
      },
    });
  },

  // Listar por team
  findByTeam: async (params: {
    teamId: string;
    busca?: string;
    createdById?: string;
    limite?: number;
    offset?: number;
    ordenarPor?: "name" | "createdAt";
    ordem?: "asc" | "desc";
  }) => {
    const {
      teamId,
      busca,
      createdById,
      limite = 20,
      offset = 0,
      ordenarPor = "createdAt",
      ordem = "desc",
    } = params;

    const condicoes = [eq(aiAgent.teamId, teamId)];

    if (busca) {
      condicoes.push(like(aiAgent.name, `%${busca}%`));
    }

    if (createdById) {
      condicoes.push(eq(aiAgent.createdById, createdById));
    }

    return db.query.aiAgent.findMany({
      where: and(...condicoes),
      limit: limite,
      offset,
      orderBy:
        ordem === "desc"
          ? [desc(aiAgent[ordenarPor])]
          : [asc(aiAgent[ordenarPor])],
      with: {
        createdBy: {
          columns: { id: true, name: true },
        },
        library: {
          columns: { id: true, name: true },
        },
      },
    });
  },

  // Contar por team
  countByTeam: async (teamId: string, busca?: string, createdById?: string) => {
    const condicoes = [eq(aiAgent.teamId, teamId)];

    if (busca) {
      condicoes.push(like(aiAgent.name, `%${busca}%`));
    }

    if (createdById) {
      condicoes.push(eq(aiAgent.createdById, createdById));
    }

    const [result] = await db
      .select({ count: count() })
      .from(aiAgent)
      .where(and(...condicoes));

    return result?.count ?? 0;
  },

  // Atualizar agente
  update: async (id: string, data: Partial<typeof aiAgent.$inferInsert>) => {
    await db
      .update(aiAgent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiAgent.id, id));
    return AiAgentRepository.findById(id);
  },

  // Excluir agente
  delete: async (id: string) => {
    await db.delete(aiAgent).where(eq(aiAgent.id, id));
  },

  // Soft delete
  softDelete: async (id: string) => {
    // Como não há campo 'active' no schema, apenas atualiza updatedAt
    // Pode ser implementado adicionando um campo 'deletedAt' ou 'active' no schema
    await db
      .update(aiAgent)
      .set({ updatedAt: new Date() })
      .where(eq(aiAgent.id, id));
    return AiAgentRepository.findById(id);
  },
};

export const AiTeamProviderTokenRepository = {
  // Criar token
  create: async (data: {
    teamId: string;
    providerId: string;
    token: string;
  }) => {
    try {
      // Criptografar token antes de salvar
      const encryptedToken = encryptToken(data.token);

      const [result] = await db
        .insert(aiTeamProviderToken)
        .values({
          ...data,
          token: encryptedToken,
        })
        .$returningId();
      if (!result) throw new Error("Falha ao criar token");
      return AiTeamProviderTokenRepository.findById(result.id);
    } catch (error: any) {
      // Tratar erro de unique constraint violation
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Token já existe para este provider e equipe");
      }
      throw error;
    }
  },

  // Buscar por ID
  findById: async (id: string) => {
    const result = await db.query.aiTeamProviderToken.findFirst({
      where: eq(aiTeamProviderToken.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });

    if (!result) return null;

    // Descriptografar token antes de retornar
    return {
      ...result,
      token: decryptToken(result.token),
    };
  },

  // Buscar token por team e provider
  findByTeamAndProvider: async (teamId: string, providerId: string) => {
    const result = await db.query.aiTeamProviderToken.findFirst({
      where: and(
        eq(aiTeamProviderToken.teamId, teamId),
        eq(aiTeamProviderToken.providerId, providerId),
      ),
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });

    if (!result) return null;

    // Descriptografar token antes de retornar
    return {
      ...result,
      token: decryptToken(result.token),
    };
  },

  // Buscar token por team e provider name
  findByTeamAndProviderName: async (teamId: string, providerName: string) => {
    const provider = await AiProviderRepository.findByName(providerName);
    if (!provider) {
      return null;
    }
    return AiTeamProviderTokenRepository.findByTeamAndProvider(
      teamId,
      provider.id,
    );
  },

  // Listar tokens por team
  findByTeam: async (teamId: string) => {
    const results = await db.query.aiTeamProviderToken.findMany({
      where: eq(aiTeamProviderToken.teamId, teamId),
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
      orderBy: [asc(aiTeamProviderToken.createdAt)],
    });

    // Descriptografar todos os tokens antes de retornar
    return results.map((result) => ({
      ...result,
      token: decryptToken(result.token),
    }));
  },

  // Atualizar token
  update: async (id: string, token: string) => {
    // Criptografar token antes de atualizar
    const encryptedToken = encryptToken(token);

    await db
      .update(aiTeamProviderToken)
      .set({ token: encryptedToken, updatedAt: new Date() })
      .where(eq(aiTeamProviderToken.id, id));
    return AiTeamProviderTokenRepository.findById(id);
  },

  // Excluir token
  delete: async (id: string) => {
    await db.delete(aiTeamProviderToken).where(eq(aiTeamProviderToken.id, id));
  },

  // Excluir por team e provider
  deleteByTeamAndProvider: async (teamId: string, providerId: string) => {
    await db
      .delete(aiTeamProviderToken)
      .where(
        and(
          eq(aiTeamProviderToken.teamId, teamId),
          eq(aiTeamProviderToken.providerId, providerId),
        ),
      );
  },
};

export const AiTeamModelConfigRepository = {
  // Criar configuração do modelo
  create: async (data: {
    teamId: string;
    modelId: string;
    enabled?: boolean;
    isDefault?: boolean;
    priority?: number;
    config?: any;
  }) => {
    try {
      const [result] = await db
        .insert(aiTeamModelConfig)
        .values(data)
        .$returningId();
      if (!result) throw new Error("Falha ao criar configuração do modelo");
      return AiTeamModelConfigRepository.findById(result.id);
    } catch (error: any) {
      // Tratar erro de unique constraint violation
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Configuração já existe para este modelo e team");
      }
      throw error;
    }
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiTeamModelConfig.findFirst({
      where: eq(aiTeamModelConfig.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        model: {
          columns: { id: true, displayName: true, enabled: true },
          with: {
            provider: {
              columns: { id: true, name: true, baseUrl: true },
            },
          },
        },
      },
    });
  },

  // Buscar configuração específica por team e modelo
  findByTeamAndModel: async (teamId: string, modelId: string) => {
    return db.query.aiTeamModelConfig.findFirst({
      where: and(
        eq(aiTeamModelConfig.teamId, teamId),
        eq(aiTeamModelConfig.modelId, modelId),
      ),
      with: {
        model: {
          columns: { id: true, displayName: true, enabled: true },
          with: {
            provider: {
              columns: { id: true, name: true, baseUrl: true },
            },
          },
        },
      },
    });
  },

  // Listar configurações de modelos por team
  findByTeam: async (params: {
    teamId: string;
    enabled?: boolean;
    limite?: number;
    offset?: number;
  }) => {
    const { teamId, enabled, limite = 50, offset = 0 } = params;
    const condicoes = [eq(aiTeamModelConfig.teamId, teamId)];

    if (enabled !== undefined) {
      condicoes.push(eq(aiTeamModelConfig.enabled, enabled));
    }

    return db.query.aiTeamModelConfig.findMany({
      where: and(...condicoes),
      limit: limite,
      offset,
      orderBy: [
        asc(aiTeamModelConfig.priority),
        asc(aiTeamModelConfig.createdAt),
      ],
      with: {
        model: {
          columns: { id: true, displayName: true, enabled: true },
          with: {
            provider: {
              columns: { id: true, name: true, baseUrl: true },
            },
          },
        },
      },
    });
  },

  // Listar apenas modelos ativos por team
  findActiveModelsByTeam: async (teamId: string) => {
    return db.query.aiTeamModelConfig.findMany({
      where: and(
        eq(aiTeamModelConfig.teamId, teamId),
        eq(aiTeamModelConfig.enabled, true),
      ),
      orderBy: [asc(aiTeamModelConfig.priority)],
      with: {
        model: {
          with: {
            provider: true,
          },
        },
      },
    });
  },

  // Toggle model activation for a team
  toggleModel: async (teamId: string, modelId: string, enabled: boolean) => {
    // Check if configuration already exists
    const existing = await AiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      modelId,
    );

    if (existing) {
      // If trying to disable and it's the default model, validate
      if (!enabled && existing.isDefault) {
        // Check if there are other enabled models
        const enabledModels = await AiTeamModelConfigRepository.findByTeam({
          teamId,
          enabled: true,
        });

        // If there's only one enabled model (the current one), don't allow disabling
        if (enabledModels.length <= 1) {
          throw new Error(
            "Cannot disable the only active model. Enable another model first.",
          );
        }

        // If there are other models, user needs to choose a new default
        throw new Error(
          "This is the default model. Choose another model as default before disabling it.",
        );
      }

      // If enabling a model, check if we need to set it as default
      if (enabled) {
        // Check if there's any default model for this team
        const defaultModel =
          await AiTeamModelConfigRepository.getDefaultModel(teamId);

        if (!defaultModel) {
          // No default model exists, set this one as default
          return db.transaction(async (tx) => {
            // Update the model to enabled
            await tx
              .update(aiTeamModelConfig)
              .set({ enabled: true, isDefault: true, updatedAt: new Date() })
              .where(eq(aiTeamModelConfig.id, existing.id));

            return AiTeamModelConfigRepository.findById(existing.id);
          });
        }
      }

      // Update existing configuration
      return AiTeamModelConfigRepository.update(existing.id, { enabled });
    } else {
      // Check if this is the first model being enabled for this team
      const enabledCount = await AiTeamModelConfigRepository.countByTeam(
        teamId,
        true,
      );
      const isFirstEnabled = enabled && enabledCount === 0;

      // Create new configuration
      return AiTeamModelConfigRepository.create({
        teamId,
        modelId,
        enabled,
        isDefault: isFirstEnabled, // Mark as default if it's the first
      });
    }
  },

  // Definir modelo padrão
  setDefaultModel: async (teamId: string, modelId: string) => {
    // Verificar se o modelo está habilitado para este team
    const modelConfig = await AiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      modelId,
    );

    if (!modelConfig?.enabled) {
      throw new Error(
        "Modelo deve estar habilitado para ser definido como padrão",
      );
    }

    // Começar transação: remover isDefault de todos os outros modelos
    await db.transaction(async (tx) => {
      // Desmarcar todos os outros modelos como padrão
      await tx
        .update(aiTeamModelConfig)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(aiTeamModelConfig.teamId, teamId));

      // Marcar o modelo específico como padrão
      await tx
        .update(aiTeamModelConfig)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(aiTeamModelConfig.teamId, teamId),
            eq(aiTeamModelConfig.modelId, modelId),
          ),
        );
    });

    return AiTeamModelConfigRepository.findByTeamAndModel(teamId, modelId);
  },

  // Buscar modelo padrão do team
  getDefaultModel: async (teamId: string) => {
    const model = await db.query.aiTeamModelConfig.findFirst({
      where: and(
        eq(aiTeamModelConfig.teamId, teamId),
        eq(aiTeamModelConfig.enabled, true),
        eq(aiTeamModelConfig.isDefault, true),
      ),
      with: {
        model: {
          with: {
            provider: true,
          },
        },
      },
    });
    return model ?? null;
  },

  // Definir prioridade dos modelos
  setPriority: async (teamId: string, modelId: string, priority: number) => {
    const existing = await AiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      modelId,
    );

    if (existing) {
      return AiTeamModelConfigRepository.update(existing.id, { priority });
    } else {
      return AiTeamModelConfigRepository.create({
        teamId,
        modelId,
        enabled: false,
        priority,
      });
    }
  },

  // Reordenar todas as prioridades dos modelos de um team
  reorderAllPriorities: async (teamId: string, orderedModelIds: string[]) => {
    return db.transaction(async (tx) => {
      // Para cada modelo na nova ordem, definir prioridade = índice
      const updatePromises = orderedModelIds.map(async (modelId, index) => {
        // Verificar se já existe configuração para este modelo
        const existing = await tx.query.aiTeamModelConfig.findFirst({
          where: and(
            eq(aiTeamModelConfig.teamId, teamId),
            eq(aiTeamModelConfig.modelId, modelId),
          ),
        });

        if (existing) {
          // Atualizar prioridade existente
          await tx
            .update(aiTeamModelConfig)
            .set({ priority: index, updatedAt: new Date() })
            .where(eq(aiTeamModelConfig.id, existing.id));
        } else {
          // Criar nova configuração com prioridade
          await tx.insert(aiTeamModelConfig).values({
            teamId,
            modelId,
            enabled: false,
            priority: index,
          });
        }
      });

      await Promise.all(updatePromises);

      // Retornar modelos atualizados
      return AiTeamModelConfigRepository.findAvailableModelsByTeam(teamId);
    });
  },

  // Atualizar configuração do modelo
  update: async (
    id: string,
    data: Partial<typeof aiTeamModelConfig.$inferInsert>,
  ) => {
    await db
      .update(aiTeamModelConfig)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiTeamModelConfig.id, id));
    return AiTeamModelConfigRepository.findById(id);
  },

  // Excluir configuração do modelo
  delete: async (id: string) => {
    await db.delete(aiTeamModelConfig).where(eq(aiTeamModelConfig.id, id));
  },

  // Excluir por team e modelo
  deleteByTeamAndModel: async (teamId: string, modelId: string) => {
    await db
      .delete(aiTeamModelConfig)
      .where(
        and(
          eq(aiTeamModelConfig.teamId, teamId),
          eq(aiTeamModelConfig.modelId, modelId),
        ),
      );
  },

  // Contar configurações por team
  countByTeam: async (teamId: string, enabled?: boolean) => {
    const condicoes = [eq(aiTeamModelConfig.teamId, teamId)];

    if (enabled !== undefined) {
      condicoes.push(eq(aiTeamModelConfig.enabled, enabled));
    }

    const [result] = await db
      .select({ count: count() })
      .from(aiTeamModelConfig)
      .where(and(...condicoes));

    return result?.count ?? 0;
  },

  // Buscar modelos disponíveis para um team (filtrando pelos que o team tem token do provider)
  findAvailableModelsByTeam: async (teamId: string) => {
    // Buscar tokens de provedores que o team possui
    const teamTokens = await AiTeamProviderTokenRepository.findByTeam(teamId);
    const providerIds = teamTokens.map((token) => token.providerId);

    if (providerIds.length === 0) {
      return []; // Team não tem tokens de nenhum provedor
    }

    // Buscar todos os modelos ativos globalmente primeiro
    const allEnabledModels = await db.query.aiModel.findMany({
      where: eq(aiModel.enabled, true),
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });

    // Filtrar apenas modelos dos provedores que o team tem token
    const modelsWithTokens = allEnabledModels.filter((model) =>
      providerIds.includes(model.providerId),
    );

    // Buscar configurações específicas do team para estes modelos
    const modelIds = modelsWithTokens.map((model) => model.id);
    let teamConfigs: any[] = [];

    if (modelIds.length > 0) {
      teamConfigs = await db.query.aiTeamModelConfig.findMany({
        where: and(
          eq(aiTeamModelConfig.teamId, teamId),
          inArray(aiTeamModelConfig.modelId, modelIds),
        ),
      });
    }

    // Mapear modelos com suas configurações do team
    const availableModels = modelsWithTokens.map((model) => {
      const teamConfig = teamConfigs.find(
        (config) => config.modelId === model.id,
      );
      return {
        ...model,
        teamConfig: teamConfig || null,
      };
    });

    // Ordenar por provedor (alfabeticamente), depois por prioridade, mantendo ordem fixa
    return availableModels.sort((a, b) => {
      // 1. Primeiro ordenar por provedor (ordem alfabética)
      const providerComparison = (a.provider.name || "").localeCompare(
        b.provider.name || "",
      );
      if (providerComparison !== 0) {
        return providerComparison;
      }

      // 2. Dentro do mesmo provedor, ordenar por prioridade (se configurado)
      if (
        a.teamConfig?.priority !== undefined &&
        b.teamConfig?.priority !== undefined
      ) {
        return a.teamConfig.priority - b.teamConfig.priority;
      }

      // Se apenas A tem prioridade, A vem primeiro
      if (
        a.teamConfig?.priority !== undefined &&
        b.teamConfig?.priority === undefined
      ) {
        return -1;
      }

      // Se apenas B tem prioridade, B vem primeiro
      if (
        a.teamConfig?.priority === undefined &&
        b.teamConfig?.priority !== undefined
      ) {
        return 1;
      }

      // 3. Por último, ordenar por nome do modelo (ordem fixa independente do status)
      return a.displayName.localeCompare(b.displayName);
    });
  },

  // Testar se um modelo está funcionando
  testModel: async (
    teamId: string,
    modelId: string,
    testPrompt = "Olá! Você está funcionando corretamente?",
  ) => {
    try {
      // 1. Verificar se o modelo está disponível para o team
      const availableModels =
        await AiTeamModelConfigRepository.findAvailableModelsByTeam(teamId);

      const modelData = availableModels.find((m) => m.id === modelId);

      if (!modelData) {
        throw new Error(
          `Modelo não encontrado ou não disponível para este time. Verifique se o token do provedor está configurado.`,
        );
      }

      if (!modelData.provider) {
        throw new Error("Dados do provedor não foram carregados");
      }

      // 2. Buscar token do provedor
      const providerToken =
        await AiTeamProviderTokenRepository.findByTeamAndProvider(
          teamId,
          modelData.providerId,
        );

      if (!providerToken?.token) {
        throw new Error(
          `❌ Token de API não configurado para o provedor ${modelData.provider.name}. Configure o token na seção "Tokens de Acesso" antes de testar o modelo.`,
        );
      }

      // 3. Preparar configurações para o teste
      const modelConfig = (modelData.config as any) || {};
      const modelName =
        modelConfig.modelId || modelConfig.version || modelData.displayName;
      const baseUrl = modelData.provider.baseUrl || "https://api.openai.com/v1";

      // 4. Fazer uma chamada de teste usando configuração específica por provider
      const startTime = Date.now();
      const providerName = modelData.provider.name.toLowerCase();

      // Configure request based on provider
      let requestUrl = `${baseUrl}/chat/completions`;
      let requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      let requestBody: any = {
        model: modelName,
        messages: [
          {
            role: "user",
            content: testPrompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      };

      // Provider-specific configurations
      if (providerName === "google") {
        // Validate Google model name and provide suggestions
        const validation = validateGoogleModelName(modelName);
        if (!validation.isValid) {
          console.warn(
            `⚠️ [TEST] Google model name validation failed: ${modelName}`,
          );
          if (validation.suggestion) {
            console.warn(`💡 [TEST] Suggestion: ${validation.suggestion}`);
          }
        }

        requestUrl = `${baseUrl}/models/${modelName}:generateContent`;
        requestHeaders = {
          "Content-Type": "application/json",
          "x-goog-api-key": providerToken.token,
        };
        requestBody = {
          contents: [
            {
              parts: [
                {
                  text: testPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        };
      } else if (providerName === "anthropic") {
        requestUrl = `${baseUrl}/messages`;
        requestHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerToken.token}`,
          "anthropic-version": "2023-06-01",
        };
        requestBody = {
          model: modelName,
          max_tokens: 50,
          messages: [
            {
              role: "user",
              content: testPrompt,
            },
          ],
        };
      } else if (providerName === "xai") {
        requestUrl = `${baseUrl}/chat/completions`;
        requestHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerToken.token}`,
        };
        // XAI uses standard OpenAI format
      } else {
        // Default to OpenAI format
        requestHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerToken.token}`,
        };
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const testResponse = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error(
          `❌ [TEST] API Error: ${testResponse.status} - ${errorText}`,
        );

        // Create detailed error message
        const errorDetails = {
          provider: modelData.provider.name,
          model: modelName,
          status: testResponse.status,
          statusText: testResponse.statusText,
          endpoint: requestUrl,
          error: errorText,
          debugInfo: {
            baseUrl,
            providerName,
            modelId: modelData.id,
            hasToken: !!providerToken.token,
            tokenPrefix: providerToken.token.substring(0, 8) + "...",
          },
        };

        throw new Error(
          `API Error [${testResponse.status}]: ${errorText}\n\nDebug Info:\n${JSON.stringify(errorDetails, null, 2)}`,
        );
      }

      const testResult = (await testResponse.json()) as any;

      let responseText = "";
      let usage = null;

      // Parse response based on provider
      if (providerName === "google") {
        // Google Gemini format
        if (testResult.candidates && testResult.candidates.length > 0) {
          const candidate = testResult.candidates[0];

          if (candidate.content?.parts && candidate.content.parts.length > 0) {
            responseText =
              candidate.content.parts[0].text || "No response text";
          } else {
          }
        } else {
        }

        if (testResult.usageMetadata) {
          usage = {
            promptTokens: testResult.usageMetadata.promptTokenCount || 0,
            completionTokens:
              testResult.usageMetadata.candidatesTokenCount || 0,
            totalTokens: testResult.usageMetadata.totalTokenCount || 0,
          };
        }
      } else if (providerName === "anthropic") {
        // Anthropic format
        if (testResult.content && testResult.content.length > 0) {
          responseText = testResult.content[0].text || "No response text";
        }

        if (testResult.usage) {
          usage = {
            promptTokens: testResult.usage.input_tokens || 0,
            completionTokens: testResult.usage.output_tokens || 0,
            totalTokens:
              (testResult.usage.input_tokens || 0) +
              (testResult.usage.output_tokens || 0),
          };
        }
      } else {
        // OpenAI/XAI format
        if (!testResult.choices || testResult.choices.length === 0) {
          throw new Error("API response doesn't contain valid choices");
        }

        responseText =
          testResult.choices[0]?.message?.content || "No response text";
        usage = testResult.usage;
      }

      if (!responseText) {
        throw new Error("Unable to extract response text from API response");
      }

      const successResult = {
        success: true,
        modelName,
        providerName: modelData.provider.name,
        responseText,
        usage,
        latencyMs,
        testPrompt,
        timestamp: new Date().toISOString(),
      };

      return successResult;
    } catch (error: any) {
      console.error(
        `❌ [TEST_ERROR] Erro ao testar modelo ${modelId}:`,
        error.message,
      );

      let errorMessage = error.message;

      // Handle timeout errors specifically
      if (error.name === "AbortError") {
        errorMessage = `Timeout: O modelo ${modelId} não respondeu em 30 segundos. Isso pode indicar que o modelo está sobrecarregado ou há problemas de rede. Tente novamente em alguns minutos.`;
      }

      const errorResult = {
        success: false,
        modelId,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };

      return errorResult;
    }
  },
};
