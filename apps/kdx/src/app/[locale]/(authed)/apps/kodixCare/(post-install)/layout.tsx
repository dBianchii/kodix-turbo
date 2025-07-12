import { SidebarProvider } from "@kdx/ui/sidebar";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import {
  KodixCareSideBar,
  SideBarToggle,
} from "./_components/sidebar-kodix-care";

export default function KodixCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaxWidthWrapper>
      <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
        <KodixCareSideBar />
        <div className="flex w-full flex-col">
          <SideBarToggle />
          {children}
        </div>
      </SidebarProvider>
    </MaxWidthWrapper>
  );
}
