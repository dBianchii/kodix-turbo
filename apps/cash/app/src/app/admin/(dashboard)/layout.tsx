import { type PropsWithChildren, Suspense } from "react";
import { cookies } from "next/headers";
import { Separator } from "@kodix/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@kodix/ui/sidebar";

import CashSidebar from "./_components/sidebar";

async function SidebarProviderAsync({ children }: PropsWithChildren) {
  return (
    <SidebarProvider
      defaultOpen={(await cookies()).get("sidebar_state")?.value !== "false"}
    >
      {children}
    </SidebarProvider>
  );
}

function SidebarProviderWrapper({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<SidebarProvider>{children}</SidebarProvider>}>
      <SidebarProviderAsync>{children}</SidebarProviderAsync>
    </Suspense>
  );
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProviderWrapper>
      <CashSidebar />
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
    </SidebarProviderWrapper>
  );
}
