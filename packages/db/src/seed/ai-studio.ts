import { eq } from "drizzle-orm";

import { db } from "../client";
import { aiStudioRepository } from "../repositories";
import { teams, users } from "../schema";

export async function seedAiStudio() {
  try {
    console.log("🌱 Iniciando seed de AI Studio...");

    // =============================
    // 1. Criar providers de IA
    // =============================
    console.log("Creating AI Providers...");

    const providers = [
      {
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
      },
      {
        name: "Anthropic",
        baseUrl: "https://api.anthropic.com/v1",
      },
      {
        name: "Google",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
      },
      {
        name: "Perplexity",
        baseUrl: "https://api.perplexity.ai",
      },
      {
        name: "DeepSeek",
        baseUrl: "https://api.deepseek.com/v1",
      },
      {
        name: "Ollama",
        baseUrl: "http://localhost:11434/api",
      },
      {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
      },
    ];

    const createdProviders: any[] = [];
    for (const providerData of providers) {
      try {
        // Verificar se o provider já existe
        const existingProvider =
          await aiStudioRepository.AiProviderRepository.findByName(
            providerData.name,
          );

        if (existingProvider) {
          createdProviders.push(existingProvider);
          console.log(`✓ Provider "${providerData.name}" já existe`);
        } else {
          const provider =
            await aiStudioRepository.AiProviderRepository.create(providerData);
          if (provider) {
            createdProviders.push(provider);
            console.log(`✅ Provider criado: ${provider.name}`);
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao criar provider ${providerData.name}:`, error);
      }
    }

    // =============================
    // 2. Criar modelos de IA
    // =============================
    // O seed de modelos de IA foi removido.
    // A partir de agora, os modelos serão populados exclusivamente
    // através do processo de Model Sync na interface administrativa.
    console.log("Skipping AI Models seed...");

    console.log("\n📊 Resumo do Seed:");
    console.log(`   • ${createdProviders.length} providers processados`);

    console.log("\n✅ Seed de AI Studio concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o seed de AI Studio:", error);
    throw error;
  }
}

export async function seedAiStudioWithTeam(teamId: string, userId?: string) {
  try {
    console.log(`🌱 Iniciando seed de AI Studio para team ${teamId}...`);

    // Buscar providers existentes
    const providersResult =
      await aiStudioRepository.AiProviderRepository.findMany({
        limite: 100,
        offset: 0,
      });

    if (providersResult.length === 0) {
      console.log(
        "⚠️  Nenhum provider encontrado. Execute o seed geral primeiro.",
      );
      return;
    }

    console.log(`📋 Encontrados ${providersResult.length} providers`);

    // Usar o primeiro usuário da team se não especificado
    let createdById = userId;
    if (!createdById) {
      const teamUsers = await db
        .select()
        .from(users)
        .innerJoin(teams, eq(teams.id, teamId))
        .limit(1);

      if (teamUsers.length > 0) {
        createdById = teamUsers[0]!.user.id;
      } else {
        console.log("⚠️  Nenhum usuário encontrado para a team");
        return;
      }
    }

    // =============================
    // 1. Criar tokens de exemplo
    // =============================
    console.log("Creating AI Provider Tokens...");

    const tokenExamples = [
      {
        providerName: "OpenAI",
        token: "sk-example-openai-token-replace-with-real",
      },
      {
        providerName: "Anthropic",
        token: "sk-ant-example-anthropic-token-replace-with-real",
      },
      {
        providerName: "Google",
        token: "AIzaSy-example-google-token-replace-with-real",
      },
    ];

    let tokensCreated = 0;
    for (const tokenData of tokenExamples) {
      const provider = providersResult.find(
        (p: any) => p.name === tokenData.providerName,
      );
      if (provider) {
        try {
          // Verificar se o token já existe
          const existingToken =
            await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
              teamId,
              provider.id,
            );

          if (!existingToken) {
            await aiStudioRepository.AiTeamProviderTokenRepository.create({
              teamId,
              providerId: provider.id,
              token: tokenData.token,
            });
            tokensCreated++;
            console.log(`✅ Token criado para provider: ${provider.name}`);
          } else {
            console.log(`⚠️  Token já existe para provider: ${provider.name}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.log(
            `⚠️  Erro ao criar token para ${provider.name}: ${errorMessage}`,
          );
        }
      }
    }

    // =============================
    // 3. Criar bibliotecas de IA exemplo
    // =============================
    console.log("Creating AI Libraries...");

    const libraries = [
      {
        name: "Biblioteca Técnica",
        files: {
          documents: [
            {
              name: "guia-desenvolvimento.md",
              type: "markdown",
              url: "https://example.com/docs/dev-guide.md",
              description: "Guia de desenvolvimento da equipe",
            },
            {
              name: "api-reference.json",
              type: "json",
              url: "https://example.com/docs/api.json",
              description: "Referência da API",
            },
          ],
        },
      },
      {
        name: "Base de Conhecimento",
        files: {
          documents: [
            {
              name: "faq.md",
              type: "markdown",
              url: "https://example.com/faq.md",
              description: "Perguntas frequentes",
            },
          ],
        },
      },
    ];

    let librariesCreated = 0;
    for (const libraryData of libraries) {
      try {
        // Verificar se já existe biblioteca com este nome
        const existingLibraries =
          await aiStudioRepository.AiLibraryRepository.findByTeam({
            teamId,
            busca: libraryData.name,
            limite: 1,
            offset: 0,
          });

        if (existingLibraries.length === 0) {
          await aiStudioRepository.AiLibraryRepository.create({
            ...libraryData,
            teamId: teamId,
          });
          librariesCreated++;
          console.log(`✅ Biblioteca criada: ${libraryData.name}`);
        } else {
          console.log(`⚠️  Biblioteca já existe: ${libraryData.name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar biblioteca ${libraryData.name}: ${errorMessage}`,
        );
      }
    }

    // =============================
    // 4. Criar agentes de IA exemplo
    // =============================
    console.log("Creating AI Agents...");

    // Buscar uma biblioteca criada para associar
    const teamLibraries =
      await aiStudioRepository.AiLibraryRepository.findByTeam({
        teamId,
        limite: 1,
        offset: 0,
      });

    const agents = [
      {
        name: "Assistente de Desenvolvimento",
        instructions:
          "Você é um assistente especializado em desenvolvimento de software. Ajude com código, debugging, arquitetura e melhores práticas.",
        libraryId: teamLibraries[0]?.id,
      },
      {
        name: "Assistente de Documentação",
        instructions:
          "Você é especialista em criar e revisar documentação técnica. Ajude a escrever docs claras e bem estruturadas.",
        libraryId: teamLibraries[0]?.id,
      },
      {
        name: "Assistente Geral",
        instructions:
          "Você é um assistente geral que pode ajudar com diversas tarefas do dia a dia da equipe.",
        libraryId: undefined, // Sem biblioteca
      },
    ];

    let agentsCreated = 0;
    for (const agentData of agents) {
      try {
        // Verificar se já existe agente com este nome
        const existingAgents =
          await aiStudioRepository.AiAgentRepository.findByTeam({
            teamId,
            busca: agentData.name,
            limite: 1,
            offset: 0,
          });

        if (existingAgents.length === 0) {
          await aiStudioRepository.AiAgentRepository.create({
            ...agentData,
            teamId: teamId,
            createdById: createdById,
          });
          agentsCreated++;
          console.log(`✅ Agente criado: ${agentData.name}`);
        } else {
          console.log(`⚠️  Agente já existe: ${agentData.name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.log(
          `⚠️  Erro ao criar agente ${agentData.name}: ${errorMessage}`,
        );
      }
    }

    console.log(`📊 Resumo para team ${teamId}:`);
    console.log(`   ✓ ${tokensCreated} tokens criados`);
    console.log(`   ✓ ${librariesCreated} bibliotecas criadas`);
    console.log(`   ✓ ${agentsCreated} agentes criados`);

    console.log("✅ Seed de AI Studio para team concluído com sucesso!");
  } catch (error) {
    console.error(`❌ Erro durante o seed de AI Studio para team:`, error);
    throw error;
  }
}

// Executar o seed quando o arquivo for rodado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAiStudio()
    .then(() => {
      console.log("✅ Seed concluído com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro durante o seed:", error);
      process.exit(1);
    });
}
