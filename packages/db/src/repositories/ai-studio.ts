import { and, asc, count, desc, eq, like } from "drizzle-orm";

import { db } from "../client";
import {
  aiAgent,
  aiLibrary,
  aiModel,
  aiModelToken,
} from "../schema/apps/ai-studio";

export const AiModelRepository = {
  // Criar novo modelo
  create: async (data: {
    name: string;
    provider: string;
    config?: any;
    enabled?: boolean;
  }) => {
    const [result] = await db.insert(aiModel).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar modelo");
    return AiModelRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiModel.findFirst({
      where: eq(aiModel.id, id),
      with: {
        tokens: true,
      },
    });
  },

  // Listar modelos ativos
  findMany: async (params: {
    enabled?: boolean;
    provider?: string;
    limite?: number;
    offset?: number;
  }) => {
    const { enabled, provider, limite = 50, offset = 0 } = params;
    const condicoes = [];

    if (enabled !== undefined) {
      condicoes.push(eq(aiModel.enabled, enabled));
    }

    if (provider) {
      condicoes.push(eq(aiModel.provider, provider));
    }

    return db.query.aiModel.findMany({
      where: condicoes.length > 0 ? and(...condicoes) : undefined,
      limit: limite,
      offset,
      orderBy: [asc(aiModel.name)],
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

  // Excluir modelo
  delete: async (id: string) => {
    await db.delete(aiModel).where(eq(aiModel.id, id));
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
    const [result] = await db.insert(aiAgent).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar agente");
    return AiAgentRepository.findById(result.id);
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

export const AiModelTokenRepository = {
  // Criar token
  create: async (data: { teamId: string; modelId: string; token: string }) => {
    try {
      const [result] = await db
        .insert(aiModelToken)
        .values(data)
        .$returningId();
      if (!result) throw new Error("Falha ao criar token");
      return AiModelTokenRepository.findById(result.id);
    } catch (error: any) {
      // Tratar erro de unique constraint violation
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Token já existe para este modelo e equipe");
      }
      throw error;
    }
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.aiModelToken.findFirst({
      where: eq(aiModelToken.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        model: {
          columns: { id: true, name: true, provider: true },
        },
      },
    });
  },

  // Buscar token por team e modelo
  findByTeamAndModel: async (teamId: string, modelId: string) => {
    return db.query.aiModelToken.findFirst({
      where: and(
        eq(aiModelToken.teamId, teamId),
        eq(aiModelToken.modelId, modelId),
      ),
      with: {
        model: {
          columns: { id: true, name: true, provider: true },
        },
      },
    });
  },

  // Listar tokens por team
  findByTeam: async (teamId: string) => {
    return db.query.aiModelToken.findMany({
      where: eq(aiModelToken.teamId, teamId),
      with: {
        model: {
          columns: { id: true, name: true, provider: true, enabled: true },
        },
      },
      orderBy: [asc(aiModelToken.createdAt)],
    });
  },

  // Atualizar token
  update: async (id: string, token: string) => {
    await db
      .update(aiModelToken)
      .set({ token, updatedAt: new Date() })
      .where(eq(aiModelToken.id, id));
    return AiModelTokenRepository.findById(id);
  },

  // Excluir token
  delete: async (id: string) => {
    await db.delete(aiModelToken).where(eq(aiModelToken.id, id));
  },

  // Excluir por team e modelo
  deleteByTeamAndModel: async (teamId: string, modelId: string) => {
    await db
      .delete(aiModelToken)
      .where(
        and(eq(aiModelToken.teamId, teamId), eq(aiModelToken.modelId, modelId)),
      );
  },
};
