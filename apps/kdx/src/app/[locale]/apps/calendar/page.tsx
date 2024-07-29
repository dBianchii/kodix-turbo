import { Suspense } from "react";

import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { getTranslations } from "@kdx/locales/server";
import { calendarAppId } from "@kdx/shared";
import { DataTableSkeleton } from "@kdx/ui/data-table/data-table-skeleton";
import { Separator } from "@kdx/ui/separator";
import { Skeleton } from "@kdx/ui/skeleton";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import { CreateEventDialogButton } from "./_components/create-event-dialog";
import { DataTable } from "./_components/data-table-calendar";

export default async function CalendarPage() {
  const user = await redirectIfAppNotInstalled({
    appId: calendarAppId,
  });

  //date Start should be the beginninig of the day
  //date End should be the end of the day

  const t = await getTranslations();
  return (
    <MaxWidthWrapper>
      <div className="flex items-center space-x-4">
        <IconKodixApp appId={calendarAppId} renderText={false} />
        <H1>{t("Calendar")}</H1>
      </div>
      <Separator className="my-4" />

      <CreateEventDialogButton />
      <Suspense
        fallback={
          <div className="pt-8">
            <div className="flex justify-between">
              <div className="flex w-44">
                <Skeleton className="h-6 w-28" />
              </div>

              <div className="mx-auto mt-auto flex space-x-2">
                <Skeleton className="size-6" />

                <Skeleton className="h-6 w-28" />
                <Skeleton className="size-6" />
              </div>
              <div className="flex w-44">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            <div className="mt-4 rounded-md border">
              <DataTableSkeleton columnCount={3} showViewOptions={false} />
            </div>
          </div>
        }
      >
        <DataTableServer user={user} />
      </Suspense>
    </MaxWidthWrapper>
  );
}

async function DataTableServer({ user }: { user: User }) {
  const initialInput = {
    dateStart: dayjs.utc().startOf("day").toDate(),
    dateEnd: dayjs.utc().endOf("day").toDate(),
  };
  const initialData = await api.app.calendar.getAll(initialInput);

  return <DataTable data={initialData} user={user} />;
}
