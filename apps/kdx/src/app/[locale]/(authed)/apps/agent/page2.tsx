import { getTranslations } from "next-intl/server";

import type { KodixAppId } from "@kdx/shared";
import { agentAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@kdx/ui/sidebar";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import AgentLayout from "./_components/agent-layout";

export default async function AgentPage() {
  const appId = agentAppId as unknown as KodixAppId;
  await redirectIfAppNotInstalled({ appId });
  const t = await getTranslations();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="p-4">
              <h2 className="text-lg font-semibold">{t("Agent")}</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <div className="space-y-2 p-4">
                <div className="pt-2">
                  <h3 className="mb-2 text-sm font-semibold">{t("Menu")}</h3>
                  <div className="space-y-1">
                    <button className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-sm">
                      {t("Dashboard")}
                    </button>
                    <button className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-sm">
                      {t("Settings")}
                    </button>
                    <button className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-sm">
                      {t("History")}
                    </button>
                  </div>
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4">
              <p className="text-muted-foreground text-xs"></p>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Conteúdo principal */}
        <div className="flex-1">
          <MaxWidthWrapper></MaxWidthWrapper>
        </div>
      </div>
    </SidebarProvider>
  );
}
