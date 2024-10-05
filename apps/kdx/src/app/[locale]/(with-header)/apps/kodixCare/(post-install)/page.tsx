import { Suspense } from "react";

import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { kodixCareAppId } from "@kdx/shared";
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
                columnCount={4}
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
    <div className="flex flex-col space-y-3">
      <div className="flex flex-row items-center">
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="flex items-center space-x-2 rounded-md">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
