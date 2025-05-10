"use client";

import { useTranslations } from "next-intl";

import { Separator } from "@kdx/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { H1 } from "@kdx/ui/typography";

import { AppSidebar } from "./_components/app-sidebar";
import { ChatWindow } from "./_components/chat-window";

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();

  return (
    <SidebarProvider>
      {/* Garantindo largura total e prevenindo overflow horizontal */}
      <div className="flex min-h-screen w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Container para sidebar e conteúdo principal */}
        <div className="flex w-full">
          {/* Sidebar */}
          <AppSidebar />

          {/* Conteúdo ao lado */}
          <div className="flex flex-1 flex-col p-4">
            {/* cabeçalho (linha) */}
            <div className="mb-4 flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">
                Bem‑vindo ao painel do agente
              </h1>
            </div>
            <H1>{t("Agent")}</H1>
            <Separator className="my-4" />

            {/* chat (ocupa o resto) */}
            <div className="relative flex-1">
              <ChatWindow />
            </div>

            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
