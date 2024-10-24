"use client";

import { HiUserCircle } from "react-icons/hi";
import { IoMdTime } from "react-icons/io";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import type { DateTimeFormatOptions } from "@kdx/locales/next-intl";
import { useFormatter } from "@kdx/locales/next-intl";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Badge } from "@kdx/ui/badge";
import { Card } from "@kdx/ui/card";
import { useRerenderForRelativeTime } from "@kdx/ui/hooks/use-rerender-for-relative-time";
import { Label } from "@kdx/ui/label";

import { api } from "~/trpc/react";
import { ToggleShiftButton } from "./toggle-shift-button";

export function CurrentShiftClient({
  user,
  initialCurrentShift,
}: {
  user: User;
  initialCurrentShift: RouterOutputs["app"]["kodixCare"]["getCurrentShift"];
}) {
  const query = api.app.kodixCare.getCurrentShift.useQuery(undefined, {
    initialData: initialCurrentShift,
    refetchOnMount: false,
  });
  //se nao tiver shift é pq nao tem nenhum historico de shift.
  //Se tiver shift mas nao tiver shiftEndedAt é pq o shift ta em progresso
  //Se tiver shift e tiver shiftEndedAt é pq o shift acabou
  if (!query.data) return <NoPreviousShift user={user} />;
  if (!query.data.checkOut)
    return <ShiftInProgress currentShift={query.data} user={user} />;
  return <ShiftCheckedOut currentShift={query.data} user={user} />;
}

export function NoPreviousShift({ user }: { user: User }) {
  const t = useTranslations();

  return (
    <Card className="flex h-52 w-80 max-w-xs flex-col gap-3 p-4 md:w-full md:min-w-72">
      <div className="flex flex-row items-center justify-center space-x-3">
        <h2 className="font-semibold leading-none tracking-tight">
          {t("apps.kodixCare.currentShift")}
        </h2>
      </div>
      <div className="my-auto flex flex-col gap-4">
        <div className="flex items-center justify-center space-x-2 rounded-md">
          <HiUserCircle className="size-5" />
          <p className="text-sm text-muted-foreground">
            {t("No shift started yet")}
          </p>
        </div>
        <ToggleShiftButton user={user} />
      </div>
    </Card>
  );
}

export function ShiftInProgress({
  user,
  currentShift,
}: {
  user: User;
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const t = useTranslations();
  return (
    <Card className="flex h-52 w-80 max-w-xs flex-col gap-3 p-4 md:w-full md:min-w-72">
      <div className="flex flex-row items-center justify-center space-x-3">
        <h2 className="font-semibold leading-none tracking-tight">
          {t("apps.kodixCare.currentShift")}
        </h2>
        <Badge variant={"green"}>{t("Active")}</Badge>
      </div>
      <TimeInfo currentShift={currentShift} />
      <div className="flex items-center justify-center space-x-2 rounded-md">
        <AvatarWrapper
          className="size-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <p className="text-sm text-muted-foreground">
          {currentShift.Caregiver.name}
        </p>
      </div>
      <ToggleShiftButton user={user} />
    </Card>
  );
}

export function ShiftCheckedOut({
  user,
  currentShift,
}: {
  user: User;
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const t = useTranslations();
  return (
    <Card className="flex h-52 w-80 max-w-xs flex-col gap-3 p-4 md:w-full md:min-w-72">
      <div className="flex flex-row items-center justify-center space-x-3">
        <h2 className="font-semibold leading-none tracking-tight">
          {t("apps.kodixCare.currentShift")}
        </h2>
        <Badge variant={"secondary"}>{t("Ended")}</Badge>
      </div>
      <TimeInfo currentShift={currentShift} />
      <div className="flex items-center justify-center space-x-2 rounded-md">
        <AvatarWrapper
          className="size-5"
          src={currentShift.Caregiver.image ?? undefined}
          fallback={currentShift.Caregiver.name}
        />
        <p className="text-sm text-muted-foreground">
          {currentShift.Caregiver.name}
        </p>
      </div>
      <ToggleShiftButton user={user} />
    </Card>
  );
}

function TimeInfo({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const timeInfoFormat: DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
  };
  useRerenderForRelativeTime([currentShift.checkIn, currentShift.checkOut]);
  return (
    <div className="flex items-center justify-center">
      <div className="col mr-3">
        <Label className="invisible text-xs text-muted-foreground">i</Label>
        <IoMdTime className="" />
      </div>
      <div className="col mr-6 w-20">
        <Label className="text-xs text-muted-foreground" htmlFor="startbadge">
          {t("Start")}
        </Label>
        <Badge
          id="startbadge"
          variant={"outline"}
          className="w-24 py-0 text-center text-xs text-muted-foreground"
        >
          {format.dateTime(currentShift.checkIn, timeInfoFormat)}
        </Badge>
      </div>
      {currentShift.checkOut && (
        <div className="col w-20">
          <Label className="text-xs text-muted-foreground" htmlFor="endBadge">
            {t("End")}
          </Label>
          <Badge
            id="endBadge"
            variant={"outline"}
            className="w-24 py-0 text-center text-xs text-muted-foreground"
          >
            {format.dateTime(currentShift.checkOut, timeInfoFormat)}
          </Badge>
        </div>
      )}
    </div>
  );
}
