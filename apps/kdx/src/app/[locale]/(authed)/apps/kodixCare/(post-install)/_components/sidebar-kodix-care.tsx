"use client";

import { useEffect } from "react";
import { LuCog, LuHome, LuPanelLeft } from "react-icons/lu";

import { useTranslations } from "@kdx/locales/next-intl/client";
import { Link, usePathname } from "@kdx/locales/next-intl/navigation";
import { kodixCareAppId } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
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
    { href: "/apps/kodixCare", icon: LuHome, text: t("Main page") },
    { href: "/apps/kodixCare/settings", icon: LuCog, text: t("Settings") },
  ];
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile]);

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
                  <SidebarMenuButton asChild isActive={item.href === pathname}>
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
