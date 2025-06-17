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
      // Principais providers comerciais
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

      // Providers emergentes
      {
        name: "Mistral AI",
        baseUrl: "https://api.mistral.ai/v1",
      },
      {
        name: "Cohere",
        baseUrl: "https://api.cohere.ai/v1",
      },
      {
        name: "Perplexity",
        baseUrl: "https://api.perplexity.ai",
      },
      {
        name: "xAI",
        baseUrl: "https://api.x.ai/v1",
      },
      {
        name: "DeepSeek",
        baseUrl: "https://api.deepseek.com/v1",
      },

      // Providers open source / self-hosted
      {
        name: "Hugging Face",
        baseUrl: "https://api-inference.huggingface.co/v1",
      },
      {
        name: "Together AI",
        baseUrl: "https://api.together.xyz/v1",
      },
      {
        name: "Anyscale",
        baseUrl: "https://api.endpoints.anyscale.com/v1",
      },
      {
        name: "Fireworks AI",
        baseUrl: "https://api.fireworks.ai/inference/v1",
      },

      // Providers locais/custom
      {
        name: "Ollama",
        baseUrl: "http://localhost:11434/api",
      },
      {
        name: "LM Studio",
        baseUrl: "http://localhost:1234/v1",
      },
      {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
      },

      // Azure e outras clouds
      {
        name: "Azure OpenAI",
        baseUrl: "https://{resource}.openai.azure.com/openai/deployments",
      },
      {
        name: "AWS Bedrock",
        baseUrl: "https://bedrock-runtime.{region}.amazonaws.com",
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
    console.log("Creating AI Models...");

    // Buscar providers criados para associar aos modelos
    const findProvider = (name: string) =>
      createdProviders.find((p: any) => p.name === name);

    const openaiProvider = findProvider("OpenAI");
    const anthropicProvider = findProvider("Anthropic");
    const googleProvider = findProvider("Google");
    const mistralProvider = findProvider("Mistral AI");
    const cohereProvider = findProvider("Cohere");
    const perplexityProvider = findProvider("Perplexity");
    const xaiProvider = findProvider("xAI");
    const deepseekProvider = findProvider("DeepSeek");
    const huggingfaceProvider = findProvider("Hugging Face");
    const togetherProvider = findProvider("Together AI");
    const groqProvider = findProvider("Groq");
    const ollamaProvider = findProvider("Ollama");

    const models = [
      // ========== OpenAI Models ==========
      {
        name: "gpt-4o",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "GPT-4o mais recente da OpenAI com melhor performance",
          version: "gpt-4o",
          pricing: { input: 0.005, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "gpt-4o-mini",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "Versão mini do GPT-4o mais econômica",
          version: "gpt-4o-mini",
          pricing: { input: 0.00015, output: 0.0006 },
        },
        enabled: false,
      },
      {
        name: "gpt-4o-audio-preview",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "GPT-4o com capacidades de áudio (preview)",
          version: "gpt-4o-audio-preview",
          pricing: { input: 0.005, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "gpt-4-turbo",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "GPT-4 Turbo com dados até abril 2024",
          version: "gpt-4-turbo",
          pricing: { input: 0.01, output: 0.03 },
        },
        enabled: false,
      },
      {
        name: "gpt-4",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "GPT-4 clássico para tarefas complexas",
          version: "gpt-4",
          pricing: { input: 0.03, output: 0.06 },
        },
        enabled: false,
      },
      {
        name: "gpt-3.5-turbo",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "GPT-3.5 Turbo rápido e econômico",
          version: "gpt-3.5-turbo",
          pricing: { input: 0.001, output: 0.002 },
        },
        enabled: false,
      },
      {
        name: "gpt-4.1",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.7,
          description: "GPT-4.1 flagship com contexto de 1M tokens",
          version: "gpt-4.1",
          pricing: { input: 0.002, output: 0.008 },
        },
        enabled: false,
      },
      {
        name: "gpt-4.1-mini",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.7,
          description: "GPT-4.1 Mini com contexto de 1M tokens",
          version: "gpt-4.1-mini",
          pricing: { input: 0.0003, output: 0.0012 },
        },
        enabled: false,
      },
      {
        name: "gpt-4.1-nano",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.7,
          description: "GPT-4.1 Nano ultra eficiente com contexto de 1M tokens",
          version: "gpt-4.1-nano",
          pricing: { input: 0.0001, output: 0.0004 },
        },
        enabled: false,
      },
      {
        name: "o1",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.8,
          description: "O1 modelo de raciocínio avançado da OpenAI",
          version: "o1",
          pricing: { input: 0.015, output: 0.06 },
        },
        enabled: false,
      },
      {
        name: "o1-mini",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.8,
          description: "O1 Mini modelo de raciocínio mais eficiente",
          version: "o1-mini",
          pricing: { input: 0.003, output: 0.012 },
        },
        enabled: false,
      },
      {
        name: "o1-preview",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.8,
          description: "O1 Preview versão prévia do modelo de raciocínio",
          version: "o1-preview",
          pricing: { input: 0.015, output: 0.06 },
        },
        enabled: false,
      },
      {
        name: "o3",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 32768,
          temperature: 0.8,
          description: "O3 modelo de raciocínio mais avançado",
          version: "o3",
          pricing: { input: 0.02, output: 0.08 },
        },
        enabled: false,
      },
      {
        name: "o3-mini",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 200000,
          temperature: 0.8,
          description: "O3 Mini modelo de raciocínio eficiente",
          version: "o3-mini",
          pricing: { input: 0.004, output: 0.016 },
        },
        enabled: false,
      },
      {
        name: "o4-mini",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 200000,
          temperature: 0.8,
          description: "O4 Mini próxima geração de raciocínio",
          version: "o4-mini",
          pricing: { input: 0.005, output: 0.02 },
        },
        enabled: false,
      },
      {
        name: "chatgpt-4o-latest",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "ChatGPT-4o mais recente otimizado para conversação",
          version: "chatgpt-4o-latest",
          pricing: { input: 0.005, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "o3-pro",
        providerId: openaiProvider?.id,
        config: {
          maxTokens: 65536,
          temperature: 0.7,
          description: "OpenAI o3 Pro - modelo de raciocínio mais avançado",
          version: "o3-pro",
          pricing: { input: 0.02, output: 0.08 },
        },
        enabled: false,
      },

      // ========== Anthropic Models ==========
      // Claude 4 Generation (Latest - May 2025)
      {
        name: "claude-4-opus",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 32000,
          temperature: 0.5,
          description:
            "Claude Opus 4 - Modelo mais capaz e inteligente da Anthropic",
          version: "claude-opus-4-20250514",
          pricing: { input: 0.015, output: 0.075 },
        },
        enabled: false,
      },
      {
        name: "claude-4-sonnet",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 64000,
          temperature: 0.5,
          description:
            "Claude Sonnet 4 - Alto desempenho com raciocínio excepcional",
          version: "claude-sonnet-4-20250514",
          pricing: { input: 0.003, output: 0.015 },
        },
        enabled: false,
      },

      // Claude 3.7 Generation (February 2025)
      {
        name: "claude-3.7-sonnet",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 64000,
          temperature: 0.5,
          description:
            "Claude Sonnet 3.7 - Modelo mais inteligente com pensamento estendido",
          version: "claude-3-7-sonnet-20250219",
          pricing: { input: 0.003, output: 0.015 },
        },
        enabled: false,
      },

      // Claude 3.5 Generation (Stable)
      {
        name: "claude-3.5-sonnet",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.5,
          description: "Claude 3.5 Sonnet com melhor raciocínio",
          version: "claude-3-5-sonnet-20241022",
          pricing: { input: 0.003, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "claude-3.5-haiku",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.5,
          description: "Claude 3.5 Haiku mais rápido e barato",
          version: "claude-3-5-haiku-20241022",
          pricing: { input: 0.0008, output: 0.004 },
        },
        enabled: false,
      },

      // Claude 3 Generation (Legacy)
      {
        name: "claude-3-opus",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.5,
          description: "Claude 3 Opus para tarefas complexas",
          version: "claude-3-opus-20240229",
          pricing: { input: 0.015, output: 0.075 },
        },
        enabled: false,
      },
      {
        name: "claude-3-sonnet",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.5,
          description: "Claude 3 Sonnet balanceado",
          version: "claude-3-sonnet-20240229",
          pricing: { input: 0.003, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "claude-3-haiku",
        providerId: anthropicProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.5,
          description: "Claude 3 Haiku rápido e compacto",
          version: "claude-3-haiku-20240307",
          pricing: { input: 0.00025, output: 0.00125 },
        },
        enabled: false,
      },

      // ========== Google Models ==========
      // Gemini 2.5 Generation (Latest)
      {
        name: "gemini-2.5-pro",
        providerId: googleProvider?.id,
        config: {
          maxTokens: 65536,
          temperature: 0.8,
          description: "Gemini 2.5 Pro - modelo mais avançado com raciocínio",
          version: "gemini-2.5-pro",
          pricing: { input: 0.003, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "gemini-2.5-flash",
        providerId: googleProvider?.id,
        config: {
          maxTokens: 65536,
          temperature: 0.8,
          description:
            "Gemini 2.5 Flash - melhor custo-benefício com raciocínio",
          version: "gemini-2.5-flash",
          pricing: { input: 0.00075, output: 0.003 },
        },
        enabled: false,
      },
      {
        name: "gemini-2.5-flash-preview-05-20",
        providerId: googleProvider?.id,
        config: {
          maxTokens: 65536,
          temperature: 0.8,
          description: "Gemini 2.5 Flash Preview - versão experimental",
          version: "gemini-2.5-flash-preview-05-20",
          pricing: { input: 0.00075, output: 0.003 },
        },
        enabled: false,
      },
      // Gemini 1.5 Generation (Stable)
      {
        name: "gemini-1.5-pro",
        providerId: googleProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.8,
          description: "Gemini 1.5 Pro com contexto de 2M tokens",
          version: "gemini-1.5-pro",
          pricing: { input: 0.00125, output: 0.005 },
        },
        enabled: false,
      },
      {
        name: "gemini-1.5-flash",
        providerId: googleProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.8,
          description: "Gemini 1.5 Flash mais rápido",
          version: "gemini-1.5-flash",
          pricing: { input: 0.000075, output: 0.0003 },
        },
        enabled: false,
      },
      {
        name: "gemini-pro",
        providerId: googleProvider?.id,
        config: {
          maxTokens: 2048,
          temperature: 0.8,
          description: "Gemini Pro clássico",
          version: "gemini-pro",
          pricing: { input: 0.0005, output: 0.0015 },
        },
        enabled: false,
      },

      // ========== Mistral AI Models ==========
      {
        name: "mistral-large",
        providerId: mistralProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "Mistral Large modelo flagship",
          version: "mistral-large-latest",
          pricing: { input: 0.004, output: 0.012 },
        },
        enabled: false,
      },
      {
        name: "mistral-7b",
        providerId: mistralProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "Mistral 7B open source",
          version: "open-mistral-7b",
          pricing: { input: 0.00025, output: 0.00025 },
        },
        enabled: false,
      },
      {
        name: "mixtral-8x7b",
        providerId: mistralProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "Mixtral 8x7B mixture of experts",
          version: "open-mixtral-8x7b",
          pricing: { input: 0.0007, output: 0.0007 },
        },
        enabled: false,
      },

      // ========== Cohere Models ==========
      {
        name: "command-r-plus",
        providerId: cohereProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.6,
          description: "Command R+ da Cohere para RAG",
          version: "command-r-plus",
          pricing: { input: 0.003, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "command-r",
        providerId: cohereProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.6,
          description: "Command R da Cohere",
          version: "command-r",
          pricing: { input: 0.0005, output: 0.0015 },
        },
        enabled: false,
      },

      // ========== Perplexity Models ==========
      {
        name: "sonar-pro",
        providerId: perplexityProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "Perplexity Sonar Pro com busca web",
          version: "llama-3.1-sonar-large-128k-online",
          pricing: { input: 0.001, output: 0.001 },
        },
        enabled: false,
      },

      // ========== xAI Models ==========
      {
        name: "grok-beta",
        providerId: xaiProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "Grok da xAI com acesso ao X/Twitter",
          version: "grok-beta",
          pricing: { input: 0.005, output: 0.015 },
        },
        enabled: false,
      },
      {
        name: "grok-3-beta",
        providerId: xaiProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "Grok 3 Beta - modelo mais avançado da xAI",
          version: "grok-3-beta",
          pricing: { input: 0.01, output: 0.03 },
        },
        enabled: false,
      },
      {
        name: "grok-3-mini",
        providerId: xaiProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "Grok 3 Mini - versão rápida e eficiente",
          version: "grok-3-mini-beta",
          pricing: { input: 0.002, output: 0.006 },
        },
        enabled: false,
      },

      // ========== DeepSeek Models ==========
      {
        name: "deepseek-r1-0528",
        providerId: deepseekProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "DeepSeek R1 - modelo de raciocínio avançado",
          version: "deepseek-r1-0528",
          pricing: { input: 0.0014, output: 0.0028 },
        },
        enabled: false,
      },
      {
        name: "deepseek-v3.1",
        providerId: deepseekProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "DeepSeek V3.1 - modelo geral avançado",
          version: "deepseek-v3.1",
          pricing: { input: 0.0014, output: 0.0028 },
        },
        enabled: false,
      },

      // ========== Groq Models (rápidos) ==========
      {
        name: "llama-3-70b-groq",
        providerId: groqProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.6,
          description: "Llama 3 70B otimizado no Groq (ultrarrápido)",
          version: "llama3-70b-8192",
          pricing: { input: 0.00059, output: 0.00079 },
        },
        enabled: false,
      },
      {
        name: "mixtral-8x7b-groq",
        providerId: groqProvider?.id,
        config: {
          maxTokens: 4096,
          temperature: 0.7,
          description: "Mixtral 8x7B no Groq (ultrarrápido)",
          version: "mixtral-8x7b-32768",
          pricing: { input: 0.00024, output: 0.00024 },
        },
        enabled: false,
      },

      // ========== Local/Ollama Models ==========
      {
        name: "llama-3.1-8b",
        providerId: ollamaProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.6,
          description: "Llama 3.1 8B rodando localmente",
          version: "llama3.1:8b",
          pricing: { input: 0, output: 0 },
        },
        enabled: false,
      },
      {
        name: "qwen-2.5-7b",
        providerId: ollamaProvider?.id,
        config: {
          maxTokens: 8192,
          temperature: 0.7,
          description: "Qwen 2.5 7B da Alibaba localmente",
          version: "qwen2.5:7b",
          pricing: { input: 0, output: 0 },
        },
        enabled: false,
      },
    ];

    const createdModels: any[] = [];
    for (const modelData of models) {
      try {
        if (!modelData.providerId) {
          console.log(
            `⚠️  Provider não encontrado para modelo ${modelData.name}, pulando...`,
          );
          continue;
        }

        // Verificar se o modelo já existe
        const existingModels =
          await aiStudioRepository.AiModelRepository.findMany({
            providerId: modelData.providerId,
          });

        const existingModel = existingModels.find(
          (m: any) => m.name === modelData.name,
        );

        if (existingModel) {
          createdModels.push(existingModel);
          console.log(`✓ Modelo "${modelData.name}" já existe`);
        } else {
          // Garantir que providerId não é undefined antes de criar
          const model = await aiStudioRepository.AiModelRepository.create({
            ...modelData,
            providerId: modelData.providerId, // TypeScript sabe que não é undefined aqui
          });
          createdModels.push(model);
          console.log(`✅ Modelo criado: ${model?.name || modelData.name}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar modelo ${modelData.name}:`, error);
      }
    }

    console.log("\n📊 Resumo do Seed:");
    console.log(`   • ${createdProviders.length} providers processados`);
    console.log(`   • ${createdModels.length} modelos processados`);

    // Contar por provider
    const providerStats = createdProviders.map((provider: any) => {
      const modelCount = models.filter(
        (modelData: any) => modelData.providerId === provider.id,
      ).length;
      return { name: provider.name, models: modelCount };
    });

    console.log("\n📈 Modelos por Provider:");
    providerStats.forEach((stat: any) => {
      if (stat.models > 0) {
        console.log(`   • ${stat.name}: ${stat.models} modelos`);
      }
    });

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
