import { type PropsWithChildren, Suspense } from "react";
import { cookies } from "next/headers";
import { ThemeToggle } from "@kodix/ui/common/theme";
import { Separator } from "@kodix/ui/separator";
import { SidebarInset, SidebarProvider } from "@kodix/ui/sidebar";

import CashSidebar from "./_components/sidebar";
import { SidebarTrigger } from "./_components/sidebar-trigger";

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
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 flex-row items-center justify-between gap-2 bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:pr-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <SidebarInset className="pt-3 md:pt-6">{children}</SidebarInset>
      </div>
    </SidebarProviderWrapper>
  );
}
