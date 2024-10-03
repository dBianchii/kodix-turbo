import { Suspense } from "react";

import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { getTranslations } from "@kdx/locales/next-intl/server";
import { kodixCareAppId } from "@kdx/shared";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
import { Separator } from "@kdx/ui/separator";
import { Skeleton } from "@kdx/ui/skeleton";
import { H1 } from "@kdx/ui/typography";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import { IconKodixApp } from "../../_components/app/kodix-icon";
import DataTableKodixCare from "./_components/data-table-kodix-care";
import { CurrentShiftClient } from "./_components/shifts";

export default async function KodixCarePage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  const t = await getTranslations();
  return (
    <MaxWidthWrapper>
      <div className="flex items-center space-x-4">
        <IconKodixApp appId={kodixCareAppId} renderText={false} />
        <H1>{t("Kodix Care")}</H1>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex w-full max-w-full flex-col px-8 pb-8 md:max-w-60 md:px-0">
          <Suspense fallback={<ShiftSkeleton />}>
            <CurrentShift user={user} />
          </Suspense>
        </div>

        <div className="w-full">
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
    </MaxWidthWrapper>
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
