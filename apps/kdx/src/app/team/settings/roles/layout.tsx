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
        <div>
          <h1 className="text-lg font-bold">Select your app</h1>
          <AppSwitcher
            hrefPrefix="/team/settings/roles/"
            hideAddMoreApps
            iconSize={40}
          />
        </div>
      </Suspense>
      {children}
    </div>
  );
}
