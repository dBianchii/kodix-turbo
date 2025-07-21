import { kodixCareAppId } from "@kdx/shared";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";

import DataTableKodixCare from "./_components/data-table-kodix-care";

export default async function KodixCarePage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <main className="flex w-full flex-col gap-6 pt-4 pl-4 md:gap-1">
      {/* <div className="flex w-full items-start border-b md:hidden">
        <SidebarTrigger className="size-6 md:hidden" />
      </div> */}
      {/* <Suspense fallback={<ShiftSkeleton />}>
        <CurrentShift user={user} />
      </Suspense> */}

      <DataTableKodixCare user={user} />
    </main>
  );
}
