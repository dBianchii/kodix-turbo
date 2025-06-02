"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";
import { ChatWindow } from "./_components/chat-window";
import { QuickChatInput } from "./_components/quick-chat-input";

{
  /*
  import { H1 } from "@kdx/ui/typography"; 
  import { Separator } from "@kdx/ui/separator";
  */
}

export default function ChatPage() {
  const t = useTranslations();
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(undefined);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Sidebar ‑– assume largura interna definida pelo componente */}
        <AppSidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col p-4">
          {/* Cabeçalho */}
          <div className="mb-4 flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">
              {selectedSessionId
                ? t("apps.chat.appName")
                : t("apps.chat.welcome-chat")}
            </h1>
          </div>

          {/* <H1>{t("Chat")}</H1>
          <Separator className="my-4" />
          */}

          {/* Área do chat cresce para preencher o espaço restante */}
          <div className="relative flex-1">
            {selectedSessionId ? (
              <ChatWindow sessionId={selectedSessionId} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <QuickChatInput onSessionCreated={handleSessionSelect} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
