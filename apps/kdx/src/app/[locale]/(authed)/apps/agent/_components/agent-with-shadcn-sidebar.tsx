"use client";

import React from "react";
import { useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@kdx/ui/sidebar";

import { AIIcon } from "./agent-icons";
import { ChatWindow } from "./chat-window";

export function AgentWithShadcnSidebar() {
  const t = useTranslations();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-md border">
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="p-4">
              <h2 className="text-lg font-semibold">
                {t("apps.agent.appDescription")}
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <div className="space-y-2 p-4">
                <button className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                  <AIIcon className="h-4 w-4" />
                  <span>{t("Create")}</span>
                </button>
                <div className="pt-4">
                  <h3 className="mb-2 text-sm font-semibold">{t("Active")}</h3>
                  <div className="space-y-1">
                    {/* Aqui poderiam ser listados chats recentes */}
                    <button className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-sm">
                      Chat 1
                    </button>
                    <button className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-sm">
                      Chat 2
                    </button>
                  </div>
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4">
              <p className="text-muted-foreground text-xs">
                {t("apps.agent.appDescription")}
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <div className="flex h-12 items-center border-b px-4">
            <SidebarTrigger />
            <h3 className="ml-4 font-medium">{t("Title")}</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <ChatWindow />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
