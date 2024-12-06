"use client";

import type { EventPropGetter, View } from "react-big-calendar";
import type { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { LuLock } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { getErrorMessage } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./rbc-styles.css";

import { useLocale } from "next-intl";

import { useDebounce } from "@kdx/ui/hooks/use-debounce";
import { toast } from "@kdx/ui/toast";

import { CreateShiftCredenzaButton } from "./create-care-shift-credenza";
import { EditCareShiftCredenza } from "./edit-care-shift-credenza";
import { useCareShiftsData, useEditCareShift } from "./hooks";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = dayjsLocalizer(dayjs);

interface ShiftEvent {
  finishedByUserId: null | string;
  id: string;
  title: string;
  start: Date;
  caregiverId: string;
  end: Date;
  Caregiver: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number]["Caregiver"];
  image?: string;
}

const useSelectEvent = ({
  careShiftsData,
}: {
  careShiftsData:
    | RouterOutputs["app"]["kodixCare"]["getAllCareShifts"]
    | undefined;
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = useMemo(
    () => careShiftsData?.find((shift) => shift.id === selectedEventId),
    [careShiftsData, selectedEventId],
  );
  const delayed = useDebounce(selectedEvent, 125); //Hack. There was a bug that caused this to be fired if edit is open
  return { selectedEvent, setSelectedEventId, delayed };
};

export function ShiftsBigCalendar({
  user,
  myRoles,
  initialShifts,
  careGivers,
}: {
  user: User;
  myRoles: RouterOutputs["team"]["appRole"]["getMyRoles"];
  initialShifts: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"];
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const [open, setOpen] = useState<
    { preselectedStart: Date; preselectedEnd: Date } | boolean
  >(false);
  const [view, setView] = useState<View>("day");

  const [selectedDate, setSelectedDate] = useState(new Date());

  const t = useTranslations();
  const locale = useLocale();

  const query = useCareShiftsData(initialShifts);
  const mutation = useEditCareShift();

  const { selectedEvent, setSelectedEventId, delayed } = useSelectEvent({
    careShiftsData: query.data,
  });

  const handleEventChange = useCallback(
    (args: EventInteractionArgs<ShiftEvent>) => {
      const old = query.data.find((shift) => shift.id === args.event.id);
      const overlappingShifts = query.data.filter(
        (shift) =>
          shift.id !== args.event.id &&
          dayjs(shift.startAt).isBefore(dayjs(args.end)) &&
          dayjs(shift.endAt).isAfter(dayjs(args.start)),
      );

      if (
        overlappingShifts.some(
          (shift) => shift.caregiverId === args.event.caregiverId,
        )
      )
        return toast.error(
          t("api.This caregiver already has a shift at this time"),
        );

      if (
        old?.startAt.getTime() !== dayjs(args.start).toDate().getTime() ||
        old.endAt.getTime() !== dayjs(args.end).toDate().getTime()
      )
        toast.promise(
          mutation.mutateAsync({
            id: args.event.id,
            startAt: dayjs(args.start).toDate(),
            endAt: dayjs(args.end).toDate(),
          }),
          {
            loading: t("Updating"),
            success: t("Updated"),
            error: getErrorMessage,
          },
        );
      return args;
    },
    [query.data, mutation, t],
  );

  const calendarEvents = useMemo(
    () =>
      query.data.map(
        (shift) =>
          ({
            ...shift,
            id: shift.id,
            title: shift.Caregiver.name,
            image: shift.Caregiver.image,
            start: dayjs(shift.startAt).toDate(),
            end: dayjs(shift.endAt).toDate(),
          }) as ShiftEvent,
      ),
    [query.data],
  );

  return (
    <>
      {selectedEvent && (
        <EditCareShiftCredenza
          careGivers={careGivers}
          myRoles={myRoles}
          careShift={selectedEvent}
          setCareShift={setSelectedEventId}
          user={user}
        />
      )}
      <div>
        <CreateShiftCredenzaButton open={open} setOpen={setOpen} user={user} />
      </div>
      <div className="mt-4">
        {/* @ts-expect-error REACT19 INCOMPATIVILITY */}
        <DnDCalendar
          // @ts-expect-error react big calendar typesafety sucks
          eventPropGetter={
            ((event) => {
              if (view === "agenda") return {}; // No need to colorize in agenda view

              // Base color generation logic remains the same
              const baseBackgroundColor =
                "#" +
                ((parseInt(event.caregiverId, 36) & 0x7f7f7f) + 0x606060)
                  .toString(16)
                  .padStart(6, "0");

              // Function to desaturate color if event is finished
              const adjustColorSaturation = (
                color: string,
                finishedByUserId: string | null,
              ) => {
                if (!finishedByUserId) return color;

                // Convert hex to RGB
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                // Desaturate by mixing with gray
                const grayLevel = 200; // Adjust this value to control desaturation intensity
                const desaturatedR = Math.round((r + grayLevel) / 2);
                const desaturatedG = Math.round((g + grayLevel) / 2);
                const desaturatedB = Math.round((b + grayLevel) / 2);

                // Convert back to hex
                return `#${desaturatedR.toString(16).padStart(2, "0")}${desaturatedG.toString(16).padStart(2, "0")}${desaturatedB.toString(16).padStart(2, "0")}`;
              };

              return {
                style: {
                  backgroundColor: adjustColorSaturation(
                    baseBackgroundColor,
                    event.finishedByUserId,
                  ),
                },
              };
            }) as EventPropGetter<ShiftEvent>
          }
          messages={{
            allDay: "Dia Inteiro",
            previous: "<",
            next: ">",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            showMore: (total: number) => `+ (${total}) Eventos`,
          }}
          scrollToTime={new Date()} // Scroll to current time
          culture={locale}
          localizer={localizer}
          style={{ height: 580, width: "100%" }}
          view={view}
          views={["month", "week", "day", "agenda"]}
          onView={setView}
          events={calendarEvents}
          components={{
            // @ts-expect-error react big calendar typesafety sucks
            event: ({ event }: { event: ShiftEvent }) => (
              <div className="flex items-center gap-2 pl-3">
                {event.finishedByUserId && <LuLock />}
                <AvatarWrapper
                  className="pointer-events-none size-5"
                  src={event.image ?? ""}
                  fallback={event.Caregiver.name}
                />
                <span className="text-sm text-primary-foreground">
                  {event.title}
                </span>
              </div>
            ),
          }}
          date={selectedDate}
          onNavigate={setSelectedDate}
          // @ts-expect-error react big calendar typesafety sucks
          onEventDrop={handleEventChange}
          // @ts-expect-error react big calendar typesafety sucks
          onEventResize={handleEventChange}
          onSelectSlot={(date) => {
            if (delayed) return; //! Hack. There was a bug that caused this to be fired if edit is open
            setOpen({
              preselectedStart: date.start,
              preselectedEnd: date.end,
            });
          }}
          draggableAccessor={() => true}
          // @ts-expect-error react big calendar typesafety sucks
          onSelectEvent={(event: ShiftEvent) => setSelectedEventId(event.id)}
          selectable
          resizable
        />
      </div>
    </>
  );
}
