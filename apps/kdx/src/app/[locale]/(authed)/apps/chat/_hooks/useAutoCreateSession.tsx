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

      // 1ª Tentativa: autoCreateSessionWithMessage
      console.log("📡 [CHAT] Tentando autoCreateSessionWithMessage...");
      try {
        const response = await fetch("/api/trpc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Importante: incluir cookies de autenticação
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

        if (response.ok) {
          const responseText = await response.text();
          try {
            const data = JSON.parse(responseText);
            console.log("✅ [CHAT] Resposta parseada:", data);

            const result = data[0]?.result?.data;
            if (result?.session?.id) {
              const sessionId = result.session.id;
              console.log("✅ [CHAT] Sessão criada com sucesso:", sessionId);
              toast.success("Chat iniciado com sucesso!");
              router.push(`/apps/chat/${sessionId}`);
              options?.onSuccess?.(sessionId);
              return;
            }
          } catch (parseError) {
            console.error("❌ [CHAT] Erro ao parsear resposta:", parseError);
          }
        } else {
          const responseText = await response.text();
          console.log(
            "⚠️ [CHAT] Response não OK:",
            response.status,
            responseText,
          );
        }
      } catch (autoCreateError) {
        console.log(
          "⚠️ [CHAT] autoCreateSessionWithMessage falhou, tentando fallback...",
        );
      }

      // 2ª Tentativa: Fallback com getPreferredModel + iniciarNovaConversa
      console.log("⚠️ [CHAT] Tentando fallback com getPreferredModel...");

      const preferredModelResponse = await fetch("/api/trpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante: incluir cookies de autenticação
        body: JSON.stringify({
          "0": {
            json: {},
            path: "app.chat.getPreferredModel",
          },
        }),
      });

      console.log(
        "📡 [CHAT] Preferred model response status:",
        preferredModelResponse.status,
      );

      if (preferredModelResponse.ok) {
        const preferredModelText = await preferredModelResponse.text();
        try {
          const preferredModelData = JSON.parse(preferredModelText);
          console.log("✅ [CHAT] Preferred model data:", preferredModelData);
          const preferredModel = preferredModelData[0]?.result?.data;

          if (preferredModel?.modelId) {
            console.log(
              "✅ [CHAT] Usando modelo preferido:",
              preferredModel.modelId,
            );

            // Gerar título
            const title =
              input.firstMessage.length > 50
                ? input.firstMessage.slice(0, 50) + "..."
                : input.firstMessage;

            // Criar sessão com iniciarNovaConversa
            console.log(
              "📡 [CHAT] Tentando iniciarNovaConversa com modelo preferido...",
            );
            const createResponse = await fetch("/api/trpc", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Importante: incluir cookies de autenticação
              body: JSON.stringify({
                "0": {
                  json: {
                    title: title,
                    aiModelId: preferredModel.modelId,
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

            if (createResponse.ok) {
              const createText = await createResponse.text();
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
                }
              } catch (parseError) {
                console.error(
                  "❌ [CHAT] Erro ao parsear create response:",
                  parseError,
                );
              }
            } else {
              const createText = await createResponse.text();
              console.log(
                "⚠️ [CHAT] Create response não OK:",
                createResponse.status,
                createText,
              );

              // Tratamento de erro específico
              if (
                createResponse.status === 400 ||
                createResponse.status === 412
              ) {
                try {
                  const errorData = JSON.parse(createText);
                  const errorMessage =
                    errorData[0]?.error?.message || "Erro desconhecido";
                  toast.error(`Erro ao criar sessão: ${errorMessage}`);
                } catch {
                  toast.error(
                    "Erro ao criar sessão. Verifique se há modelos configurados no AI Studio.",
                  );
                }
              } else {
                toast.error(
                  "Erro ao conectar com o serviço de chat. Tente novamente.",
                );
              }
              return;
            }
          } else {
            console.log("⚠️ [CHAT] Nenhum modelo preferido encontrado");
            toast.error(
              "Nenhum modelo configurado. Configure um modelo no AI Studio primeiro.",
            );
            return;
          }
        } catch (parseError) {
          console.error(
            "❌ [CHAT] Erro ao parsear preferred model response:",
            parseError,
          );
        }
      } else {
        const preferredModelText = await preferredModelResponse.text();
        console.log(
          "⚠️ [CHAT] Preferred model response não OK:",
          preferredModelResponse.status,
          preferredModelText,
        );

        // Tratamento de erro específico
        if (preferredModelResponse.status === 404) {
          toast.error(
            "Serviço de chat não encontrado. Verifique a instalação.",
          );
        } else if (preferredModelResponse.status === 412) {
          toast.error(
            "Nenhum modelo configurado. Configure modelos no AI Studio primeiro.",
          );
        } else {
          toast.error(
            "Erro ao acessar configurações de modelo. Tente novamente.",
          );
        }
        return;
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
