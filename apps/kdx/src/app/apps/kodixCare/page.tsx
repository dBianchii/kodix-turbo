import { Suspense } from "react";
import { format, formatRelative, subDays } from "date-fns";
import { HiUserCircle } from "react-icons/hi";
import { IoMdTime } from "react-icons/io";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { prisma } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Badge } from "@kdx/ui/badge";
import { Label } from "@kdx/ui/label";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import KodixCareTable from "./_components/kodix-care-table";
import { ToggleShiftButton } from "./_components/toggle-shift-button";

export const dynamic = "force-dynamic"; //TODO: help me
export default async function KodixCare() {
  const session = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    prisma,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex w-full max-w-60 flex-col">
          <Suspense fallback={<ShiftSkeleton />}>
            <CurrentShift session={session} />
          </Suspense>
        </div>
        <div className="w-full">
          <KodixCareTable />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

async function CurrentShift({ session }: { session: Session }) {
  const currentShift = await api.app.kodixCare.getCurrentShift();

  //se nao tiver shift é pq nao tem nenhum historico de shift.
  //Se tiver shift mas nao tiver shiftEndedAt é pq o shift ta em progresso
  //Se tiver shift e tiver shiftEndedAt é pq o shift acabou
  if (!currentShift)
    return <NoPreviousShift currentShift={currentShift} session={session} />;
  if (!currentShift.checkOut)
    return <ShiftInProgress currentShift={currentShift} session={session} />;
  return <ShiftCheckedOut currentShift={currentShift} session={session} />;
}

function NoPreviousShift({
  session,
  currentShift,
}: {
  session: Session;
  currentShift: RouterOutputs["app"]["kodixCare"]["getCurrentShift"];
}) {
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
      <ToggleShiftButton currentShift={currentShift} session={session} />
    </div>
  );
}

function ShiftInProgress({
  session,
  currentShift,
}: {
  session: Session;
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex flex-row items-center space-x-3">
        <h2 className="font-semibold leading-none tracking-tight">
          Current Shift
        </h2>
        <Badge variant={"green"}>Active</Badge>
      </div>
      <TimeInfo currentShift={currentShift} />
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
      <ToggleShiftButton currentShift={currentShift} session={session} />
    </div>
  );
}

function ShiftCheckedOut({
  session,
  currentShift,
}: {
  session: Session;
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex flex-row items-center space-x-3">
        <h2 className="font-semibold leading-none tracking-tight">
          Current shift
        </h2>
        <Badge variant={"secondary"}>Ended</Badge>
      </div>
      <TimeInfo currentShift={currentShift} />
      <div className="flex items-center space-x-2 rounded-md">
        <AvatarWrapper
          className="mt-2 h-5 w-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <p className="text-sm text-muted-foreground">
          {currentShift.Caregiver.name}
        </p>
      </div>
      <ToggleShiftButton currentShift={currentShift} session={session} />
    </div>
  );
}

function TimeInfo({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  return (
    <div className="flex items-center justify-start">
      {(currentShift.checkIn ?? currentShift.checkOut) && (
        <div className="col mr-4">
          <Label className="invisible text-xs text-muted-foreground">i</Label>
          <IoMdTime className="" />
        </div>
      )}
      {currentShift.checkIn && (
        <div className="col mr-6 w-20">
          <Label className="text-xs text-muted-foreground" htmlFor="startbadge">
            Start
          </Label>
          <Badge
            id="startbadge"
            variant={"outline"}
            className="w-24 py-0 text-center text-xs text-muted-foreground"
          >
            {formatRelative(currentShift.checkIn, new Date())}
          </Badge>
        </div>
      )}
      {currentShift.checkOut && (
        <div className="col w-20">
          <Label className="text-xs text-muted-foreground" htmlFor="endBadge">
            End
          </Label>
          <Badge
            id="endBadge"
            variant={"outline"}
            className="w-24 py-0 text-center text-xs text-muted-foreground"
          >
            {formatRelative(currentShift.checkOut, new Date())}
          </Badge>
        </div>
      )}
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
