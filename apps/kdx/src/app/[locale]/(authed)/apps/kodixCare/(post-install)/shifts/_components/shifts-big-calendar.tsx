"use client";

import type { EventPropGetter, View } from "react-big-calendar";
import type { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { LuArrowRight, LuLoader2, LuPlus } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { getErrorMessage, kodixCareRoleDefaultIds } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { DateTimePicker24h } from "@kdx/ui/date-n-time/date-time-picker-24h";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import { ZCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./rbc-styles.css";

import { useLocale } from "next-intl";

import { toast } from "@kdx/ui/toast";

const localizer = dayjsLocalizer(dayjs);

interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  caregiverId: string;
  end: Date;
  Caregiver: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number]["Caregiver"];
  image?: string;
}

const DnDCalendar = withDragAndDrop(Calendar);
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
  const [date, setDate] = useState(new Date());
  const t = useTranslations();
  const locale = useLocale();

  const utils = api.useUtils();
  const query = api.app.kodixCare.getAllCareShifts.useQuery(undefined, {
    initialData: initialShifts,
  });
  const mutation = api.app.kodixCare.editCareShift.useMutation({
    onMutate: async (newShift) => {
      await utils.app.kodixCare.getAllCareShifts.cancel();
      const previousData = utils.app.kodixCare.getAllCareShifts.getData();
      utils.app.kodixCare.getAllCareShifts.setData(undefined, (old) =>
        old?.map((shift) =>
          shift.id === newShift.id
            ? {
                ...shift,
                startAt: newShift.startAt
                  ? new Date(newShift.startAt)
                  : shift.startAt,
                endAt: newShift.endAt ? new Date(newShift.endAt) : shift.endAt,
              }
            : shift,
        ),
      );
      return { previousData };
    },
    onError: (err, _newShift, context) => {
      if (context?.previousData) {
        utils.app.kodixCare.getAllCareShifts.setData(
          undefined,
          context.previousData,
        );
      }
    },
    onSettled: () => {
      void utils.app.kodixCare.getAllCareShifts.invalidate();
    },
  });

  const handleEventChange = (args: EventInteractionArgs<ShiftEvent>) => {
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
  };

  return (
    <>
      <div>
        <CreateShiftCredenzaButton
          open={open}
          setOpen={setOpen}
          careGivers={careGivers}
          user={user}
          myRoles={myRoles}
        />
      </div>
      <div className="mt-4">
        <DnDCalendar
          // @ts-expect-error react big calendar typesafety sucks
          eventPropGetter={
            ((event) => {
              if (view === "agenda") return {}; //No need to colorize in agenda view
              const backgroundColor =
                "#" +
                ((parseInt(event.caregiverId, 36) & 0x7f7f7f) + 0x606060)
                  .toString(16)
                  .padStart(6, "0");
              return {
                style: {
                  backgroundColor: backgroundColor,
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
          culture={locale}
          localizer={localizer}
          style={{ height: 580, width: "100%" }}
          view={view}
          views={["month", "week", "day", "agenda"]}
          onView={setView}
          defaultDate={dayjs().toDate()}
          events={query.data.map(
            (shift) =>
              ({
                ...shift,
                id: shift.id,
                title: shift.Caregiver.name,
                image: shift.Caregiver.image,
                start: dayjs(shift.startAt).toDate(),
                end: dayjs(shift.endAt).toDate(),
              }) as ShiftEvent,
          )}
          components={{
            // @ts-expect-error react big calendar typesafety sucks
            event: ({ event }: { event: ShiftEvent }) => (
              <div className="flex items-center gap-2 pl-3">
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

            // month: {
            //   header: ({ date }) => (
            //     <span>
            //       {format.dateTime(date, {
            //         weekday: "short",
            //       })}
            //     </span>
            //   ),
            // },
            // // @ts-expect-error react big calendar typesafety sucks

            // day: {
            //   header: ({ date }) => (
            //     <div className="flex flex-col items-center gap-2">
            //       <span>{format.dateTime(date, "short")}</span>
            //     </div>
            //   ),
            // },
          }}
          date={date}
          onNavigate={setDate}
          // @ts-expect-error react big calendar typesafety sucks
          onEventDrop={handleEventChange}
          // @ts-expect-error react big calendar typesafety sucks
          onEventResize={handleEventChange}
          onSelectSlot={(date) => {
            setOpen({
              preselectedStart: date.start,
              preselectedEnd: date.end,
            });
          }}
          draggableAccessor={() => true}
          selectable
          resizable
        />
      </div>
    </>
  );
}

function CreateShiftCredenzaButton({
  open,
  setOpen,
  user,
  myRoles,
  careGivers,
}: {
  open: { preselectedStart: Date; preselectedEnd: Date } | boolean;
  setOpen: (
    isOpen: { preselectedStart: Date; preselectedEnd: Date } | boolean,
  ) => void;
  user: User;
  myRoles: RouterOutputs["team"]["appRole"]["getMyRoles"];
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const [warnOverlappingShiftsOpen, setWarnOverlappingShiftsOpen] =
    useState(false);

  const shouldAutoSelectMyself =
    !myRoles.some(
      (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
    ) &&
    myRoles.some(
      (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.careGiver,
    );

  const utils = api.useUtils();
  const t = useTranslations();

  const form = useForm({
    schema: ZCreateCareShiftInputSchema(t),
    defaultValues: {
      careGiverId: shouldAutoSelectMyself ? user.id : undefined,
    },
  });

  useEffect(() => {
    if (typeof open === "object") {
      form.setValue("startAt", open.preselectedStart);
      form.setValue("endAt", open.preselectedEnd);
    }
  }, [open, form]);

  const mutation = api.app.kodixCare.createCareShift.useMutation({
    onError: trpcErrorToastDefault,
    onSettled: () => {
      void utils.app.kodixCare.getAllCareShifts.invalidate();
    },
    onSuccess: () => {
      setOpen(false);
    },
  });

  const findOverlappingShiftsQuery =
    api.app.kodixCare.findOverlappingShifts.useQuery(
      {
        start: form.watch("startAt"),
        end: form.watch("endAt"),
      },
      {
        enabled:
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          !!form.getValues("startAt") &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          !!form.getValues("endAt") &&
          dayjs(form.getValues("startAt")).isBefore(
            dayjs(form.getValues("endAt")),
          ),
      },
    );

  return (
    <Credenza
      open={!!open}
      onOpenChange={(open) => {
        form.reset();
        setOpen(open);
      }}
    >
      <CredenzaTrigger asChild>
        <Button size={"sm"}>
          <LuPlus className="mr-2" />
          {t("apps.kodixCare.Create shift")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-[750px]">
        {findOverlappingShiftsQuery.data && (
          <WarnOverlappingShifts
            isSubmitting={mutation.isPending}
            overlaps={findOverlappingShiftsQuery.data}
            onClickConfirm={() => {
              void form.handleSubmit((values) => mutation.mutate(values))();
            }}
            open={warnOverlappingShiftsOpen}
            setOpen={setWarnOverlappingShiftsOpen}
          />
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              let overlappingShiftsData = findOverlappingShiftsQuery.data;

              if (!overlappingShiftsData) {
                const { data } = await findOverlappingShiftsQuery.refetch();
                overlappingShiftsData = data;
              }
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const overlappingShifts = overlappingShiftsData!.filter(
                (shift) =>
                  dayjs(shift.startAt).isBefore(dayjs(values.endAt)) &&
                  dayjs(shift.endAt).isAfter(dayjs(values.startAt)),
              );

              if (
                overlappingShifts.some(
                  (shift) => shift.Caregiver.id === values.careGiverId,
                )
              )
                return form.setError("careGiverId", {
                  message: t(
                    "api.This caregiver already has a shift at this time",
                  ),
                });

              if (overlappingShiftsData?.length) {
                setWarnOverlappingShiftsOpen(true);
                return;
              }

              mutation.mutate(values); //Mutate the value if there are no overlapping shifts
            })}
          >
            <CredenzaHeader>
              <CredenzaTitle>{t("apps.kodixCare.Create shift")}</CredenzaTitle>
            </CredenzaHeader>
            <CredenzaBody className="grid gap-4 py-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Start")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            date={field.value}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
                <LuArrowRight className="mt-8 size-6 self-center" />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("End")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            date={field.value}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="careGiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Caregiver")}</FormLabel>
                    <div className="flex flex-row gap-2">
                      <Select
                        disabled={
                          !myRoles.some(
                            (x) =>
                              x.appRoleDefaultId ===
                              kodixCareRoleDefaultIds.admin,
                          )
                        }
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="select-40"
                            className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                          >
                            <SelectValue
                              placeholder={t("Select a caregiver")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                          {careGivers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <span className="flex items-center gap-2">
                                <AvatarWrapper
                                  className="size-10 rounded-full"
                                  src={user.image ?? ""}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                />
                                <span>
                                  <span className="block font-medium">
                                    {user.name}
                                  </span>
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
            </CredenzaBody>
            <CredenzaFooter className="mt-6 justify-end">
              <Button
                disabled={
                  findOverlappingShiftsQuery.isFetching || mutation.isPending
                }
                type="submit"
              >
                {findOverlappingShiftsQuery.isFetching || mutation.isPending ? (
                  <>
                    <LuLoader2 className="mr-2 size-4 animate-spin" />
                    {findOverlappingShiftsQuery.isFetching
                      ? t("Checking")
                      : t("Saving")}
                    ...
                  </>
                ) : (
                  t("Create")
                )}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}

function WarnOverlappingShifts({
  overlaps,
  onClickConfirm,
  isSubmitting,
  open,
  setOpen,
}: {
  overlaps: RouterOutputs["app"]["kodixCare"]["findOverlappingShifts"];
  onClickConfirm: () => void;
  isSubmitting: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const format = useFormatter();
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="mt-6">
          <DialogTitle>
            {t("It seems that there are some overlapping shifts")}
          </DialogTitle>
        </DialogHeader>
        {overlaps.length ? (
          <ul className="my-4 list-disc rounded-md border p-4 pl-5">
            {overlaps.map((overlap) => (
              <li key={overlap.id} className="mb-2 flex items-center gap-2">
                <AvatarWrapper
                  className="size-6"
                  src={overlap.Caregiver.image ?? ""}
                  fallback={overlap.Caregiver.name}
                />
                {overlap.Caregiver.name}:
                <span className="text-muted-foreground">
                  {`${format.dateTime(overlap.startAt, "shortWithHours")} - ${format.dateTime(overlap.endAt, "shortWithHours")}`}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <DialogDescription>
          {t("Are you sure you want to create a shift anyways")}
        </DialogDescription>
        <DialogFooter className="gap-3 sm:justify-between">
          <Button
            variant={"outline"}
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => {
              onClickConfirm();
              setOpen(false);
            }}
          >
            {isSubmitting ? (
              <>
                <LuLoader2 className="mr-2 size-4 animate-spin" />
                {t("Saving")}...
              </>
            ) : (
              t("Confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
