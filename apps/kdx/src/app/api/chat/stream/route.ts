import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../../../../../../packages/api/src/internal/services/ai-studio.service";
import { ChatService } from "../../../../../../../packages/api/src/internal/services/chat.service";

export async function POST(request: NextRequest) {
  try {
    console.log("🔵 [API] POST streaming recebido");

    const {
      chatSessionId,
      content,
      useAgent = true,
      skipUserMessage = false,
    } = await request.json();
    console.log("🟢 [API] Dados recebidos:", {
      chatSessionId,
      content,
      useAgent,
      skipUserMessage,
    });

    if (!chatSessionId || !content) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 },
      );
    }

    // Verificar se a sessão existe
    const session = await ChatService.findSessionById(chatSessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 },
      );
    }

    console.log("🔍 [DEBUG] Dados da sessão:");
    console.log(`   • ID: ${session.id}`);
    console.log(`   • Título: ${session.title}`);
    console.log(`   • aiModelId: ${session.aiModelId || "❌ NULL/UNDEFINED"}`);
    console.log(`   • aiAgentId: ${session.aiAgentId || "❌ NULL/UNDEFINED"}`);
    console.log(`   • teamId: ${session.teamId}`);

    // ✅ TEMPORÁRIO: Agente será removido do fluxo de streaming por enquanto
    // TODO: Implementar getAgentById no AiStudioService
    const agent = null;
    if (session.aiAgentId) {
      console.log(
        `⚠️ [DEBUG] Agente ${session.aiAgentId} será ignorado no streaming por enquanto`,
      );
    }

    // ✅ CORREÇÃO: Criar mensagem do usuário apenas se não for skipUserMessage
    let userMessage;
    let recentMessages: any[] | null = null;

    if (skipUserMessage) {
      console.log(
        "🔄 [API] Pulando criação de mensagem do usuário (skipUserMessage=true)",
      );
      // Buscar a mensagem mais recente do usuário com o mesmo conteúdo
      recentMessages = await ChatService.findMessagesBySession({
        chatSessionId: session.id,
        limite: 5,
        offset: 0,
        ordem: "desc",
      });

      userMessage = recentMessages.find(
        (msg: any) => msg.senderRole === "user" && msg.content === content,
      );

      if (!userMessage) {
        console.warn(
          "⚠️ [API] Mensagem do usuário não encontrada, criando nova",
        );
        userMessage = await ChatService.createMessage({
          chatSessionId: session.id,
          senderRole: "user",
          content,
          status: "ok",
        });
      } else {
        console.log("✅ [API] Mensagem do usuário encontrada:", userMessage.id);
      }
    } else {
      // Comportamento normal: criar nova mensagem do usuário
      userMessage = await ChatService.createMessage({
        chatSessionId: session.id,
        senderRole: "user",
        content,
        status: "ok",
      });
      console.log("✅ [API] Mensagem do usuário criada");
    }

    if (!useAgent) {
      return NextResponse.json({
        userMessage,
        sessionId: session.id,
      });
    }

    // ✅ CORREÇÃO: Buscar histórico de mensagens ou reutilizar se já carregadas
    let messages;
    if (skipUserMessage && recentMessages) {
      // Se já carregamos mensagens para buscar a do usuário, reutilizar e ordenar
      messages = recentMessages.reverse(); // Inverter para ordem cronológica
    } else {
      // Buscar histórico normalmente
      messages = await ChatService.findMessagesBySession({
        chatSessionId: session.id,
        limite: 20,
        offset: 0,
        ordem: "asc",
      });
    }

    // ✅ CORREÇÃO: Incluir mensagem do usuário apenas se não estiver já incluída
    const userMessageExists = messages.some(
      (msg: any) => msg.id === userMessage?.id,
    );
    const allMessages = userMessageExists
      ? messages
      : [...messages, userMessage];

    // Formatar mensagens para o formato da OpenAI
    const formattedMessages: { role: string; content: string }[] = [];

    // Detectar idioma do usuário de forma mais robusta
    const detectUserLocale = (request: NextRequest): "pt-BR" | "en" => {
      // 1. Verificar cookie NEXT_LOCALE (usado pelo next-intl)
      const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
      if (cookieLocale === "pt-BR" || cookieLocale === "en") {
        return cookieLocale;
      }

      // 2. Verificar pathname do request
      const pathname = request.nextUrl.pathname;
      if (pathname.startsWith("/pt-BR")) return "pt-BR";
      if (pathname.startsWith("/en")) return "en";

      // 3. Verificar Accept-Language header
      const acceptLanguage = request.headers.get("accept-language") || "";
      if (acceptLanguage.includes("pt")) return "pt-BR";
      if (acceptLanguage.includes("en")) return "en";

      // 4. Fallback para português (locale padrão)
      return "pt-BR";
    };

    // 🎯 NOVO: Verificar se há Team Instructions na sessão
    const hasTeamInstructions = allMessages.some(
      (msg) =>
        msg?.senderRole === "system" &&
        msg?.metadata?.type === "team_instructions",
    );

    // 🌍 LOCALIZAÇÃO: System prompt baseado no idioma do usuário
    const userLocale = detectUserLocale(request);
    const systemPrompt =
      userLocale === "pt-BR"
        ? "Você é um assistente útil e responde sempre em português brasileiro."
        : "You are a helpful assistant and always respond in English.";

    // TODO: Incluir instruções do agente quando getAgentById for implementado no AiStudioService

    // 🎯 NOVO: Só adicionar system prompt se não há Team Instructions
    if (!hasTeamInstructions) {
      const hasSystemPrompt = allMessages.some(
        (msg) => msg?.senderRole === "system",
      );
      if (!hasSystemPrompt) {
        formattedMessages.push({
          role: "system",
          content: systemPrompt,
        });
        console.log(`🌍 [API] System prompt adicionado em: ${userLocale}`);
      }
    } else {
      console.log(
        `🎯 [API] Team Instructions detectadas, pulando system prompt padrão`,
      );
    }

    // Buscar modelo e provider
    let model;

    console.log("🎯 [DEBUG] Verificando modelo da sessão...");
    if (session.aiModelId) {
      console.log(`🔍 [DEBUG] Buscando modelo com ID: ${session.aiModelId}`);
      try {
        model = await AiStudioService.getModelById({
          modelId: session.aiModelId,
          teamId: session.teamId,
          requestingApp: chatAppId,
        });
        if (model) {
          console.log(
            `✅ [DEBUG] Modelo encontrado: ${model.name} (Provider: ${model.provider.name})`,
          );
        }
      } catch (error) {
        console.log(
          `❌ [DEBUG] Modelo com ID ${session.aiModelId} não encontrado:`,
          error,
        );
      }
    } else {
      console.log("❌ [DEBUG] Sessão não possui aiModelId definido");
    }

    // Se não encontrou modelo ou sessão não tem modelo configurado, usar modelo padrão
    if (!model) {
      console.log(
        "⚠️ [API] Sessão sem modelo configurado, buscando modelo padrão...",
      );

      // ✅ CORREÇÃO: Buscar modelos disponíveis via Service Layer
      const availableModels = await AiStudioService.getAvailableModels({
        teamId: session.teamId,
        requestingApp: chatAppId,
      });

      console.log(
        `🔍 [DEBUG] Modelos disponíveis encontrados: ${availableModels.length}`,
      );

      if (availableModels.length === 0) {
        throw new Error(
          "Nenhum modelo de IA disponível. Configure um modelo no AI Studio.",
        );
      }

      model = availableModels[0]!;
      console.log(
        `⚠️ [DEBUG] Usando modelo padrão: ${model.name} (Provider: ${model.provider.name})`,
      );

      // Atualizar a sessão com o modelo padrão
      await ChatService.updateSession(session.id, {
        aiModelId: model.id,
      });

      console.log(
        `✅ [API] Sessão atualizada com modelo padrão: ${model.name}`,
      );
    } else {
      console.log(
        `🎯 [DEBUG] Usando modelo selecionado da sessão: ${model.name} (Provider: ${model.provider.name})`,
      );
    }

    // Verificar se temos um modelo válido após todas as tentativas
    if (!model) {
      throw new Error("Não foi possível obter um modelo válido");
    }

    if (!model.providerId) {
      throw new Error("Modelo não possui provider configurado");
    }

    // Verificar se o provider está carregado
    if (!model.provider) {
      throw new Error("Dados do provider não foram carregados corretamente");
    }

    // ✅ CORREÇÃO: Buscar token do provider via Service Layer
    const providerToken = await AiStudioService.getProviderToken({
      providerId: model.providerId,
      teamId: session.teamId,
      requestingApp: chatAppId,
    });

    if (!providerToken.token) {
      throw new Error(
        `Token não configurado para o provider ${model.provider.name || "provider"}. Configure um token no AI Studio.`,
      );
    }

    console.log("✅ [API] Configurações obtidas, iniciando streaming...");

    // Configurar API baseada no provider
    const baseUrl = model.provider.baseUrl || "https://api.openai.com/v1";
    const apiUrl = `${baseUrl}/chat/completions`;

    // Usar configurações do modelo
    const modelConfig = (model.config as any) || {};
    const modelName = modelConfig.version || model.name;

    // Validação inteligente de max_tokens baseada no modelo
    const getMaxTokensForModel = (
      modelName: string,
      configMaxTokens?: number,
    ) => {
      // Limites conhecidos para diferentes modelos
      const modelLimits: Record<string, number> = {
        // OpenAI models
        "gpt-4": 8192,
        "gpt-4-turbo": 4096,
        "gpt-4-turbo-preview": 4096,
        "gpt-4o": 4096,
        "gpt-4o-mini": 16384,
        "gpt-3.5-turbo": 4096,
        "gpt-3.5-turbo-16k": 16384,
        // Anthropic Claude models
        "claude-3-haiku": 4096,
        "claude-3-sonnet": 4096,
        "claude-3-opus": 4096,
        "claude-3-5-haiku": 8192,
        "claude-3-5-sonnet": 8192,
        // Generic patterns
        claude: 4096,
        haiku: 4096,
        sonnet: 4096,
      };

      // Encontrar limite baseado no nome do modelo (normalizado)
      const normalizedModelName = modelName
        .toLowerCase()
        .replace(/-\d{4}-\d{2}-\d{2}$/, "")
        .replace(/-\d{4}$/, "");

      // Tentar match exato primeiro
      let modelLimit = modelLimits[normalizedModelName];

      // Se não encontrou, tentar match parcial
      if (!modelLimit) {
        for (const [pattern, limit] of Object.entries(modelLimits)) {
          if (normalizedModelName.includes(pattern)) {
            modelLimit = limit;
            break;
          }
        }
      }

      console.log(
        `🎯 [TOKEN_LIMIT] Modelo: ${modelName} → Normalizado: ${normalizedModelName} → Limite: ${modelLimit || "não encontrado"}`,
      );

      // Se há configuração no modelo, usar o menor entre config e limite do modelo
      if (configMaxTokens && modelLimit) {
        const finalLimit = Math.min(configMaxTokens, modelLimit);
        console.log(
          `🎯 [TOKEN_LIMIT] Usando limite configurado: ${finalLimit} (config: ${configMaxTokens}, modelo: ${modelLimit})`,
        );
        return finalLimit;
      }

      // Se só há limite do modelo, usar ele
      if (modelLimit) {
        console.log(`🎯 [TOKEN_LIMIT] Usando limite do modelo: ${modelLimit}`);
        return modelLimit;
      }

      // Se só há config, usar ela (sem limite máximo arbitrário)
      if (configMaxTokens) {
        console.log(`🎯 [TOKEN_LIMIT] Usando configuração: ${configMaxTokens}`);
        return configMaxTokens;
      }

      // Fallback mais generoso para modelos desconhecidos
      const fallbackLimit = 4096;
      console.log(`🎯 [TOKEN_LIMIT] Usando fallback: ${fallbackLimit}`);
      return fallbackLimit;
    };

    for (const msg of allMessages) {
      if (msg?.content) {
        formattedMessages.push({
          role:
            msg.senderRole === "user"
              ? "user"
              : msg.senderRole === "system"
                ? "system"
                : "assistant",
          content: msg.content,
        });
      }
    }

    console.log(
      `🔍 [API] Total de mensagens formatadas: ${formattedMessages.length}`,
    );
    console.log(
      `🎯 [API] Mensagens system: ${formattedMessages.filter((m) => m.role === "system").length}`,
    );

    const maxTokens = getMaxTokensForModel(modelName, modelConfig.maxTokens);
    const temperature = modelConfig.temperature || 0.7;

    console.log(
      `🟢 [API] Usando modelo: ${modelName} (Provider: ${model.provider.name})`,
    );
    console.log(`🎯 [API] Max tokens ajustado: ${maxTokens}`);

    if (!modelName) {
      throw new Error("Nome do modelo não configurado corretamente");
    }

    console.log("🟢 [API] Preparando payload para OpenAI");
    console.log(
      `🎯 [API] Modelo: ${modelName}, Mensagens: ${formattedMessages.length}`,
    );

    // 🎯 GESTÃO INTELIGENTE DE TOKENS
    const estimateTokens = (text: string): number => {
      // Estimativa mais precisa: ~4 caracteres = 1 token para inglês/português
      // Adicionar overhead para formatação JSON e estrutura da mensagem
      return Math.ceil(text.length / 3.5) + 10; // +10 tokens para overhead da estrutura
    };

    // Separar mensagens por tipo para gestão inteligente
    const systemMessages = formattedMessages.filter((m) => m.role === "system");
    const conversationMessages = formattedMessages.filter(
      (m) => m.role !== "system",
    );

    // Calcular tokens das mensagens system (SEMPRE preservadas)
    const systemTokens = systemMessages.reduce(
      (total, msg) => total + estimateTokens(msg.content),
      0,
    );

    // Calcular limite disponível para conversa (70% do total, reservando 30% para resposta)
    const maxInputTokens = Math.floor(maxTokens * 0.7);
    const availableForConversation = maxInputTokens - systemTokens - 100; // -100 tokens de margem de segurança

    console.log(`🎯 [TOKEN_MANAGEMENT] Limite total do modelo: ${maxTokens}`);
    console.log(
      `🎯 [TOKEN_MANAGEMENT] Limite para input: ${maxInputTokens} (70%)`,
    );
    console.log(
      `🎯 [TOKEN_MANAGEMENT] Tokens system (preservados): ${systemTokens}`,
    );
    console.log(
      `🎯 [TOKEN_MANAGEMENT] Disponível para conversa: ${availableForConversation}`,
    );

    // Calcular tokens da conversa atual
    const conversationTokens = conversationMessages.reduce(
      (total, msg) => total + estimateTokens(msg.content),
      0,
    );

    console.log(
      `🎯 [TOKEN_MANAGEMENT] Tokens da conversa atual: ${conversationTokens}`,
    );

    // Se exceder o limite, truncar mensagens antigas (mas manter as mais recentes)
    let finalConversationMessages = conversationMessages;

    if (conversationTokens > availableForConversation) {
      console.log(
        `⚠️ [TOKEN_MANAGEMENT] Limite excedido! Truncando histórico...`,
      );

      finalConversationMessages = [];
      let accumulatedTokens = 0;

      // Sempre manter a última mensagem (geralmente do usuário)
      if (conversationMessages.length > 0) {
        const lastMessage =
          conversationMessages[conversationMessages.length - 1]!;
        const lastMessageTokens = estimateTokens(lastMessage.content);
        finalConversationMessages.push(lastMessage);
        accumulatedTokens += lastMessageTokens;
        console.log(
          `🎯 [TOKEN_MANAGEMENT] Última mensagem preservada: ${lastMessageTokens} tokens`,
        );
      }

      // Adicionar mensagens anteriores de trás para frente até atingir o limite
      for (let i = conversationMessages.length - 2; i >= 0; i--) {
        const msg = conversationMessages[i];
        if (!msg) continue; // Pular se mensagem for undefined
        const msgTokens = estimateTokens(msg.content);

        if (accumulatedTokens + msgTokens <= availableForConversation) {
          finalConversationMessages.unshift(msg); // Adicionar no início para manter ordem
          accumulatedTokens += msgTokens;
        } else {
          console.log(
            `🎯 [TOKEN_MANAGEMENT] Mensagem ${i} removida para economizar tokens`,
          );
          break;
        }
      }

      const removedCount =
        conversationMessages.length - finalConversationMessages.length;
      console.log(
        `✅ [TOKEN_MANAGEMENT] Histórico truncado: ${removedCount} mensagens removidas`,
      );
      console.log(
        `✅ [TOKEN_MANAGEMENT] Tokens finais da conversa: ${accumulatedTokens}`,
      );
    }

    // Reconstruir array final: System messages primeiro, depois conversa truncada
    const finalFormattedMessages = [
      ...systemMessages,
      ...finalConversationMessages,
    ];

    // Validação final
    const totalFinalTokens = finalFormattedMessages.reduce(
      (total, msg) => total + estimateTokens(msg.content),
      0,
    );

    console.log(
      `🎯 [TOKEN_MANAGEMENT] Total final de tokens: ${totalFinalTokens}/${maxInputTokens}`,
    );
    console.log(
      `🎯 [TOKEN_MANAGEMENT] Mensagens finais: ${finalFormattedMessages.length} (${systemMessages.length} system + ${finalConversationMessages.length} conversa)`,
    );

    if (totalFinalTokens > maxInputTokens) {
      console.warn(
        `⚠️ [TOKEN_MANAGEMENT] AVISO: Ainda excedendo limite! ${totalFinalTokens} > ${maxInputTokens}`,
      );
    } else {
      console.log(
        `✅ [TOKEN_MANAGEMENT] Dentro do limite! ${totalFinalTokens} <= ${maxInputTokens}`,
      );
    }

    // Usar mensagens finais otimizadas
    const optimizedPayload = {
      model: modelName,
      messages: finalFormattedMessages,
      max_tokens: Math.floor(maxTokens * 0.3), // 30% reservado para resposta
      temperature: temperature,
      stream: true,
    };

    // Fazer chamada para API com streaming
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(optimizedPayload),
    });

    // 🔧 FIX: Tratamento específico de erros da OpenAI
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [API] OpenAI API Error:`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500), // Limitar tamanho do log
        modelName,
        baseUrl,
        providerId: model.providerId,
        teamId: session.teamId,
      });

      // Verificar se é erro de autenticação (token inválido no banco)
      if (response.status === 401) {
        throw new Error(
          `Token da OpenAI inválido ou expirado para este team. Acesse o AI Studio > Configurações > Providers e verifique/atualize o token da OpenAI. (Status: ${response.status})`,
        );
      }

      // Verificar se é erro de quota/billing
      if (response.status === 429) {
        throw new Error(
          `Limite de uso da OpenAI excedido. Verifique sua conta OpenAI ou configure um novo token no AI Studio. (Status: ${response.status})`,
        );
      }

      // Verificar se é erro de modelo não encontrado
      if (response.status === 404 && errorText.includes("model")) {
        throw new Error(
          `Modelo "${modelName}" não encontrado na OpenAI. Verifique se o modelo está disponível para sua conta ou configure um modelo diferente no AI Studio. (Status: ${response.status})`,
        );
      }

      // Verificar se é erro de permissão
      if (response.status === 403) {
        throw new Error(
          `Sem permissão para usar o modelo "${modelName}" com o token configurado. Verifique suas permissões na OpenAI ou atualize o token no AI Studio. (Status: ${response.status})`,
        );
      }

      // Erro genérico com orientação específica do AI Studio
      throw new Error(
        `Erro na API da OpenAI: ${response.status} - ${response.statusText}. Verifique a configuração do token no AI Studio > Configurações > Providers. ${errorText ? `Detalhes: ${errorText.substring(0, 200)}...` : ""}`,
      );
    }

    if (!response.body) {
      throw new Error("A resposta da API de streaming não contém um corpo.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    const stream = new ReadableStream({
      async start(controller) {
        let receivedText = "";
        const currentSessionId = session.id;

        try {
          while (true) {
            if (request.signal.aborted) {
              console.log("🔴 [API] Request abortado pelo cliente");
              break;
            }

            const { done, value } = await reader.read();
            if (done) {
              // ✅ Criar metadata com informações do modelo
              const messageMetadata = {
                requestedModel: modelName,
                actualModelUsed: modelName, // Para streaming, assumimos que o modelo usado é o solicitado
                providerId: model.providerId,
                providerName: model.provider.name,
                usage: null, // Streaming não retorna usage info
                timestamp: new Date().toISOString(),
              };

              console.log(`🔍 [METADATA] Salvando metadata:`, messageMetadata);

              // Quando o stream do provedor termina, salvamos a mensagem completa com metadata.
              await ChatService.createMessage({
                chatSessionId: currentSessionId,
                senderRole: "ai",
                content: receivedText,
                status: "ok",
                metadata: messageMetadata,
              });
              console.log(
                "✅ [API] Mensagem final da IA salva no banco com metadata",
              );
              break; // Finaliza o loop.
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();

                if (data === "[DONE]") {
                  // O provedor sinalizou o fim do stream.
                  // O 'done' do reader.read() vai ser true na próxima iteração.
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;

                  if (delta) {
                    receivedText += delta;
                    controller.enqueue(new TextEncoder().encode(delta));
                  }
                } catch (parseError) {
                  // Ignora linhas que não são JSON válido.
                  continue;
                }
              }
            }
          }
        } catch (error) {
          console.error("🔴 [API] Erro no streaming:", error);
          controller.enqueue(
            new TextEncoder().encode(
              `Error: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            ),
          );
        } finally {
          controller.close();
          reader.releaseLock();
          console.log("🔵 [API] Conexão de streaming fechada");
        }
      },
    });

    // Se criou uma nova sessão, incluir o ID no header
    const headers: HeadersInit = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    };

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("🔴 [API] Erro no endpoint de streaming:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
