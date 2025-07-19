import { and, asc, count, desc, eq, inArray, like, sql } from "drizzle-orm";

import { db } from "../client";
import {
  aiAgent,
  aiLibrary,
  aiModel,
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

// AiProviderRepository has been removed - providers are now managed via JSON configuration
// Use ProviderConfigService from @kdx/api for provider operations

export const AiModelRepository = {
  // Criar novo modelo
  create: async (data: {
    modelId: string;
    providerId: string;
    config?: any;
    enabled?: boolean;
    status?: "active" | "archived";
  }) => {
    await db
      .insert(aiModel)
      .values(data);
    return AiModelRepository.findById(data.modelId);
  },

  // Buscar por ID
  findById: async (modelId: string) => {
    return db.query.aiModel.findFirst({
      where: eq(aiModel.modelId, modelId),
      // Note: provider information should be fetched separately using ProviderConfigService
    });
  },

  // Buscar por ID com config original preservado
  findByIdWithOriginalConfig: async (modelId: string) => {
    const result = await db
      .select({
        modelId: aiModel.modelId,
        providerId: aiModel.providerId,
        status: aiModel.status,
        config: aiModel.config,
        originalConfig: aiModel.originalConfig, // Raw JSON string with preserved order
        enabled: aiModel.enabled,
        createdAt: aiModel.createdAt,
        updatedAt: aiModel.updatedAt,
      })
      .from(aiModel)
      .where(eq(aiModel.modelId, modelId))
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
      orderBy: [asc(aiModel.modelId)],
      // Note: provider information should be fetched separately using ProviderConfigService
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
        modelId: aiModel.modelId,
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
      .orderBy(asc(aiModel.modelId));
  },

  // Buscar modelos por provider (nome) - DEPRECATED
  // Use ProviderConfigService.getProviderByName() and then filter models by providerId
  findByProviderName: async (providerName: string) => {
    throw new Error("findByProviderName is deprecated. Use ProviderConfigService.getProviderByName() and filter models by providerId instead.");
  },

  // Atualizar modelo
  update: async (modelId: string, data: Partial<typeof aiModel.$inferInsert>) => {
    await db
      .update(aiModel)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiModel.modelId, modelId));
    return AiModelRepository.findById(modelId);
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
      .where(inArray(aiModel.modelId, modelIds));

    // Return the number of IDs that were processed
    return modelIds.length;
  },

  // Excluir modelo
  delete: async (modelId: string) => {
    return db.transaction(async (tx) => {
      // Verificar se há chat sessions usando este modelo
      const [sessionsCount] = await tx
        .select({ count: count() })
        .from(chatSession)
        .where(eq(chatSession.aiModelId, modelId));

      if ((sessionsCount?.count ?? 0) > 0) {
        throw new Error(
          `Não é possível excluir modelo: ${sessionsCount?.count ?? 0} sessões de chat dependem dele`,
        );
      }

      // Verificar se há chat folders usando este modelo
      const [foldersCount] = await tx
        .select({ count: count() })
        .from(chatFolder)
        .where(eq(chatFolder.aiModelId, modelId));

      if ((foldersCount?.count ?? 0) > 0) {
        throw new Error(
          `Não é possível excluir modelo: ${foldersCount?.count ?? 0} pastas de chat dependem dele`,
        );
      }

      // Excluir modelo
      await tx.delete(aiModel).where(eq(aiModel.modelId, modelId));
    });
  },


  // Upsert modelo (update if exists, create if not)
  upsert: async (data: {
    modelId: string;
    providerId: string;
    config?: any;
    enabled?: boolean;
    status?: "active" | "archived";
  }) => {
    const existingModel = await AiModelRepository.findById(data.modelId);

    if (existingModel) {
      // Update existing model
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await db
        .update(aiModel)
        .set(updateData)
        .where(eq(aiModel.modelId, data.modelId));
      return AiModelRepository.findById(data.modelId);
    } else {
      // Create new model
      await db.insert(aiModel).values(data);
      return AiModelRepository.findById(data.modelId);
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
        // Note: provider information should be fetched separately using ProviderConfigService
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
      // Note: provider information should be fetched separately using ProviderConfigService
    });

    if (!result) return null;

    // Descriptografar token antes de retornar
    return {
      ...result,
      token: decryptToken(result.token),
    };
  },

  // Buscar token por team e provider name - DEPRECATED
  // Use ProviderConfigService.getProviderByName() and then call findByTeamAndProvider()
  findByTeamAndProviderName: async (teamId: string, providerName: string) => {
    throw new Error("findByTeamAndProviderName is deprecated. Use ProviderConfigService.getProviderByName() and then call findByTeamAndProvider() instead.");
  },

  // Listar tokens por team
  findByTeam: async (teamId: string) => {
    const results = await db.query.aiTeamProviderToken.findMany({
      where: eq(aiTeamProviderToken.teamId, teamId),
      // Note: provider information should be fetched separately using ProviderConfigService
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
    aiModelId: string;
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
          columns: { modelId: true, enabled: true, providerId: true },
          // Note: provider information should be fetched separately using ProviderConfigService
        },
      },
    });
  },

  // Buscar configuração específica por team e modelo
  findByTeamAndModel: async (teamId: string, aiModelId: string) => {
    return db.query.aiTeamModelConfig.findFirst({
      where: and(
        eq(aiTeamModelConfig.teamId, teamId),
        eq(aiTeamModelConfig.aiModelId, aiModelId),
      ),
      with: {
        model: {
          columns: { modelId: true, enabled: true, providerId: true },
          // Note: provider information should be fetched separately using ProviderConfigService
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
          columns: { modelId: true, enabled: true, providerId: true },
          // Note: provider information should be fetched separately using ProviderConfigService
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
          columns: { modelId: true, enabled: true, providerId: true },
          // Note: provider information should be fetched separately using ProviderConfigService
        },
      },
    });
  },

  // Toggle model activation for a team
  toggleModel: async (teamId: string, aiModelId: string, enabled: boolean) => {
    // Check if configuration already exists
    const existing = await AiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      aiModelId,
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
        aiModelId,
        enabled,
        isDefault: isFirstEnabled, // Mark as default if it's the first
      });
    }
  },

  // Definir modelo padrão
  setDefaultModel: async (teamId: string, aiModelId: string) => {
    // Verificar se o modelo está habilitado para este team
    const modelConfig = await AiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      aiModelId,
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
            eq(aiTeamModelConfig.aiModelId, aiModelId),
          ),
        );
    });

    return AiTeamModelConfigRepository.findByTeamAndModel(teamId, aiModelId);
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
          columns: { modelId: true, enabled: true, providerId: true },
          // Note: provider information should be fetched separately using ProviderConfigService
        },
      },
    });
    return model ?? null;
  },

  // Definir prioridade dos modelos
  setPriority: async (teamId: string, aiModelId: string, priority: number) => {
    const existing = await AiTeamModelConfigRepository.findByTeamAndModel(
      teamId,
      aiModelId,
    );

    if (existing) {
      return AiTeamModelConfigRepository.update(existing.id, { priority });
    } else {
      return AiTeamModelConfigRepository.create({
        teamId,
        aiModelId,
        enabled: false,
        priority,
      });
    }
  },

  // Reordenar todas as prioridades dos modelos de um team
  reorderAllPriorities: async (teamId: string, orderedModelIds: string[]) => {
    return db.transaction(async (tx) => {
      // Para cada modelo na nova ordem, definir prioridade = índice
      const updatePromises = orderedModelIds.map(async (aiModelId, index) => {
        // Verificar se já existe configuração para este modelo
        const existing = await tx.query.aiTeamModelConfig.findFirst({
          where: and(
            eq(aiTeamModelConfig.teamId, teamId),
            eq(aiTeamModelConfig.aiModelId, aiModelId),
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
            aiModelId,
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
  deleteByTeamAndModel: async (teamId: string, aiModelId: string) => {
    await db
      .delete(aiTeamModelConfig)
      .where(
        and(
          eq(aiTeamModelConfig.teamId, teamId),
          eq(aiTeamModelConfig.aiModelId, aiModelId),
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
      // Note: provider information should be fetched separately using ProviderConfigService
    });

    // Filtrar apenas modelos dos provedores que o team tem token
    const modelsWithTokens = allEnabledModels.filter((model) =>
      providerIds.includes(model.providerId),
    );

    // Buscar configurações específicas do team para estes modelos
    const modelIds = modelsWithTokens.map((model) => model.modelId);
    let teamConfigs: any[] = [];

    if (modelIds.length > 0) {
      teamConfigs = await db.query.aiTeamModelConfig.findMany({
        where: and(
          eq(aiTeamModelConfig.teamId, teamId),
          inArray(aiTeamModelConfig.aiModelId, modelIds),
        ),
      });
    }

    // Mapear modelos com suas configurações do team
    const availableModels = modelsWithTokens.map((model) => {
      const teamConfig = teamConfigs.find(
        (config) => config.aiModelId === model.modelId,
      );
      return {
        ...model,
        teamConfig: teamConfig || null,
      };
    });

    // Ordenar por providerId (alfabeticamente), depois por prioridade, mantendo ordem fixa
    return availableModels.sort((a, b) => {
      // 1. Primeiro ordenar por provedor (ordem alfabética por providerId)
      const providerComparison = (a.providerId || "").localeCompare(
        b.providerId || "",
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
      return a.modelId.localeCompare(b.modelId);
    });
  },

  // testModel method has been moved to AiStudioService - DEPRECATED
  // This method contained business logic that should be in the service layer
  testModel: async (
    teamId: string,
    aiModelId: string,
    testPrompt = "Olá! Você está funcionando corretamente?",
  ) => {
    throw new Error("testModel is deprecated. Use AiStudioService.testModel() instead.");
  },
};
