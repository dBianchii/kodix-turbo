import { Suspense } from "react";
import { redirect } from "next/navigation";

import type { Session } from "@kdx/auth";
import { auth } from "@kdx/auth";
import dayjs from "@kdx/dayjs";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api, HydrateClient } from "~/trpc/server";
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
    dateEnd: dayjs.utc().endOf("day").toDate(),
  };

  await api.app.kodixCare.getCareTasks(input);
  return (
    <HydrateClient>
      <DataTableKodixCare input={input} />
    </HydrateClient>
  );
}

async function CurrentShift({ session }: { session: Session }) {
  await api.app.kodixCare.getCurrentShift();

  return (
    <HydrateClient>
      <CurrentShiftClient session={session} />;
    </HydrateClient>
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
