import type { PropsWithChildren } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@cash/auth";
import { Separator } from "@kodix/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@kodix/ui/sidebar";

import CashSidebar from "./_components/sidebar";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { user } = await auth();
  if (!user) {
    redirect("/admin/auth/login");
  }

  return (
    <SidebarProvider
      defaultOpen={(await cookies()).get("sidebar:state")?.value !== "false"}
    >
      <CashSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
