import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#121212] text-white">
        {/* Sidebar */}
        <AppSidebar />

        {/* Conteúdo ao lado */}
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center">
            <SidebarTrigger />
            <h1 className="ml-2 text-xl font-semibold">
              Bem-vindo ao painel do agente
            </h1>
          </div>

          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
