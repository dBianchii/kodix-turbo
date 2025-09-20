"use client";

import { kodixCareAppId } from "@kodix/shared/db";
import { Button } from "@kodix/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@kodix/ui/sidebar";
import { useTranslations } from "next-intl";
import { LuCog, LuHouse, LuListChecks, LuPanelLeft } from "react-icons/lu";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import { Link, usePathname } from "~/i18n/routing";

export function SideBarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center border-b p-2 md:hidden">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0"
        onClick={toggleSidebar}
      >
        <LuPanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar menu</span>
      </Button>
    </div>
  );
}

export function KodixCareSideBar() {
  const t = useTranslations();
  const kodixCareNavItems = [
    { href: "/apps/kodixCare", icon: LuHouse, text: t("Main page") },
    { href: "/apps/kodixCare/shifts", icon: LuListChecks, text: t("Shifts") },
    { href: "/apps/kodixCare/settings", icon: LuCog, text: t("Settings") },
  ];
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "none"}
      className="hidden min-h-[calc(100dvh-55px)] border-r bg-background md:flex"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex items-end gap-2 py-2 font-semibold">
                <IconKodixApp
                  appId={kodixCareAppId}
                  renderText={false}
                  size={35}
                />
                <span className="text-lg">{t("Kodix Care")}</span>
              </div>
              {kodixCareNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.href === pathname}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.text}</span>
                    </Link>
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
