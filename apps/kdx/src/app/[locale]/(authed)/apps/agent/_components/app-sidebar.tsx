import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { agentAppId } from "@kdx/shared";
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

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
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
              <div className="flex items-end gap-2 py-2 font-semibold">
                <IconKodixApp appId={agentAppId} renderText={false} size={35} />
                <span className="text-lg">{t("Agent")}</span>
              </div>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
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
