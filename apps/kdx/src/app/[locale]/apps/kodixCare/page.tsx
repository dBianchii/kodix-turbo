import { Suspense } from "react";
import { redirect } from "next/navigation";

import type { Session } from "@kdx/auth";
import { auth } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { getI18n } from "@kdx/locales/server";
import { kodixCareAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { Skeleton } from "@kdx/ui/skeleton";
import { H1 } from "@kdx/ui/typography";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import { IconKodixApp } from "../../_components/app/kodix-icon";
import DataTableKodixCare from "./_components/data-table-kodix-care";
import { CurrentShiftClient } from "./_components/shifts";

export default async function KodixCarePage() {
  const session = await auth();
  if (!session) redirect("/");

  const completed = await api.app.kodixCare.onboardingCompleted();
  if (!completed) {
    redirect("/apps/kodixCare/onboarding");
  }
  const t = await getI18n();
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
            <CurrentShift session={session} />
          </Suspense>
        </div>
        <div className="w-full">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-4 px-4">
                <Skeleton className="h-8 w-60" />
                <div className="mt-4 flex w-full flex-col gap-2">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              </div>
            }
          >
            <KodixCareTable session={session} />
          </Suspense>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

async function KodixCareTable({ session }: { session: Session }) {
  const input = {
    dateStart: dayjs.utc().startOf("day").toDate(),
    dateEnd: dayjs.utc().endOf("day").toDate(),
  };
  const initialCareTasks = await api.app.kodixCare.getCareTasks(input);
  return (
    <DataTableKodixCare
      initialCareTasks={initialCareTasks}
      initialInput={input}
      session={session}
    />
  );
}

async function CurrentShift({ session }: { session: Session }) {
  const initialCurrentShift = await api.app.kodixCare.getCurrentShift();

  return (
    <CurrentShiftClient
      initialCurrentShift={initialCurrentShift}
      session={session}
    />
  );
}

async function ShiftSkeleton() {
  const t = await getI18n();
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <h2 className="font-semibold leading-none tracking-tight">
        {t("apps.kodixCare.currentShift")}
      </h2>
    </div>
  );
}
