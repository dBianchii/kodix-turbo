import { eq } from "drizzle-orm";

import { db } from "../client";
import { aiStudioRepository } from "../repositories";
import { teams, users } from "../schema";

export async function seedAiStudio() {
  try {
    console.log("🌱 Iniciando seed de AI Studio...");

    // Criar modelos de IA exemplo
    console.log("Creating AI Models...");
    const models = [
      {
        name: "GPT-4",
        provider: "OpenAI",
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "Modelo GPT-4 da OpenAI para tarefas gerais",
          apiUrl: "https://api.openai.com/v1/chat/completions",
          version: "gpt-4",
        },
        enabled: true,
      },
      {
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        config: {
          maxTokens: 8192,
          temperature: 0.5,
          description: "Modelo Claude 3.5 Sonnet da Anthropic",
          apiUrl: "https://api.anthropic.com/v1/messages",
          version: "claude-3-5-sonnet-20241022",
        },
        enabled: true,
      },
      {
        name: "Gemini Pro",
        provider: "Google",
        config: {
          maxTokens: 2048,
          temperature: 0.8,
          description: "Modelo Gemini Pro do Google",
          apiUrl:
            "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
          version: "gemini-pro",
        },
        enabled: true,
      },
      {
        name: "Llama 2",
        provider: "Meta",
        config: {
          maxTokens: 4096,
          temperature: 0.6,
          description: "Modelo Llama 2 da Meta (open source)",
          apiUrl: "https://api.together.xyz/inference",
          version: "meta-llama/Llama-2-70b-chat-hf",
        },
        enabled: false, // Desabilitado por padrão
      },
    ];

    const createdModels = [];
    for (const modelData of models) {
      try {
        const existingModel =
          await aiStudioRepository.AiModelRepository.findMany({
            provider: modelData.provider,
            limite: 1,
            offset: 0,
          });

        if (existingModel.length === 0) {
          const model =
            await aiStudioRepository.AiModelRepository.create(modelData);
          createdModels.push(model);
          console.log(
            `✅ Modelo criado: ${modelData.name} (${modelData.provider})`,
          );
        } else {
          console.log(`⚠️  Modelo ${modelData.name} já existe`);
          createdModels.push(existingModel[0]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar modelo ${modelData.name}: ${errorMessage}`,
        );
      }
    }

    console.log(
      `✅ Seeds de AI Studio concluídos! ${createdModels.length} modelos disponíveis.`,
    );
    return { models: createdModels };
  } catch (error) {
    console.error("❌ Erro durante o seed de AI Studio:", error);
    throw error;
  }
}

export async function seedAiStudioWithTeam(teamId: string, userId?: string) {
  try {
    console.log(`🌱 Iniciando seed de AI Studio para team ${teamId}...`);

    // Verificar se o team existe
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      throw new Error(`Team com ID ${teamId} não encontrado`);
    }

    // Buscar um usuário do team se não fornecido
    let createdById = userId;
    if (!createdById) {
      const teamOwner = await db.query.users.findFirst({
        where: eq(users.id, team.ownerId),
      });

      if (!teamOwner) {
        throw new Error(`Owner do team ${teamId} não encontrado`);
      }

      createdById = teamOwner.id;
    }

    // Buscar modelos existentes
    const models = await aiStudioRepository.AiModelRepository.findMany({
      enabled: true,
      limite: 10,
      offset: 0,
    });

    if (models.length === 0) {
      console.log(
        "⚠️  Nenhum modelo encontrado. Execute primeiro seedAiStudio()",
      );
      return;
    }

    console.log(`📦 ${models.length} modelos disponíveis para uso`);

    // Criar tokens para os modelos (exemplo)
    console.log("Creating AI Model Tokens...");
    const tokenExamples = [
      { modelName: "GPT-4", token: "sk-example-gpt4-token-replace-with-real" },
      {
        modelName: "Claude 3.5 Sonnet",
        token: "sk-ant-example-claude-token-replace-with-real",
      },
      {
        modelName: "Gemini Pro",
        token: "AIzaSy-example-gemini-token-replace-with-real",
      },
    ];

    let tokensCreated = 0;
    for (const tokenData of tokenExamples) {
      const model = models.find((m) => m.name === tokenData.modelName);
      if (model) {
        try {
          // Verificar se já existe token para este modelo/team
          const existingToken =
            await aiStudioRepository.AiModelTokenRepository.findByTeamAndModel(
              teamId,
              model.id,
            );

          if (!existingToken) {
            await aiStudioRepository.AiModelTokenRepository.create({
              modelId: model.id,
              token: tokenData.token,
              teamId: teamId,
            });
            tokensCreated++;
            console.log(`✅ Token criado para modelo: ${model.name}`);
          } else {
            console.log(`⚠️  Token já existe para modelo: ${model.name}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.log(
            `⚠️  Erro ao criar token para ${model.name}: ${errorMessage}`,
          );
        }
      }
    }

    // Criar bibliotecas de IA exemplo
    console.log("Creating AI Libraries...");
    const libraries = [
      {
        name: "Documentação Técnica",
        teamId: teamId,
        files: {
          documents: [
            {
              name: "manual-api.pdf",
              type: "pdf",
              size: 1024000,
              uploadedAt: new Date(),
            },
            {
              name: "guia-usuario.docx",
              type: "docx",
              size: 512000,
              uploadedAt: new Date(),
            },
            {
              name: "changelog.md",
              type: "markdown",
              size: 128000,
              uploadedAt: new Date(),
            },
          ],
          totalSize: 1664000,
          lastUpdated: new Date(),
          documentsCount: 3,
        },
      },
      {
        name: "Base de Conhecimento",
        teamId: teamId,
        files: {
          documents: [
            {
              name: "faq.txt",
              type: "txt",
              size: 256000,
              uploadedAt: new Date(),
            },
            {
              name: "procedimentos.md",
              type: "markdown",
              size: 128000,
              uploadedAt: new Date(),
            },
            {
              name: "troubleshooting.json",
              type: "json",
              size: 64000,
              uploadedAt: new Date(),
            },
          ],
          totalSize: 448000,
          lastUpdated: new Date(),
          documentsCount: 3,
        },
      },
      {
        name: "Biblioteca de Treinamento",
        teamId: teamId,
        files: {
          documents: [
            {
              name: "exemplos-conversa.txt",
              type: "txt",
              size: 512000,
              uploadedAt: new Date(),
            },
            {
              name: "prompts-sistema.md",
              type: "markdown",
              size: 256000,
              uploadedAt: new Date(),
            },
          ],
          totalSize: 768000,
          lastUpdated: new Date(),
          documentsCount: 2,
        },
      },
    ];

    const createdLibraries = [];
    for (const libraryData of libraries) {
      try {
        // Verificar se biblioteca já existe
        const existingLibraries =
          await aiStudioRepository.AiLibraryRepository.findByTeam({
            teamId: teamId,
            busca: libraryData.name,
            limite: 1,
            offset: 0,
          });

        if (existingLibraries.length === 0) {
          const library =
            await aiStudioRepository.AiLibraryRepository.create(libraryData);
          createdLibraries.push(library);
          console.log(`✅ Biblioteca criada: ${libraryData.name}`);
        } else {
          console.log(`⚠️  Biblioteca ${libraryData.name} já existe`);
          createdLibraries.push(existingLibraries[0]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar biblioteca ${libraryData.name}: ${errorMessage}`,
        );
      }
    }

    // Criar agentes de IA exemplo
    console.log("Creating AI Agents...");
    const agents = [
      {
        name: "Assistente de Suporte Técnico",
        teamId: teamId,
        createdById: createdById,
        instructions: `Você é um assistente especializado em suporte técnico da empresa ${team.name}.

INSTRUÇÕES PRINCIPAIS:
- Seja sempre educado, claro e objetivo
- Use a base de conhecimento para fornecer respostas precisas
- Se não souber algo, admita e sugira onde o usuário pode encontrar a informação
- Mantenha um tom profissional mas amigável
- Sempre pergunte se o usuário precisa de mais alguma coisa

CONTEXTO DA EMPRESA:
- Nome: ${team.name}
- Descrição: ${team.description || "Empresa focada em soluções tecnológicas"}

BASE DE CONHECIMENTO:
Use as informações da documentação técnica e FAQ para responder dúvidas dos usuários.`,
        libraryId: createdLibraries.find(
          (lib) => lib.name === "Base de Conhecimento",
        )?.id,
      },
      {
        name: "Analista de Documentação",
        teamId: teamId,
        createdById: createdById,
        instructions: `Você é um especialista em análise de documentos técnicos para ${team.name}.

ESPECIALIDADES:
- Análise detalhada de documentos PDF, Word e Markdown
- Extração de informações importantes
- Criação de resumos executivos
- Identificação de pontos-chave e action items

COMO PROCEDER:
1. Leia o documento completo
2. Identifique os pontos principais
3. Extraia informações técnicas relevantes
4. Forneça um resumo estruturado
5. Sugira próximos passos quando aplicável

FORMATO DE RESPOSTA:
📋 **Resumo Executivo**
🔍 **Pontos Principais**
⚠️ **Pontos de Atenção**
✅ **Próximos Passos**`,
        libraryId: createdLibraries.find(
          (lib) => lib.name === "Documentação Técnica",
        )?.id,
      },
      {
        name: "Assistente Geral",
        teamId: teamId,
        createdById: createdById,
        instructions: `Você é um assistente geral versátil para a equipe da ${team.name}.

CARACTERÍSTICAS:
- Polivalente e adaptável a diferentes situações
- Tom profissional mas amigável
- Foco em produtividade e eficiência
- Conhecimento geral sobre negócios e tecnologia

ÁREAS DE ATUAÇÃO:
- Suporte geral a usuários
- Esclarecimento de dúvidas básicas
- Orientação sobre processos
- Apoio em tarefas administrativas
- Facilitação de comunicação entre equipes

ABORDAGEM:
- Ouça atentamente o que o usuário precisa
- Forneça respostas claras e diretas
- Ofereça alternativas quando possível
- Seja proativo em sugerir melhorias`,
        libraryId: createdLibraries.find(
          (lib) => lib.name === "Biblioteca de Treinamento",
        )?.id,
      },
    ];

    const createdAgents = [];
    for (const agentData of agents) {
      try {
        // Verificar se agente já existe
        const existingAgents =
          await aiStudioRepository.AiAgentRepository.findByTeam({
            teamId: teamId,
            busca: agentData.name,
            limite: 1,
            offset: 0,
          });

        if (existingAgents.length === 0) {
          const agent =
            await aiStudioRepository.AiAgentRepository.create(agentData);
          createdAgents.push(agent);
          console.log(`✅ Agente criado: ${agentData.name}`);
        } else {
          console.log(`⚠️  Agente ${agentData.name} já existe`);
          createdAgents.push(existingAgents[0]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar agente ${agentData.name}: ${errorMessage}`,
        );
      }
    }

    console.log(`✅ Seeds de AI Studio para team concluídos!`);
    console.log(`   - ${tokensCreated} tokens criados`);
    console.log(`   - ${createdLibraries.length} bibliotecas disponíveis`);
    console.log(`   - ${createdAgents.length} agentes disponíveis`);

    return {
      tokens: tokensCreated,
      libraries: createdLibraries,
      agents: createdAgents,
      availableModels: models,
    };
  } catch (error) {
    console.error("❌ Erro durante o seed de AI Studio com team:", error);
    throw error;
  }
}
