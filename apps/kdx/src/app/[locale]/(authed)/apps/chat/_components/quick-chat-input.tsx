"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Send, Sparkles, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
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
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl animate-pulse border shadow-lg">
          <CardHeader className="pb-3 text-center">
            <div className="mb-2 h-8 rounded bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
            <div className="mx-auto h-4 w-1/2 rounded bg-slate-200" />
          </CardHeader>
          <CardContent>
            <div className="h-20 rounded bg-slate-200" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDisabled = isCreating || !isClient;
  const hasMessage = message.trim().length > 0;
  const isLongMessage = message.length > 1000;

  const suggestions = [
    { text: "Explique quantum computing", icon: Zap },
    { text: "Crie um plano de negócios", icon: Bot },
    { text: "Analise este código", icon: MessageSquare },
    { text: "Escreva um email profissional", icon: Send },
  ];

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header with gradient background */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 p-4 backdrop-blur-sm">
            <div className="relative">
              <Sparkles className="h-8 w-8 animate-pulse text-purple-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-blue-500 opacity-20" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                {t("apps.chat.welcome-chat")}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Powered by AI Studio
              </p>
            </div>
          </div>
        </div>

        {/* Main Input Card */}
        <Card className="bg-slate-900/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              Nova Conversa
            </CardTitle>
            <CardDescription className="text-sm text-slate-400">
              Digite sua mensagem e pressione Enter para começar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={t("apps.chat.messages.placeholder")}
                disabled={isDisabled}
                className="max-h-[200px] min-h-[80px] resize-none border-0 border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20"
                autoFocus
              />

              {/* Character count badge */}
              <div className="absolute right-2 bottom-2">
                <Badge
                  variant={isLongMessage ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {message.length}/1000
                </Badge>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-0">
                <AlertDescription className="text-sm">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500">
                <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-xs">
                  Shift
                </kbd>{" "}
                +
                <kbd className="ml-1 rounded bg-slate-700 px-1.5 py-0.5 text-xs">
                  Enter
                </kbd>{" "}
                para nova linha
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!hasMessage || isDisabled || isLongMessage}
                className="gap-2 border-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-300">
              Ou experimente uma dessas sugestões:
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {suggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setMessage(suggestion.text)}
                  disabled={isDisabled}
                  className="h-auto justify-start border-slate-700 bg-slate-800/30 p-3 text-left text-sm transition-all duration-200 hover:border-purple-400/30 hover:bg-slate-700/50"
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="rounded bg-purple-600/20 p-1.5">
                      <IconComponent className="h-3 w-3 text-purple-400" />
                    </div>
                    <span className="font-medium text-slate-200">
                      {suggestion.text}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
