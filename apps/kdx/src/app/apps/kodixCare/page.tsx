import { Suspense } from "react";
import { redirect } from "next/navigation";

import type { Session } from "@kdx/auth";
import { auth } from "@kdx/auth";
import dayjs from "@kdx/dayjs";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import DataTableKodixCare from "./_components/data-table-kodix-care";
import { CurrentShiftClient } from "./_components/shifts";

export const dynamic = "force-dynamic"; //TODO: help me
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
          <Suspense fallback={<ShiftSkeleton />}>
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
    dateEnd: dayjs.utc().add(4, "days").endOf("day").toDate(),
  };

  const initialCareTasks = await api.app.kodixCare.getCareTasks(input);
  return (
    <DataTableKodixCare initialCareTasks={initialCareTasks} input={input} />
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

function ShiftSkeleton() {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <h2 className="font-semibold leading-none tracking-tight">
        Current Shift
      </h2>
    </div>
  );
}
