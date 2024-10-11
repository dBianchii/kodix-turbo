import { Suspense } from "react";

import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { kodixCareAppId } from "@kdx/shared";
import { Card } from "@kdx/ui/card";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
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
    <main className="flex w-full flex-col gap-4 pt-6 md:space-x-6 md:pl-5">
      <div className="flex flex-col gap-6 md:flex-row">
        <Suspense fallback={<ShiftSkeleton />}>
          <CurrentShift user={user} />
        </Suspense>
        <div className="flex w-full flex-col">
          <Suspense
            fallback={
              <DataTableSkeleton
                className="mt-4"
                columnCount={5}
                rowCount={2}
                withPagination={false}
              />
            }
          >
            <KodixCareTable />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function KodixCareTable() {
  const input = {
    dateStart: dayjs.utc().startOf("day").toDate(),
    dateEnd: dayjs.utc().endOf("day").toDate(),
  };
  const initialCareTasks = await api.app.kodixCare.getCareTasks(input);
  return (
    <DataTableKodixCare
      initialCareTasks={initialCareTasks}
      initialInput={input}
    />
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
