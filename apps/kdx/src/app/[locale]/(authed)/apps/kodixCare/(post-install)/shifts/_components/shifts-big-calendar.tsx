"use client";

import type { EventPropGetter, View } from "react-big-calendar";
import type { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { use, useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { LuLock } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./rbc-styles.css";

import { useLocale } from "next-intl";

import type { Locales } from "@kdx/locales";
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

export default function ShiftsBigCalendar({
  user,
  careGivers,
}: {
  user: User;
  careGivers: Promise<RouterOutputs["app"]["kodixCare"]["getAllCaregivers"]>;
}) {
  const [open, setOpen] = useState<
    { preselectedStart: Date; preselectedEnd: Date } | boolean
  >(false);
  const [view, setView] = useState<View>("day");

  const [selectedDate, setSelectedDate] = useState(new Date());

  const t = useTranslations();
  const locale = useLocale() as Locales;

  const query = useCareShiftsData();
  const { mutate } = useEditCareShift();

  const { selectedEvent, setSelectedEventId, delayed } = useSelectEvent({
    careShiftsData: query.data,
  });

  const handleEventChange = useCallback(
    (args: EventInteractionArgs<ShiftEvent>) => {
      if (!query.data) return;

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
        mutate({
          id: args.event.id,
          startAt: dayjs(args.start).toDate(),
          endAt: dayjs(args.end).toDate(),
        });

      return args;
    },
    [query.data, mutate, t],
  );

  const calendarEvents = useMemo(
    () =>
      query.data?.map(
        (shift) =>
          ({
            ...shift,
            id: shift.id,
            title: shift.Caregiver.name,
            image: shift.Caregiver.image,
            start: dayjs(shift.startAt).toDate(),
            end: dayjs(shift.endAt).toDate(),
          }) as ShiftEvent,
      ) ?? [],
    [query.data],
  );

  return (
    <>
      {selectedEvent && (
        <EditCareShiftCredenza
          careGivers={use(careGivers)}
          careShift={selectedEvent}
          setCareShift={setSelectedEventId}
          user={user}
        />
      )}
      <div>
        <CreateShiftCredenzaButton open={open} setOpen={setOpen} user={user} />
      </div>
      <div className="mt-4">
        <DnDCalendar
          // @ts-expect-error react big calendar typesafety sucks
          eventPropGetter={
            ((event) => {
              if (view === "agenda") return {}; // No need to colorize in agenda view

              const baseBackgroundColor =
                "#" +
                ((parseInt(event.caregiverId, 36) & 0x8f8f8f) + 0x303030)
                  .toString(16)
                  .padStart(6, "0");

              // Function to lightly desaturate color if event is finished
              const adjustColorSaturation = (
                color: string,
                mixStrength: number,
              ) => {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                const grayLevel = 220;
                const desaturatedR = Math.round(
                  r * (1 - mixStrength) + grayLevel * mixStrength,
                );
                const desaturatedG = Math.round(
                  g * (1 - mixStrength) + grayLevel * mixStrength,
                );
                const desaturatedB = Math.round(
                  b * (1 - mixStrength) + grayLevel * mixStrength,
                );

                return `#${desaturatedR.toString(16).padStart(2, "0")}${desaturatedG.toString(16).padStart(2, "0")}${desaturatedB.toString(16).padStart(2, "0")}`;
              };

              const maybeDesaturatedColor = event.finishedByUserId
                ? adjustColorSaturation(baseBackgroundColor, 0.5) // Less aggressive desaturation
                : baseBackgroundColor;

              return {
                style: {
                  backgroundColor: maybeDesaturatedColor,
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
          style={{ height: 630, width: "100%" }}
          view={view}
          views={["month", "week", "day", "agenda"]}
          onView={setView}
          events={calendarEvents}
          components={{
            // @ts-expect-error react big calendar typesafety sucks
            // eslint-disable-next-line react/no-unused-prop-types
            event: ({ event }: { event: ShiftEvent }) => (
              <div className="flex items-center gap-2 pl-3">
                {event.finishedByUserId && <LuLock />}
                <AvatarWrapper
                  className="pointer-events-none size-5"
                  src={event.image ?? ""}
                  fallback={event.Caregiver.name}
                />
                <span className="text-primary-foreground text-sm">
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
