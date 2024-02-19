import { Suspense } from "react";

import { AppSwitcher } from "~/app/_components/app-switcher/app-switcher";

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense>
        <AppSwitcher
          hrefPrefix="/team/settings/roles/"
          hideAddMoreApps
          iconSize={40}
        />
      </Suspense>
      {children}
    </div>
  );
}
