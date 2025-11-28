"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@kodix/ui/sidebar";
import { Receipt, Users } from "lucide-react";

const navItems: {
  icon: React.ElementType;
  name: string;
  url: Route;
}[] = [
  {
    icon: Receipt,
    name: "Buscar Vendas",
    url: "/admin/vendas",
  },
  {
    icon: Users,
    name: "Clientes",
    url: "/admin/clients",
  },
] as const;

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={item.url === pathname}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
