"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Textarea } from "@kdx/ui/textarea";

import { useAutoCreateSession } from "../_hooks/useAutoCreateSession";
import { useChatUserConfig } from "../_hooks/useChatUserConfig";

interface QuickChatInputProps {
  onSessionCreated: (sessionId: string) => void;
  selectedModelId?: string;
}

export function QuickChatInput({
  onSessionCreated,
  selectedModelId,
}: QuickChatInputProps) {
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations();

  // Ensure we're on the client side before using hooks
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Hook para salvar configurações do usuário
  const { savePreferredModel } = useChatUserConfig();

  // ✅ SEMPRE chame o hook - nunca condicionalmente
  const { createSessionWithMessage, isCreating, error, reset } =
    useAutoCreateSession({
      onSuccess: onSessionCreated,
      onError: (error) => {
        console.error("❌ [CHAT] Erro ao criar sessão:", error);
      },
    });

  const handleSubmit = async () => {
    if (!message.trim() || isCreating || !isClient) return;

    console.log("🚀 [QUICK_CHAT] handleSubmit chamado:");
    console.log("📝 [QUICK_CHAT] Mensagem:", message.slice(0, 30) + "...");
    console.log("🎯 [QUICK_CHAT] selectedModelId recebido:", selectedModelId);

    try {
      // ✅ Se há um modelo selecionado, salvar como preferido ANTES de criar a sessão
      if (selectedModelId) {
        console.log(
          "💾 [QUICK_CHAT] Salvando modelo preferido:",
          selectedModelId,
        );

        // ✅ AGUARDAR o save ser finalizado
        const saveResult = await savePreferredModel(selectedModelId);

        console.log(
          "✅ [QUICK_CHAT] Modelo preferido salvo! Resultado:",
          saveResult,
        );

        // ✅ Pausa mais longa para garantir persistência no backend
        console.log(
          "⏳ [QUICK_CHAT] Aguardando 500ms para garantir persistência...",
        );
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("🚀 [QUICK_CHAT] Iniciando criação da sessão...");
      } else {
        console.log(
          "⚠️ [QUICK_CHAT] Nenhum modelo selecionado, prosseguindo sem salvar",
        );
      }

      // ✅ Criar a sessão (agora o backend encontrará o modelo correto)
      await createSessionWithMessage({
        firstMessage: message.trim(),
        useAgent: true,
        generateTitle: true,
      });

      setMessage("");
      console.log("✅ [QUICK_CHAT] Sessão criada com sucesso!");
    } catch (error) {
      console.error("❌ [QUICK_CHAT] Erro no processo:", error);

      // Em caso de erro, tentar criar a sessão mesmo assim
      try {
        console.log(
          "🔄 [QUICK_CHAT] Tentando criar sessão sem salvar modelo...",
        );
        await createSessionWithMessage({
          firstMessage: message.trim(),
          useAgent: true,
          generateTitle: true,
        });
        setMessage("");
      } catch (fallbackError) {
        console.error(
          "❌ [QUICK_CHAT] Erro na criação de fallback:",
          fallbackError,
        );
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Clear previous errors when user starts typing
    if (error) {
      reset();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const isDisabled = isCreating || !isClient;
  const hasMessage = message.trim().length > 0;

  const suggestions = [
    { text: "Explique quantum computing", icon: Bot },
    { text: "Crie um plano de negócios", icon: MessageSquare },
    { text: "Analise este código", icon: Bot },
    { text: "Escreva um email profissional", icon: Send },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Clean header */}
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-medium">
            {t("apps.chat.welcome-chat")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Digite sua mensagem e pressione Enter para começar
          </p>
        </div>

        {/* Clean input area */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={t("apps.chat.messages.placeholder")}
              disabled={isDisabled}
              className="focus:ring-primary/20 min-h-[120px] resize-none focus:ring-2"
              autoFocus
            />

            {/* Send button */}
            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!hasMessage || isDisabled}
                size="sm"
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Clean suggestions */}
        <div className="space-y-3">
          <p className="text-muted-foreground text-center text-sm">
            Ou experimente uma dessas sugestões:
          </p>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {suggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setMessage(suggestion.text)}
                  disabled={isDisabled}
                  className="h-auto justify-start p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">{suggestion.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Subtle help text */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            <kbd className="bg-muted rounded px-1 py-0.5 text-xs">Shift</kbd> +{" "}
            <kbd className="bg-muted rounded px-1 py-0.5 text-xs">Enter</kbd>{" "}
            para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}
