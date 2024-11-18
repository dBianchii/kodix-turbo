import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import type { User } from "@kdx/auth";
import { kodixCareAppId } from "@kdx/shared";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import { ShiftsBigCalendar } from "./_components/shifts-data-table";

export default async function ShiftsPage() {
  const t = await getTranslations();
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
  });

  return (
    <main className="pt-6 md:p-6">
      <h2 className="mb-4 text-lg font-medium">{t("Shifts")}</h2>

      <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}>
        <DataTableCareShiftsServer user={user} />
      </Suspense>
    </main>
  );
}

async function DataTableCareShiftsServer({ user }: { user: User }) {
  const initialShifts = await api.app.kodixCare.getAllCareShifts();
  const careGivers = await api.app.kodixCare.getAllCaregivers();
  const myRoles = await api.team.appRole.getMyRoles({
    appId: kodixCareAppId,
  });
  return (
    <>
      <ShiftsBigCalendar
        myRoles={myRoles}
        user={user}
        initialShifts={initialShifts}
        careGivers={careGivers}
      />
      {/* <DataTableShifts
        myRoles={myRoles}
        user={user}
        initialShifts={initialShifts}
        careGivers={careGivers}
      /> */}
    </>
  );
}
