<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: reference
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Sidebar Component - Kodix

Este documento explica como usar o componente `Sidebar` do shadcn/ui no projeto Kodix, baseado na implementação do aplicativo de Chat.

## Visão Geral

O componente `Sidebar` é uma barra lateral composável, temática e customizável que é central para aplicações que precisam de navegação lateral. No Kodix, utilizamos este componente para criar barras laterais responsivas e funcionais.

## Estrutura do Componente

O `Sidebar` é composto pelos seguintes elementos principais:

- `SidebarProvider` - Gerencia o estado de expansão/colapso
- `Sidebar` - Container principal da barra lateral
- `SidebarHeader` e `SidebarFooter` - Fixos no topo e na base
- `SidebarContent` - Conteúdo rolável
- `SidebarGroup` - Seções dentro do `SidebarContent`
- `SidebarTrigger` - Botão para expandir/colapsar

## Instalação

O componente já está instalado no projeto Kodix através do pacote `@kdx/ui`. As cores CSS necessárias também já estão configuradas.

## Implementação Básica

### 1. Configuração na Página Principal

<!-- AI-CODE-BLOCK: react-component -->
<!-- AI-CODE-OPTIMIZATION: language="tsx" context="react-components" -->
```tsx
// AI-CONTEXT: React component with TypeScript
// apps/kdx/src/app/[locale]/(authed)/apps/[seu-app]/page.tsx
"use client";

import { useTranslations } from "next-intl";

import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";

export default function SeuAppPage() {
  const t = useTranslations();

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Sidebar */}
        <AppSidebar />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col p-4">
          {/* Cabeçalho com trigger para mobile */}
          <div className="mb-4 flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">
              {t("apps.seu-app.titulo")}
            </h1>
          </div>

          {/* Conteúdo do app */}
          <div className="relative flex-1">{/* Seu conteúdo aqui */}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Criação do AppSidebar

<!-- AI-CODE-BLOCK: react-component -->
<!-- AI-CODE-OPTIMIZATION: language="tsx" context="react-components" -->
```tsx
// AI-CONTEXT: React component with TypeScript
// apps/kdx/src/app/[locale]/(authed)/apps/[seu-app]/_components/app-sidebar.tsx
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { seuAppId } from "@kdx/shared";
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

// Itens do menu
const items = [
  {
    title: "Home",
    url: "/apps/seu-app",
    icon: Home,
  },
  {
    title: "Configurações",
    url: "/apps/seu-app/settings",
    icon: Settings,
  },
  // Adicione mais itens conforme necessário
];

export function AppSidebar() {
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
                <IconKodixApp appId={seuAppId} renderText={false} size={35} />
                <span className="text-lg">{t("apps.seu-app.nome")}</span>
              </div>

              {/* Itens do menu */}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>
                        {t(`apps.seu-app.menu.${item.title.toLowerCase()}`)}
                      </span>
                    </a>
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
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## Exemplo Prático: Chat App

O aplicativo de Chat implementa o Sidebar da seguinte forma:

### Estrutura de Arquivos
