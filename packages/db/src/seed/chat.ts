import { eq } from "drizzle-orm";

import { db } from "../client";
import { aiStudioRepository, chatRepository } from "../repositories";
import { teams, users } from "../schema";

export async function seedChatWithTeam(teamId: string, userId: string) {
  try {
    console.log(`🌱 Iniciando seed de Chat para team ${teamId}...`);

    // Verificar se o team existe
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      throw new Error(`Team com ID ${teamId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado`);
    }

    // Buscar modelos de IA disponíveis
    const availableModels = await aiStudioRepository.AiModelRepository.findMany(
      {
        enabled: true,
        limite: 5,
        offset: 0,
      },
    );

    if (availableModels.length === 0) {
      console.log(
        "⚠️  Nenhum modelo de IA encontrado. Execute primeiro seedAiStudio()",
      );
      return;
    }

    // Buscar agentes de IA do team
    const availableAgents =
      await aiStudioRepository.AiAgentRepository.findByTeam({
        teamId: teamId,
        limite: 10,
        offset: 0,
      });

    console.log(`📦 Recursos disponíveis:`);
    console.log(`   - ${availableModels.length} modelos de IA`);
    console.log(`   - ${availableAgents.length} agentes de IA`);

    // Selecionar modelo e agente padrão
    const defaultModel = availableModels[0]; // GPT-4 ou primeiro disponível
    const supportAgent =
      availableAgents.find((agent) => agent.name.includes("Suporte")) ||
      availableAgents[0];
    const documentAgent =
      availableAgents.find((agent) => agent.name.includes("Documentação")) ||
      availableAgents[1];
    const generalAgent =
      availableAgents.find((agent) => agent.name.includes("Geral")) ||
      availableAgents[2];

    // Criar pastas de chat exemplo
    console.log("Creating Chat Folders...");
    const folders = [
      {
        name: "🛠️ Suporte Técnico",
        teamId: teamId,
        createdById: userId,
        aiAgentId: supportAgent?.id,
        aiModelId: defaultModel?.id,
      },
      {
        name: "💻 Desenvolvimento",
        teamId: teamId,
        createdById: userId,
        aiModelId: defaultModel?.id,
        // Sem agente específico - usuário escolhe
      },
      {
        name: "📋 Documentação",
        teamId: teamId,
        createdById: userId,
        aiAgentId: documentAgent?.id,
        aiModelId: defaultModel?.id,
      },
      {
        name: "💬 Chat Geral",
        teamId: teamId,
        createdById: userId,
        aiAgentId: generalAgent?.id,
        aiModelId: defaultModel?.id,
      },
    ];

    const createdFolders = [];
    for (const folderData of folders) {
      try {
        // Verificar se pasta já existe
        const existingFolders =
          await chatRepository.ChatFolderRepository.findByTeam({
            teamId: teamId,
            busca: folderData.name,
            limite: 1,
            offset: 0,
          });

        if (existingFolders.length === 0) {
          const folder =
            await chatRepository.ChatFolderRepository.create(folderData);
          createdFolders.push(folder);
          console.log(`✅ Pasta criada: ${folderData.name}`);
        } else {
          console.log(`⚠️  Pasta ${folderData.name} já existe`);
          createdFolders.push(existingFolders[0]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar pasta ${folderData.name}: ${errorMessage}`,
        );
      }
    }

    // Criar sessões de chat exemplo
    console.log("Creating Chat Sessions...");
    const sessions = [
      {
        title: "Como configurar a API do sistema?",
        teamId: teamId,
        userId: userId,
        aiModelId: defaultModel?.id!,
        chatFolderId: createdFolders.find((f) => f?.name.includes("Suporte"))
          ?.id,
        aiAgentId: supportAgent?.id,
      },
      {
        title: "Implementação de novas features",
        teamId: teamId,
        userId: userId,
        aiModelId: defaultModel?.id!,
        chatFolderId: createdFolders.find((f) =>
          f?.name.includes("Desenvolvimento"),
        )?.id,
        // Sem agente - desenvolvimento livre
      },
      {
        title: "Análise da documentação do projeto",
        teamId: teamId,
        userId: userId,
        aiModelId: defaultModel?.id!,
        chatFolderId: createdFolders.find((f) =>
          f?.name.includes("Documentação"),
        )?.id,
        aiAgentId: documentAgent?.id,
      },
      {
        title: "Brainstorming de ideias",
        teamId: teamId,
        userId: userId,
        aiModelId: defaultModel?.id!,
        chatFolderId: createdFolders.find((f) => f?.name.includes("Geral"))?.id,
        aiAgentId: generalAgent?.id,
      },
      {
        title: "Teste de integração com IA",
        teamId: teamId,
        userId: userId,
        aiModelId: availableModels[1]?.id || defaultModel?.id!, // Segundo modelo se disponível
        // Sem pasta específica
      },
    ];

    const createdSessions = [];
    for (const sessionData of sessions) {
      try {
        // Verificar se sessão já existe
        const existingSessions =
          await chatRepository.ChatSessionRepository.findByTeam({
            teamId: teamId,
            busca: sessionData.title,
            limite: 1,
            offset: 0,
          });

        if (existingSessions.length === 0) {
          const session =
            await chatRepository.ChatSessionRepository.create(sessionData);
          createdSessions.push(session);
          console.log(`✅ Sessão criada: ${sessionData.title}`);
        } else {
          console.log(`⚠️  Sessão ${sessionData.title} já existe`);
          createdSessions.push(existingSessions[0]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar sessão ${sessionData.title}: ${errorMessage}`,
        );
      }
    }

    // Criar mensagens exemplo apenas para sessões que foram criadas com sucesso
    console.log("Creating Chat Messages...");
    let createdMessagesCount = 0;

    // Sessão 1: Suporte Técnico - API Configuration
    const supportSession = createdSessions.find((s) =>
      s?.title.includes("configurar"),
    );
    if (supportSession?.id) {
      const supportMessages = [
        {
          chatSessionId: supportSession.id,
          senderRole: "user" as const,
          content: `Olá! Sou ${user.name} da equipe ${team.name}. Preciso de ajuda para configurar a API do nosso sistema. Por onde devo começar?`,
          status: "ok" as const,
        },
        {
          chatSessionId: supportSession.id,
          senderRole: "ai" as const,
          content: `Olá ${user.name}! Fico feliz em ajudar com a configuração da API. Para começar, você precisa:

1. **Obter suas credenciais de acesso** no painel administrativo
2. **Configurar as variáveis de ambiente** no seu projeto
3. **Testar a conexão** com um endpoint simples

Você já tem uma conta criada no sistema? E qual linguagem de programação está usando?`,
          status: "ok" as const,
        },
        {
          chatSessionId: supportSession.id,
          senderRole: "user" as const,
          content:
            "Sim, já tenho uma conta. Estou usando Node.js. Onde encontro as credenciais?",
          status: "ok" as const,
        },
        {
          chatSessionId: supportSession.id,
          senderRole: "ai" as const,
          content: `Perfeito! Para Node.js, siga estes passos:

**1. Localizar Credenciais:**
- Acesse o painel em: \`/dashboard/api-keys\`
- Clique em "Gerar Nova Chave"
- Copie a chave (ela só será mostrada uma vez)

**2. Configurar no Node.js:**
\`\`\`javascript
// .env
API_KEY=sua_chave_aqui
API_URL=https://api.${team.name.toLowerCase() || "example"}.com

// config.js
const apiClient = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Authorization': \`Bearer \${process.env.API_KEY}\`,
    'Content-Type': 'application/json'
  }
});
\`\`\`

Precisa de ajuda com algum endpoint específico?`,
          status: "ok" as const,
        },
      ];

      for (const messageData of supportMessages) {
        try {
          await chatRepository.ChatMessageRepository.create(messageData);
          createdMessagesCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.log(`⚠️  Erro ao criar mensagem de suporte: ${errorMessage}`);
        }
      }
    }

    // Sessão 2: Desenvolvimento - Features
    const devSession = createdSessions.find((s) =>
      s?.title.includes("Implementação"),
    );
    if (devSession?.id) {
      const devMessages = [
        {
          chatSessionId: devSession.id,
          senderRole: "user" as const,
          content:
            "Estou trabalhando na implementação de um novo módulo de relatórios. Você pode me ajudar com as melhores práticas de arquitetura?",
          status: "ok" as const,
        },
        {
          chatSessionId: devSession.id,
          senderRole: "ai" as const,
          content: `Claro! Para um módulo de relatórios robusto, considere esta arquitetura:

**📊 Estrutura Recomendada:**
\`\`\`
/modules/reports/
  ├── controllers/     # Endpoints da API
  ├── services/        # Lógica de negócio
  ├── repositories/    # Acesso aos dados
  ├── types/           # Tipos TypeScript
  └── utils/           # Utilitários
\`\`\`

**🏗️ Padrões Importantes:**
- **Repository Pattern** para abstração de dados
- **Service Layer** para lógica complexa
- **DTO Pattern** para validação de entrada
- **Caching** para relatórios frequentes

Que tipo de relatórios você precisa implementar?`,
          status: "ok" as const,
        },
      ];

      for (const messageData of devMessages) {
        try {
          await chatRepository.ChatMessageRepository.create(messageData);
          createdMessagesCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.log(`⚠️  Erro ao criar mensagem de dev: ${errorMessage}`);
        }
      }
    }

    // Sessão 3: Documentação
    const docSession = createdSessions.find((s) =>
      s?.title.includes("documentação"),
    );
    if (docSession?.id) {
      try {
        await chatRepository.ChatMessageRepository.create({
          chatSessionId: docSession.id,
          senderRole: "user" as const,
          content:
            "Preciso analisar a documentação técnica do projeto. Onde posso encontrar a versão mais atualizada?",
          status: "ok" as const,
        });

        await chatRepository.ChatMessageRepository.create({
          chatSessionId: docSession.id,
          senderRole: "ai" as const,
          content: `📋 **Documentação Disponível:**

**Principais Locais:**
- 📚 **Wiki Interna**: /docs/wiki
- 🔧 **API Docs**: /docs/api
- 🏗️ **Arquitetura**: /docs/architecture
- 📝 **Changelog**: /docs/changelog

**📊 Status da Documentação:**
- ✅ API Reference: Atualizada
- ⚠️ User Guide: Revisão pendente
- ✅ Developer Guide: Atualizada
- 🔄 Architecture Docs: Em atualização

Qual seção específica você gostaria de analisar primeiro?`,
          status: "ok" as const,
        });

        createdMessagesCount += 2;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar mensagem de documentação: ${errorMessage}`,
        );
      }
    }

    // Sessão 4: Brainstorming
    const brainstormSession = createdSessions.find((s) =>
      s?.title.includes("Brainstorming"),
    );
    if (brainstormSession?.id) {
      try {
        await chatRepository.ChatMessageRepository.create({
          chatSessionId: brainstormSession.id,
          senderRole: "user" as const,
          content:
            "Vamos fazer um brainstorming sobre melhorias para o sistema. Que funcionalidades você sugere?",
          status: "ok" as const,
        });

        await chatRepository.ChatMessageRepository.create({
          chatSessionId: brainstormSession.id,
          senderRole: "ai" as const,
          content: `🧠 **Ideias para ${team.name}:**

**🚀 Funcionalidades Principais:**
- 📊 Dashboard analítico em tempo real
- 🔔 Sistema de notificações inteligentes
- 🤖 Automação de tarefas repetitivas
- 📱 App mobile nativo
- 🔗 Integrações com ferramentas populares

**💡 Inovações:**
- 🎯 IA para predição de tendências
- 🔍 Busca semântica avançada
- 🎨 Interface adaptativa por usuário
- 📈 Relatórios automatizados
- 🛡️ Segurança com 2FA biométrico

Qual área você gostaria de explorar mais?`,
          status: "ok" as const,
        });

        createdMessagesCount += 2;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar mensagem de brainstorm: ${errorMessage}`,
        );
      }
    }

    // Sessão 5: Teste Simples
    const testSession = createdSessions.find((s) => s?.title.includes("Teste"));
    if (testSession?.id) {
      try {
        await chatRepository.ChatMessageRepository.create({
          chatSessionId: testSession.id,
          senderRole: "user" as const,
          content:
            "Oi! Este é um teste do sistema de chat com IA. Como você está funcionando?",
          status: "ok" as const,
        });

        createdMessagesCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(`⚠️  Erro ao criar mensagem de teste: ${errorMessage}`);
      }
    }

    console.log(`✅ Seeds de Chat concluídos!`);
    console.log(`   - ${createdFolders.length} pastas disponíveis`);
    console.log(`   - ${createdSessions.length} sessões disponíveis`);
    console.log(`   - ${createdMessagesCount} mensagens criadas`);
    console.log(`   - Usando modelo: ${defaultModel?.name || "Nenhum"}`);
    console.log(`   - Agentes disponíveis: ${availableAgents.length}`);

    return {
      folders: createdFolders,
      sessions: createdSessions,
      messagesCount: createdMessagesCount,
      modelsUsed: availableModels.length,
      agentsUsed: availableAgents.length,
    };
  } catch (error) {
    console.error("❌ Erro durante o seed de Chat:", error);
    throw error;
  }
}

export async function seedChatDemo() {
  console.log("🌱 Para demonstração do Chat, execute:");
  console.log("   await seedChatWithTeam(teamId, userId)");
  console.log("");
  console.log("📋 Pré-requisitos:");
  console.log("   1. seedAiStudio() deve ter sido executado");
  console.log("   2. seedAiStudioWithTeam(teamId) deve ter sido executado");
  console.log("   3. teamId e userId devem ser IDs válidos no sistema");
  console.log("");
  console.log("💡 Exemplo de uso:");
  console.log(
    '   const result = await seedChatWithTeam("team-123", "user-456")',
  );
}
