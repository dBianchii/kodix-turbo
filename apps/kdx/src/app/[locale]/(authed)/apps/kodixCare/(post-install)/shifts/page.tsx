import { Suspense } from "react";

import { kodixCareAppId } from "@kdx/shared";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import { ShiftsBigCalendar } from "./_components/shifts-big-calendar";

export default async function ShiftsPage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
  });
  const initialShiftsPromise = api.app.kodixCare.getAllCareShifts();
  const careGiversPromise = api.app.kodixCare.getAllCaregivers();
  const myRolesPromise = api.team.appRole.getMyRoles({
    appId: kodixCareAppId,
  });

  return (
    <main className="pt-4 md:p-4">
      <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}>
        <ShiftsBigCalendar
          user={user}
          myRoles={myRolesPromise}
          initialShifts={initialShiftsPromise}
          careGivers={careGiversPromise}
        />
      </Suspense>
    </main>
  );
}
