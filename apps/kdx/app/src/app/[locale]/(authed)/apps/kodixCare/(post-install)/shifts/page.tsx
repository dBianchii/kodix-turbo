import { Suspense } from "react";
import { kodixCareAppId } from "@kodix/shared/db";
import { HydrateClient, prefetch } from "@kodix/trpc/react/server";
import { DataTableSkeleton } from "@kodix/ui/data-table/data-table-skeleton";

import { trpc, trpcCaller } from "@kdx/api/trpc/react/server";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/server-helpers";

import ShiftsBigCalendar from "./_components/cc-shifts-big-calendar";

export default async function ShiftsPage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
  });

  prefetch(trpc.app.kodixCare.getAllCareShifts.queryOptions());
  const careGiversPromise = trpcCaller.app.kodixCare.getAllCaregivers();

  return (
    <main className="pt-4 md:p-4">
      <HydrateClient>
        <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}>
          <ShiftsBigCalendar careGivers={careGiversPromise} user={user} />
        </Suspense>
      </HydrateClient>
    </main>
  );
}
