import MaxWidthWrapper from "../../_components/max-width-wrapper";
import {
  KodixCareNavigationLayout,
  NavigationSheet,
} from "./_components/kodix-care-navigation-layout";

export default function KodixCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaxWidthWrapper>
      <div className="flex min-h-[calc(100dvh-55px)]">
        <div className="hidden border-r pr-4 pt-4 md:block">
          <KodixCareNavigationLayout />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex h-14 items-center gap-4 border-b px-4 md:hidden lg:px-6">
            <NavigationSheet />
          </div>
          {children}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
