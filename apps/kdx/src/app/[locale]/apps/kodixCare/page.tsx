import { Suspense } from "react";
import { redirect } from "next/navigation";

import type { Session } from "@kdx/auth";
import { auth } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { getI18n } from "@kdx/locales/server";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import DataTableKodixCare from "./_components/data-table-kodix-care";
import { CurrentShiftClient } from "./_components/shifts";

export default async function KodixCarePage() {
  const session = await auth();
  if (!session) redirect("/");

  const completed = await api.app.kodixCare.onboardingCompleted();
  if (!completed) {
    redirect("/apps/kodixCare/onboarding");
  }

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex w-full max-w-60 flex-col">
          <Suspense fallback={<ShiftSkeleton />}>
            <CurrentShift session={session} />
          </Suspense>
        </div>
        <div className="w-full">
          <Suspense fallback={<>Loading...</>}>
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
