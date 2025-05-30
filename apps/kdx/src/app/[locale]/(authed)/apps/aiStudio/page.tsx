"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { aiStudioAppId } from "@kdx/shared";
import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";

import { AiStudioContent } from "./_components/ai-studio-content";
import { AppSidebar } from "./_components/app-sidebar";

export default function AiStudioPage() {
  const t = useTranslations();
  const [activeSection, setActiveSection] = useState("agents");

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Sidebar */}
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col p-4">
          {/* Cabeçalho com trigger para mobile */}
          <div className="mb-4 flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">
              {t("apps.aiStudio.welcome")}
            </h1>
          </div>

          {/* Conteúdo do app */}
          <div className="relative flex-1">
            <AiStudioContent activeSection={activeSection} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
