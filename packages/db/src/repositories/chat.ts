import { and, asc, count, desc, eq, like } from "drizzle-orm";

import { db } from "../client";
import { chatFolder, chatMessage, chatSession } from "../schema/apps/chat";

export const ChatFolderRepository = {
  // Criar nova pasta
  create: async (data: {
    name: string;
    teamId: string;
    createdById: string;
    aiAgentId?: string;
    aiModelId?: string;
  }) => {
    const [result] = await db.insert(chatFolder).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar pasta");
    return ChatFolderRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.chatFolder.findFirst({
      where: eq(chatFolder.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        createdBy: {
          columns: { id: true, name: true, email: true },
        },
        aiAgent: {
          columns: { id: true, name: true, instructions: true },
        },
        aiModel: {
          columns: { modelId: true, providerId: true },
          with: {
            provider: {
              columns: { id: true, name: true },
            },
          },
        },
        sessions: {
          columns: { id: true, title: true, createdAt: true },
          orderBy: [desc(chatSession.createdAt)],
          limit: 10,
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

    const condicoes = [eq(chatFolder.teamId, teamId)];

    if (busca) {
      condicoes.push(like(chatFolder.name, `%${busca}%`));
    }

    if (createdById) {
      condicoes.push(eq(chatFolder.createdById, createdById));
    }

    return db.query.chatFolder.findMany({
      where: and(...condicoes),
      limit: limite,
      offset,
      orderBy:
        ordem === "desc"
          ? [desc(chatFolder[ordenarPor])]
          : [asc(chatFolder[ordenarPor])],
      with: {
        createdBy: {
          columns: { id: true, name: true },
        },
        aiAgent: {
          columns: { id: true, name: true },
        },
        aiModel: {
          columns: { modelId: true, providerId: true },
          with: {
            provider: {
              columns: { id: true, name: true },
            },
          },
        },
        sessions: {
          columns: { id: true, title: true, createdAt: true },
        },
      },
    });
  },

  // Contar por team
  countByTeam: async (teamId: string, busca?: string, createdById?: string) => {
    const condicoes = [eq(chatFolder.teamId, teamId)];

    if (busca) {
      condicoes.push(like(chatFolder.name, `%${busca}%`));
    }

    if (createdById) {
      condicoes.push(eq(chatFolder.createdById, createdById));
    }

    const [result] = await db
      .select({ count: count() })
      .from(chatFolder)
      .where(and(...condicoes));

    return result?.count ?? 0;
  },

  // Atualizar pasta
  update: async (id: string, data: Partial<typeof chatFolder.$inferInsert>) => {
    await db
      .update(chatFolder)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatFolder.id, id));

    return ChatFolderRepository.findById(id);
  },

  // Excluir pasta
  delete: async (id: string) => {
    await db.delete(chatFolder).where(eq(chatFolder.id, id));
  },
};

export const ChatSessionRepository = {
  // Criar nova sessão
  create: async (data: {
    title: string;
    teamId: string;
    userId: string;
    aiModelId: string;
    chatFolderId?: string;
    aiAgentId?: string;
  }) => {
    const [result] = await db.insert(chatSession).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar sessão");
    return ChatSessionRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.chatSession.findFirst({
      where: eq(chatSession.id, id),
      with: {
        team: {
          columns: { id: true, name: true },
        },
        user: {
          columns: { id: true, name: true, email: true },
        },
        chatFolder: {
          columns: { id: true, name: true },
        },
        aiAgent: {
          columns: { id: true, name: true, instructions: true },
          with: {
            library: {
              columns: { id: true, name: true, files: true },
            },
          },
        },
        aiModel: {
          columns: {
            modelId: true,
            providerId: true,
            config: true,
          },
          with: {
            provider: {
              columns: { id: true, name: true },
            },
          },
        },
        messages: {
          orderBy: [asc(chatMessage.createdAt)],
        },
      },
    });
  },

  // Listar por team
  findByTeam: async (params: {
    teamId: string;
    userId?: string;
    chatFolderId?: string;
    busca?: string;
    limite?: number;
    offset?: number;
    ordenarPor?: "title" | "createdAt" | "updatedAt";
    ordem?: "asc" | "desc";
  }) => {
    const {
      teamId,
      userId,
      chatFolderId,
      busca,
      limite = 20,
      offset = 0,
      ordenarPor = "updatedAt",
      ordem = "desc",
    } = params;

    const condicoes = [eq(chatSession.teamId, teamId)];

    if (userId) {
      condicoes.push(eq(chatSession.userId, userId));
    }

    if (chatFolderId) {
      condicoes.push(eq(chatSession.chatFolderId, chatFolderId));
    }

    if (busca) {
      condicoes.push(like(chatSession.title, `%${busca}%`));
    }

    return db.query.chatSession.findMany({
      where: and(...condicoes),
      limit: limite,
      offset,
      orderBy:
        ordem === "desc"
          ? [desc(chatSession[ordenarPor])]
          : [asc(chatSession[ordenarPor])],
      with: {
        user: {
          columns: { id: true, name: true },
        },
        chatFolder: {
          columns: { id: true, name: true },
        },
        aiAgent: {
          columns: { id: true, name: true },
        },
        aiModel: {
          columns: { modelId: true, providerId: true },
          with: {
            provider: {
              columns: { id: true, name: true },
            },
          },
        },
        messages: {
          columns: {
            id: true,
            senderRole: true,
            content: true,
            createdAt: true,
            metadata: true, // ✅ Incluir metadata
          },
          orderBy: [desc(chatMessage.createdAt)],
          limit: 1, // Apenas a última mensagem para preview
        },
      },
    });
  },

  // Contar por team
  countByTeam: async (
    teamId: string,
    userId?: string,
    chatFolderId?: string,
    busca?: string,
  ) => {
    const condicoes = [eq(chatSession.teamId, teamId)];

    if (userId) {
      condicoes.push(eq(chatSession.userId, userId));
    }

    if (chatFolderId) {
      condicoes.push(eq(chatSession.chatFolderId, chatFolderId));
    }

    if (busca) {
      condicoes.push(like(chatSession.title, `%${busca}%`));
    }

    const [result] = await db
      .select({ count: count() })
      .from(chatSession)
      .where(and(...condicoes));

    return result?.count ?? 0;
  },

  // Atualizar sessão
  update: async (
    id: string,
    data: Partial<typeof chatSession.$inferInsert>,
  ) => {
    await db
      .update(chatSession)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatSession.id, id));
  },

  // Excluir sessão
  delete: async (id: string) => {
    await db.delete(chatSession).where(eq(chatSession.id, id));
  },
};

export const ChatMessageRepository = {
  // Criar nova mensagem
  create: async (data: {
    chatSessionId: string;
    senderRole: string;
    content: string;
    status: string;
    metadata?: any;
  }) => {
    const [result] = await db.insert(chatMessage).values(data).$returningId();
    if (!result) throw new Error("Falha ao criar mensagem");

    // Atualizar timestamp da sessão
    await db
      .update(chatSession)
      .set({ updatedAt: new Date() })
      .where(eq(chatSession.id, data.chatSessionId));

    return ChatMessageRepository.findById(result.id);
  },

  // Buscar por ID
  findById: async (id: string) => {
    return db.query.chatMessage.findFirst({
      where: eq(chatMessage.id, id),
      with: {
        chatSession: {
          columns: { id: true, title: true, teamId: true, userId: true },
        },
      },
    });
  },

  // Listar mensagens de uma sessão
  findBySession: async (params: {
    chatSessionId: string;
    limite?: number;
    offset?: number;
    ordem?: "asc" | "desc";
  }) => {
    const { chatSessionId, limite = 50, offset = 0, ordem = "asc" } = params;

    return db.query.chatMessage.findMany({
      where: eq(chatMessage.chatSessionId, chatSessionId),
      limit: limite,
      offset,
      orderBy:
        ordem === "desc"
          ? [desc(chatMessage.createdAt)]
          : [asc(chatMessage.createdAt)],
    });
  },

  // Contar mensagens por sessão
  countBySession: async (chatSessionId: string) => {
    const [result] = await db
      .select({ count: count() })
      .from(chatMessage)
      .where(eq(chatMessage.chatSessionId, chatSessionId));

    return result?.count ?? 0;
  },

  // Atualizar mensagem
  update: async (
    id: string,
    data: Partial<typeof chatMessage.$inferInsert>,
  ) => {
    await db.update(chatMessage).set(data).where(eq(chatMessage.id, id));

    return ChatMessageRepository.findById(id);
  },

  // Excluir mensagem
  delete: async (id: string) => {
    await db.delete(chatMessage).where(eq(chatMessage.id, id));
  },

  // Excluir todas as mensagens de uma sessão
  deleteBySession: async (chatSessionId: string) => {
    await db
      .delete(chatMessage)
      .where(eq(chatMessage.chatSessionId, chatSessionId));
  },
};
