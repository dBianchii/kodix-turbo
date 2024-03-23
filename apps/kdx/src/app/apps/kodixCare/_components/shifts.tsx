"use client";

import { formatRelative } from "date-fns";
import { HiUserCircle } from "react-icons/hi";
import { IoMdTime } from "react-icons/io";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Badge } from "@kdx/ui/badge";
import { Label } from "@kdx/ui/label";

import { api } from "~/trpc/react";
import { ToggleShiftButton } from "./toggle-shift-button";

export function CurrentShiftClient({
  session,
  initialCurrentShift,
}: {
  session: Session;
  initialCurrentShift: RouterOutputs["app"]["kodixCare"]["getCurrentShift"];
}) {
  const query = api.app.kodixCare.getCurrentShift.useQuery(undefined, {
    initialData: initialCurrentShift,
    refetchOnMount: false,
  });
  //se nao tiver shift é pq nao tem nenhum historico de shift.
  //Se tiver shift mas nao tiver shiftEndedAt é pq o shift ta em progresso
  //Se tiver shift e tiver shiftEndedAt é pq o shift acabou
  if (!query.data) return <NoPreviousShift session={session} />;
  if (!query.data.checkOut)
    return <ShiftInProgress currentShift={query.data} session={session} />;
  return <ShiftCheckedOut currentShift={query.data} session={session} />;
}

export function NoPreviousShift({ session }: { session: Session }) {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex flex-row items-center">
        <h2 className="font-semibold leading-none tracking-tight">
          Current Shift
        </h2>
      </div>
      <div className="flex items-center space-x-2 rounded-md">
        <HiUserCircle className="size-5" />
        <p className="text-sm text-muted-foreground">No shift started yet</p>
      </div>
      <ToggleShiftButton session={session} />
    </div>
  );
}

export function ShiftInProgress({
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
          className="size-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <p className="text-sm text-muted-foreground">
          {currentShift.Caregiver.name}
        </p>
      </div>
      <ToggleShiftButton session={session} />
    </div>
  );
}

export function ShiftCheckedOut({
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
          className="mt-2 size-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <p className="text-sm text-muted-foreground">
          {currentShift.Caregiver.name}
        </p>
      </div>
      <ToggleShiftButton session={session} />
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
