"use client";

import { useState } from "react";
import {
  Bot,
  Brain,
  Building,
  Database,
  Key,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { aiStudioAppId } from "@kdx/shared";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@kdx/ui/sidebar";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";

// Seções principais (mais usadas diariamente)
const mainSections = [
  {
    id: "team-instructions",
    title: "teamInstructions",
    icon: MessageSquare,
  },
  {
    id: "tokens",
    title: "tokens",
    icon: Key,
  },
  {
    id: "enabled-models",
    title: "enabledModels",
    icon: Brain,
  },
  {
    id: "agents",
    title: "agents",
    icon: Bot,
  },
  {
    id: "libraries",
    title: "libraries",
    icon: Database,
  },
];

// Seções de personalização do usuário
const personalizationSections = [
  {
    id: "user-instructions",
    title: "userInstructions",
    icon: User,
  },
];

// Configurações gerais (menos alteradas)
const configSections = [
  {
    id: "providers",
    title: "providers",
    icon: Building,
  },
  {
    id: "models",
    title: "models",
    icon: Brain,
  },
];

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function AppSidebar({
  activeSection = "tokens",
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
        {/* Cabeçalho com ícone do app */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-end gap-2 py-2 font-semibold">
              <IconKodixApp
                appId={aiStudioAppId}
                renderText={false}
                size={35}
              />
              <span className="text-lg">{t("apps.aiStudio.appName")}</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção de Personalização */}
        <SidebarGroup>
          <SidebarGroupLabel>Personalização</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalizationSections.map((section) => (
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
                      <span>
                        {t(`apps.aiStudio.${section.title}.title` as any)}
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainSections.map((section) => (
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
                      <span>
                        {t(`apps.aiStudio.${section.title}.title` as any)}
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção de Configuração Geral */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuração Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configSections.map((section) => (
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
                      <span>
                        {t(`apps.aiStudio.${section.title}.title` as any)}
                      </span>
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
