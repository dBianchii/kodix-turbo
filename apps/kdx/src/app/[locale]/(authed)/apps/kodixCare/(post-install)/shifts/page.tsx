import { Suspense } from "react";

import { kodixCareAppId } from "@kdx/shared";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { HydrateClient, prefetch, trpc, trpcCaller } from "~/trpc/server";
import ShiftsBigCalendar from "./_components/cc-shifts-big-calendar";

export default async function ShiftsPage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
  });

  prefetch(trpc.app.kodixCare.getAllCareShifts.queryOptions());
  const careGiversPromise = trpcCaller.app.kodixCare.getAllCaregivers();
  const myRolesPromise = trpcCaller.team.appRole.getMyRoles({
    appId: kodixCareAppId,
  });

  return (
    <main className="pt-4 md:p-4">
      <HydrateClient>
        <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}>
          <ShiftsBigCalendar
            user={user}
            myRoles={myRolesPromise}
            careGivers={careGiversPromise}
          />
        </Suspense>
      </HydrateClient>
    </main>
  );
}
