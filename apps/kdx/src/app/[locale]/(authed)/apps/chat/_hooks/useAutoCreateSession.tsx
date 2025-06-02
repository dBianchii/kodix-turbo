"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseAutoCreateSessionOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

export function useAutoCreateSession(options?: UseAutoCreateSessionOptions) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSessionWithMessage = async (input: {
    firstMessage: string;
    useAgent?: boolean;
    generateTitle?: boolean;
  }) => {
    if (isCreating) {
      toast("Criando chat...");
      return;
    }

    if (!input.firstMessage.trim()) {
      toast.error("Digite uma mensagem para iniciar o chat.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      console.log(
        "🚀 [CHAT] Criando nova sessão:",
        input.firstMessage.slice(0, 30) + "...",
      );

      // Try autoCreateSessionWithMessage endpoint
      console.log("📡 [CHAT] Tentando autoCreateSessionWithMessage...");
      const response = await fetch("/api/trpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "0": {
            json: {
              firstMessage: input.firstMessage,
              useAgent: input.useAgent ?? true,
              generateTitle: input.generateTitle ?? true,
            },
            meta: {
              values: {
                firstMessage: ["undefined"],
                useAgent: ["undefined"],
                generateTitle: ["undefined"],
              },
            },
            path: "app.chat.autoCreateSessionWithMessage",
          },
        }),
      });

      console.log("📡 [CHAT] Response status:", response.status);
      const responseText = await response.text();
      console.log("📡 [CHAT] Response text:", responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("✅ [CHAT] Resposta parseada:", data);

          // Check for session ID in the response
          const result = data[0]?.result?.data;
          if (result?.session?.id) {
            const sessionId = result.session.id;
            console.log("✅ [CHAT] Sessão criada com sucesso:", sessionId);

            toast.success("Chat iniciado com sucesso!");
            router.push(`/apps/chat/${sessionId}`);
            options?.onSuccess?.(sessionId);
            return;
          } else {
            console.log("⚠️ [CHAT] Resposta OK mas sem session ID:", result);
          }
        } catch (parseError) {
          console.error("❌ [CHAT] Erro ao parsear resposta:", parseError);
        }
      } else {
        console.log(
          "⚠️ [CHAT] Response não OK:",
          response.status,
          responseText,
        );
      }

      // If autoCreate fails, try fallback with iniciarNovaConversa
      console.log("⚠️ [CHAT] AutoCreate falhou, tentando buscar modelos...");

      // Get available models
      const modelsResponse = await fetch("/api/trpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "0": {
            json: {},
            path: "app.aiStudio.findAvailableModels",
          },
        }),
      });

      console.log("📡 [CHAT] Models response status:", modelsResponse.status);
      const modelsText = await modelsResponse.text();
      console.log("📡 [CHAT] Models response text:", modelsText);

      if (modelsResponse.ok) {
        try {
          const modelsData = JSON.parse(modelsText);
          console.log("✅ [CHAT] Models data:", modelsData);
          const models = modelsData[0]?.result?.data || [];
          console.log("✅ [CHAT] Models found:", models.length);

          if (models.length > 0) {
            const firstModel = models[0];
            console.log("✅ [CHAT] Usando modelo:", firstModel);

            // Generate title
            const title =
              input.firstMessage.length > 50
                ? input.firstMessage.slice(0, 50) + "..."
                : input.firstMessage;

            // Create session with iniciarNovaConversa
            console.log("📡 [CHAT] Tentando iniciarNovaConversa...");
            const createResponse = await fetch("/api/trpc", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "0": {
                  json: {
                    title: title,
                    aiModelId: firstModel.id,
                    primeiraMessage: input.firstMessage,
                  },
                  path: "app.chat.iniciarNovaConversa",
                },
              }),
            });

            console.log(
              "📡 [CHAT] Create response status:",
              createResponse.status,
            );
            const createText = await createResponse.text();
            console.log("📡 [CHAT] Create response text:", createText);

            if (createResponse.ok) {
              try {
                const createData = JSON.parse(createText);
                console.log("✅ [CHAT] Create data:", createData);
                const sessionResult = createData[0]?.result?.data;

                if (sessionResult?.session?.id) {
                  const sessionId = sessionResult.session.id;
                  console.log(
                    "✅ [CHAT] Sessão criada via fallback:",
                    sessionId,
                  );

                  toast.success("Chat iniciado com sucesso!");
                  router.push(`/apps/chat/${sessionId}`);
                  options?.onSuccess?.(sessionId);
                  return;
                } else {
                  console.log(
                    "⚠️ [CHAT] Create OK mas sem session ID:",
                    sessionResult,
                  );
                }
              } catch (parseError) {
                console.error(
                  "❌ [CHAT] Erro ao parsear create response:",
                  parseError,
                );
              }
            } else {
              console.log(
                "⚠️ [CHAT] Create response não OK:",
                createResponse.status,
                createText,
              );
            }
          } else {
            console.log("⚠️ [CHAT] Nenhum modelo encontrado");
          }
        } catch (parseError) {
          console.error(
            "❌ [CHAT] Erro ao parsear models response:",
            parseError,
          );
        }
      } else {
        console.log(
          "⚠️ [CHAT] Models response não OK:",
          modelsResponse.status,
          modelsText,
        );
      }

      throw new Error(
        "Não foi possível criar a sessão. Verifique se há modelos configurados no AI Studio.",
      );
    } catch (error) {
      console.error("❌ [CHAT] Erro ao criar sessão:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(errorMessage);
      setError(error as Error);
      options?.onError?.(error as Error);
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setIsCreating(false);
    setError(null);
  };

  return {
    createSessionWithMessage,
    createSessionWithMessageAsync: createSessionWithMessage,
    isCreating,
    error,
    reset,
  };
}
