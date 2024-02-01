import { Suspense } from "react";
import { HiUserCircle } from "react-icons/hi";

import type { RouterOutputs } from "@kdx/api";
import dayjs from "@kdx/dayjs";
import { prisma } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Badge } from "@kdx/ui/badge";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import KodixCareTable from "./_components/kodix-care-table";
import StartShiftButton from "./_components/start-shift-button";

export const dynamic = "force-dynamic"; //TODO: help me
export default async function KodixCare() {
  await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    prisma,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex w-full max-w-60 flex-col">
          <Suspense fallback={<ShiftSkeleton />}>
            <CurrentShift />
          </Suspense>
        </div>
        <div className="w-full">
          <KodixCareTable />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

async function CurrentShift() {
  const currentShift = await api.app.kodixCare.getCurrentShift();

  //se nao tiver shift é pq nao tem nenhum historico de shift.
  //Se tiver shift mas nao tiver shiftEndedAt é pq o shift ta em progresso
  //Se tiver shift e tiver shiftEndedAt é pq o shift acabou
  if (!currentShift) return <NoPreviousShift />;
  if (!currentShift.shiftEndedAt)
    return <ShiftInProgress currentShift={currentShift} />;
  return <ShiftEnded currentShift={currentShift} />;
}

function NoPreviousShift() {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex flex-row items-center">
        <h2 className="font-semibold leading-none tracking-tight">
          Current Shift
        </h2>
      </div>
      <div className="flex items-center space-x-2 rounded-md">
        <HiUserCircle className="h-5 w-5" />
        <p className="text-sm text-muted-foreground">No shift started yet</p>
      </div>
      <StartShiftButton />
    </div>
  );
}

function ShiftInProgress({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex flex-row items-center">
        <h2 className="font-semibold leading-none tracking-tight">
          Current Shift
        </h2>
      </div>
      <div className="flex items-center space-x-2 rounded-md">
        <AvatarWrapper
          className="h-5 w-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <p className="text-sm text-muted-foreground">
          {currentShift.Caregiver.name}
        </p>
      </div>
      <StartShiftButton />
    </div>
  );
}

function ShiftEnded({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex flex-row items-center">
        <h2 className="font-semibold leading-none tracking-tight">
          Previous shift
        </h2>
        <Badge className="ml-2" variant={"secondary"}>
          Ended
        </Badge>
      </div>
      <div className="flex items-center space-x-2 rounded-md">
        <AvatarWrapper
          className="h-5 w-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <div className="col">
          <p className="text-sm text-muted-foreground">
            {dayjs(currentShift.checkIn).format("DD/MM/YYYY HH:mm")}
          </p>
          {currentShift.checkOut && (
            <p className="text-sm text-muted-foreground">
              {" - " && dayjs(currentShift.checkOut).format("DD/MM/YYYY HH:mm")}
            </p>
          )}
        </div>
      </div>
      <StartShiftButton>Start new shift</StartShiftButton>
    </div>
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
