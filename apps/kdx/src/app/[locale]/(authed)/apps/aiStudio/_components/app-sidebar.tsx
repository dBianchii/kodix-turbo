"use client";

import { useState } from "react";
import { Bot, Brain, Database, Key } from "lucide-react";
import { useTranslations } from "next-intl";

import { aiStudioAppId } from "@kdx/shared";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@kdx/ui/sidebar";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";

// Seções do AI Studio
const sections = [
  {
    id: "agents",
    title: "agents.title",
    icon: Bot,
  },
  {
    id: "libraries",
    title: "libraries.title",
    icon: Database,
  },
  {
    id: "models",
    title: "models.title",
    icon: Brain,
  },
  {
    id: "tokens",
    title: "tokens.title",
    icon: Key,
  },
];

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function AppSidebar({
  activeSection = "agents",
  onSectionChange,
}: AppSidebarProps) {
  const { isMobile } = useSidebar();
  const t = useTranslations();

  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "none"}
      className="h-full w-60 shrink-0 border-r border-gray-800"
    >
      <SidebarContent className="h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Cabeçalho com ícone do app */}
              <div className="flex items-end gap-2 py-2 font-semibold">
                <IconKodixApp
                  appId={aiStudioAppId}
                  renderText={false}
                  size={35}
                />
                <span className="text-lg">{t("apps.aiStudio.appName")}</span>
              </div>

              {/* Itens do menu */}
              {sections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeSection === section.id}
                  >
                    <button
                      onClick={() => onSectionChange?.(section.id)}
                      className="flex w-full items-center gap-2"
                    >
                      <section.icon className="h-5 w-5" />
                      <span>{t(`apps.aiStudio.${section.title}` as any)}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
