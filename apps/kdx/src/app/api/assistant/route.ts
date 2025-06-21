import { AssistantResponse } from "ai";
import { z } from "zod";

import { auth } from "@kdx/auth";
import { chatRepository } from "@kdx/db/repositories";
import { chatAppId } from "@kdx/shared";

import { AiStudioService } from "../../../../../../packages/api/src/internal/services/ai-studio.service";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Schema para validação
const requestSchema = z.object({
  threadId: z.string().nullable(),
  message: z.string(),
});

export async function POST(req: Request) {
  try {
    console.log("🚀 [ASSISTANT-UI] Processando requisição...");

    // Autenticação
    const session = await auth();
    if (!session?.user) {
      console.error("❌ [ASSISTANT-UI] Usuário não autenticado");
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse do body
    const body = await req.json();
    const input = requestSchema.parse(body);

    console.log("📝 [ASSISTANT-UI] Input:", {
      threadId: input.threadId,
      messageLength: input.message.length,
    });

    // Criar ou buscar thread (sessão)
    let threadId = input.threadId;
    let isNewThread = false;
    let preferredModel: any = null; // Declarar no escopo superior

    if (!threadId) {
      console.log("🆕 [ASSISTANT-UI] Criando nova thread...");

      // Criar nova sessão usando AiStudioService para modelo correto
      const availableModels = await AiStudioService.getAvailableModels({
        teamId: session.user.activeTeamId,
        requestingApp: chatAppId,
      });

      if (!availableModels || availableModels.length === 0) {
        throw new Error(
          "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
        );
      }

      preferredModel = availableModels[0]; // Atribuir à variável do escopo superior
      if (!preferredModel) {
        throw new Error("Nenhum modelo de IA disponível");
      }

      const newSession = await chatRepository.ChatSessionRepository.create({
        title: `Chat ${new Date().toLocaleDateString()}`, // Será atualizado automaticamente
        aiModelId: preferredModel.id,
        teamId: session.user.activeTeamId,
        userId: session.user.id,
      });

      if (!newSession) {
        throw new Error("Falha ao criar sessão");
      }

      threadId = newSession.id;
      isNewThread = true;

      console.log("✅ [ASSISTANT-UI] Nova thread criada:", threadId);
    }

    // Adicionar mensagem do usuário
    console.log("💬 [ASSISTANT-UI] Adicionando mensagem do usuário...");
    const userMessage = await chatRepository.ChatMessageRepository.create({
      chatSessionId: threadId,
      content: input.message,
      senderRole: "user",
      status: "ok",
    });

    if (!userMessage) {
      throw new Error("Falha ao criar mensagem do usuário");
    }

    // Retornar resposta do Assistant com streaming
    return AssistantResponse(
      { threadId, messageId: userMessage.id },
      async ({ forwardStream }) => {
        console.log("🌊 [ASSISTANT-UI] Iniciando streaming...");

        try {
          // Usar o endpoint de stream existente
          const streamResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/chat/stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
              },
              body: JSON.stringify({
                chatSessionId: threadId,
                useAgent: true,
              }),
            },
          );

          if (!streamResponse.ok) {
            throw new Error(`Stream error: ${streamResponse.statusText}`);
          }

          if (streamResponse.body) {
            // Forward the stream
            await forwardStream(streamResponse.body);
            console.log("✅ [ASSISTANT-UI] Streaming completado");
          }

          // 🤖 Gerar título automaticamente se for nova thread
          if (isNewThread) {
            console.log("🤖 [ASSISTANT-UI] Gerando título automático...");

            // Executar em background para não bloquear a resposta
            setImmediate(async () => {
              try {
                console.log(
                  "🤖 [ASSISTANT-UI] Usando modelo:",
                  preferredModel?.name,
                );

                // Buscar token do provider via AiStudioService
                const providerToken = await AiStudioService.getProviderToken({
                  providerId: preferredModel!.providerId,
                  teamId: session.user.activeTeamId,
                  requestingApp: chatAppId,
                });

                if (providerToken.token) {
                  // Configurar API baseada no provider
                  const baseUrl =
                    preferredModel!.provider?.baseUrl ||
                    "https://api.openai.com/v1";
                  const apiUrl = `${baseUrl}/chat/completions`;

                  // Usar configurações do modelo
                  const modelConfig = (preferredModel!.config || {}) as {
                    version?: string;
                    maxTokens?: number;
                    temperature?: number;
                  };
                  const modelName = modelConfig.version || preferredModel!.name;

                  // Prompt para gerar título
                  const titlePrompt = [
                    {
                      role: "system",
                      content:
                        "Você é um assistente especializado em criar títulos concisos. Crie um título curto (máximo 50 caracteres) que capture a essência da mensagem do usuário. Responda apenas com o título, sem aspas ou formatação adicional.",
                    },
                    {
                      role: "user",
                      content: `Crie um título para esta conversa: "${input.message}"`,
                    },
                  ];

                  const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${providerToken.token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: modelName,
                      messages: titlePrompt,
                      max_tokens: 20,
                      temperature: 0.7,
                    }),
                  });

                  if (response.ok) {
                    const aiResponse = await response.json();
                    const generatedTitle =
                      aiResponse.choices?.[0]?.message?.content?.trim();

                    if (generatedTitle && generatedTitle.length <= 50) {
                      // Atualizar título da sessão
                      await chatRepository.ChatSessionRepository.update(
                        threadId,
                        {
                          title: generatedTitle,
                        },
                      );
                      console.log(
                        "✅ [ASSISTANT-UI] Título gerado:",
                        generatedTitle,
                      );

                      // 🔄 INVALIDAÇÃO DE CACHE: Notificar cliente sobre atualização de título
                      try {
                        // Criar evento para notificar o frontend
                        const notificationPayload = {
                          type: "TITLE_UPDATED",
                          threadId: threadId,
                          newTitle: generatedTitle,
                          timestamp: new Date().toISOString(),
                        };
                        console.log(
                          "🔄 [ASSISTANT-UI] Cache invalidado - título atualizado:",
                          notificationPayload,
                        );
                      } catch (cacheError) {
                        console.warn(
                          "⚠️ [ASSISTANT-UI] Erro na invalidação de cache:",
                          cacheError,
                        );
                      }
                    }
                  }
                } else {
                  console.warn(
                    "⚠️ [ASSISTANT-UI] Token do provider não disponível",
                  );
                }
              } catch (error) {
                console.warn("⚠️ [ASSISTANT-UI] Erro ao gerar título:", error);

                // Fallback: usar primeiros 50 caracteres da mensagem
                try {
                  let fallbackTitle = input.message.slice(0, 50);
                  if (input.message.length > 50) {
                    fallbackTitle += "...";
                  }

                  await chatRepository.ChatSessionRepository.update(threadId, {
                    title: fallbackTitle,
                  });
                  console.log(
                    "✅ [ASSISTANT-UI] Título fallback usado:",
                    fallbackTitle,
                  );

                  // 🔄 INVALIDAÇÃO DE CACHE: Também para fallback
                  try {
                    const notificationPayload = {
                      type: "TITLE_UPDATED",
                      threadId: threadId,
                      newTitle: fallbackTitle,
                      timestamp: new Date().toISOString(),
                    };
                    console.log(
                      "🔄 [ASSISTANT-UI] Cache invalidado (fallback):",
                      notificationPayload,
                    );
                  } catch (cacheError) {
                    console.warn(
                      "⚠️ [ASSISTANT-UI] Erro na invalidação de cache (fallback):",
                      cacheError,
                    );
                  }
                } catch (fallbackError) {
                  console.error(
                    "❌ [ASSISTANT-UI] Erro no fallback:",
                    fallbackError,
                  );
                }
              }
            });
          }
        } catch (error) {
          console.error("❌ [ASSISTANT-UI] Erro no streaming:", error);
          throw error;
        }
      },
    );
  } catch (error) {
    console.error("❌ [ASSISTANT-UI] Erro geral:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
