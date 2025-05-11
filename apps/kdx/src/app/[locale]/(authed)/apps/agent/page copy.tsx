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
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Sidebar ‑– assume largura interna definida pelo componente */}
        <AppSidebar />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col p-4">
          {/* Cabeçalho */}
          <div className="mb-4 flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">
              Bem‑vindo ao painel do agente
            </h1>
          </div>

          <H1>{t("Agent")}</H1>
          <Separator className="my-4" />

          {/* Área do chat cresce para preencher o espaço restante */}
          <div className="relative flex-1">
            <ChatWindow />
          </div>

          {/* Children opcionais abaixo do chat */}
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
