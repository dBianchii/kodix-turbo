"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { aiStudioAppId } from "@kdx/shared";
import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";

import { AiStudioContent } from "./_components/ai-studio-content";
import { AppSidebar } from "./_components/app-sidebar";

function AiStudioPageContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("tokens");

  // Suporte para navegação via URL params (ex: ?section=tokens)
  useEffect(() => {
    const section = searchParams.get("section");
    if (
      section &&
      [
        "providers",
        "models",
        "tokens",
        "enabled-models",
        "agents",
        "libraries",
      ].includes(section)
    ) {
      setActiveSection(section);
    }
  }, [searchParams]);

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

export default function AiStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-55px)] items-center justify-center bg-[#121212] text-white">
          <div className="text-center">
            <div className="text-lg">Carregando AI Studio...</div>
          </div>
        </div>
      }
    >
      <AiStudioPageContent />
    </Suspense>
  );
}
