import { Suspense } from "react";
import { LuMenu } from "react-icons/lu";

import type { User } from "@kdx/auth";
import { kodixCareAppId } from "@kdx/shared";
import { Card } from "@kdx/ui/card";
import { SidebarTrigger } from "@kdx/ui/sidebar";
import { Skeleton } from "@kdx/ui/skeleton";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import DataTableKodixCare from "./_components/data-table-kodix-care";
import { CurrentShiftClient } from "./_components/shifts";

export default async function KodixCarePage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <main className="flex w-full flex-col items-center gap-6 pt-6 md:flex-row md:items-baseline md:gap-1 md:space-x-6 md:pl-5">
      {/* <div className="flex w-full items-start border-b md:hidden">
        <SidebarTrigger className="size-6 md:hidden" />
      </div> */}
      <Suspense fallback={<ShiftSkeleton />}>
        <CurrentShift user={user} />
      </Suspense>
      <div className="flex w-full flex-col">
        <DataTableKodixCare />
      </div>
    </main>
  );
}

async function CurrentShift({ user }: { user: User }) {
  const initialCurrentShift = await api.app.kodixCare.getCurrentShift();

  return (
    <CurrentShiftClient initialCurrentShift={initialCurrentShift} user={user} />
  );
}

function ShiftSkeleton() {
  return (
    <Card className="flex h-48 flex-col items-center gap-3 p-4 md:min-w-72">
      <Skeleton className="h-full w-full" />
      <Skeleton className="invisible h-full w-full" />
      <Skeleton className="h-full w-2/3" />
      <Skeleton className="h-full w-full" />
    </Card>
  );
}
