import type { Frequency } from "rrule";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LuAlertCircle } from "react-icons/lu";
import { RRule, Weekday } from "rrule";

import type { RouterInputs, RouterOutputs } from "@kdx/api";
import type { Dayjs } from "@kdx/dayjs";
import type { eventMasters } from "@kdx/db/schema";
import dayjs from "@kdx/dayjs";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kdx/ui/credenza";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";
import { Textarea } from "@kdx/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { RecurrencePicker } from "./recurrence-picker";

export function EditEventDialog({
  calendarTask,
  open,
  setOpen,
}: {
  calendarTask: RouterOutputs["app"]["calendar"]["getAll"][number];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const utils = api.useUtils();
  const [personalizedRecurrenceOpen, setPersonalizedRecurrenceOpen] =
    useState(false);
  const [editDefinitionOpen, setEditDefinitionOpen] = useState(false);
  const mutation = api.app.calendar.edit.useMutation({
    onSuccess: () => {
      setOpen(false);
      setEditDefinitionOpen(false);
      setPersonalizedRecurrenceOpen(false);
      void utils.app.calendar.getAll.invalidate();
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  const defaultCalendarTask = useMemo(() => {
    return {
      eventMasterId: calendarTask.eventMasterId,
      eventExceptionId: calendarTask.eventExceptionId,
      calendarTask: calendarTask,
      title: calendarTask.title,
      description: calendarTask.description ?? "",
      from: dayjs(calendarTask.date),
      time: dayjs(calendarTask.date).format("HH:mm"),
      frequency: RRule.fromString(calendarTask.rule).options.freq,
      interval: RRule.fromString(calendarTask.rule).options.interval,
      until: RRule.fromString(calendarTask.rule).options.until
        ? dayjs(RRule.fromString(calendarTask.rule).options.until)
        : undefined,
      count: RRule.fromString(calendarTask.rule).options.count ?? undefined,
      date: calendarTask.date,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      weekdays: RRule.fromString(calendarTask.rule).options.byweekday?.map(
        (w) => new Weekday(w),
      ),
      type: calendarTask.type,
    };
  }, [calendarTask]);

  const [title, setTitle] = useState(calendarTask.title);
  const [description, setDescription] = useState(calendarTask.description);
  const [from, setFrom] = useState(dayjs(calendarTask.date));
  const [frequency, setFrequency] = useState<Frequency>(
    defaultCalendarTask.frequency,
  );
  const [interval, setInterval] = useState<number>(
    defaultCalendarTask.interval,
  );
  const [until, setUntil] = useState<Dayjs | undefined>(
    defaultCalendarTask.until,
  );
  const [count, setCount] = useState<number | undefined>(
    defaultCalendarTask.count,
  );
  const [weekdays, setWeekdays] = useState<Weekday[] | undefined>(
    defaultCalendarTask.weekdays,
  );
  const [type, setType] = useState<typeof eventMasters.$inferSelect.type>(
    defaultCalendarTask.type,
  );

  const setStateToDefault = useCallback(() => {
    setTitle(defaultCalendarTask.title);
    setDescription(defaultCalendarTask.description);
    setFrom(defaultCalendarTask.from);
    setFrequency(defaultCalendarTask.frequency);
    setInterval(defaultCalendarTask.interval);
    setUntil(defaultCalendarTask.until);
    setCount(defaultCalendarTask.count);
    setWeekdays(defaultCalendarTask.weekdays);
    setType(defaultCalendarTask.type);
  }, [defaultCalendarTask]);

  useEffect(() => {
    setStateToDefault();
  }, [defaultCalendarTask, setStateToDefault]);

  const allowedEditDefinitions = {
    single: !(
      count !== defaultCalendarTask.count ||
      interval !== defaultCalendarTask.interval ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      (until && !until.isSame(defaultCalendarTask.until)) ||
      frequency !== defaultCalendarTask.frequency ||
      weekdays !== defaultCalendarTask.weekdays
    ),
    thisAndFuture: true,
    all: !(
      from.format("YYYY-MM-DD") !==
      defaultCalendarTask.from.format("YYYY-MM-DD")
    ),
  };

  const isFormChanged =
    title !== defaultCalendarTask.title ||
    description !== defaultCalendarTask.description ||
    !from.isSame(defaultCalendarTask.from) ||
    frequency !== defaultCalendarTask.frequency ||
    interval !== defaultCalendarTask.interval ||
    until !== defaultCalendarTask.until ||
    count !== defaultCalendarTask.count ||
    weekdays !== defaultCalendarTask.weekdays ||
    type !== defaultCalendarTask.type;

  function handleSubmitFormData(
    definition: "single" | "thisAndFuture" | "all",
  ) {
    const input: RouterInputs["app"]["calendar"]["edit"] = {
      eventExceptionId: defaultCalendarTask.eventExceptionId,
      eventMasterId: defaultCalendarTask.eventMasterId,
      selectedTimestamp: defaultCalendarTask.date,
      editDefinition: definition,
    };

    if (title !== defaultCalendarTask.title) input.title = title;
    if (description !== defaultCalendarTask.description)
      input.description = description;
    if (type !== defaultCalendarTask.type) input.type = type;

    if (input.editDefinition === "single") {
      if (!from.isSame(defaultCalendarTask.from)) input.from = from.toDate();
    }

    if (input.editDefinition === "thisAndFuture") {
      if (!from.isSame(defaultCalendarTask.from)) input.from = from.toDate();

      if (count !== defaultCalendarTask.count) {
        input.count = count ?? null;
      }
      if (interval !== defaultCalendarTask.interval) input.interval = interval;
      if (!until?.isSame(defaultCalendarTask.until))
        input.until = until?.toDate();
      if (frequency !== defaultCalendarTask.frequency)
        input.frequency = frequency;
      if (weekdays !== defaultCalendarTask.weekdays)
        input.weekdays = weekdays?.map((w) => w.weekday);
    }

    if (input.editDefinition === "all") {
      if (!from.isSame(defaultCalendarTask.from))
        input.from = from.format("HH:mm");

      if (count !== defaultCalendarTask.count) {
        input.count = count ?? null;
      }
      if (interval !== defaultCalendarTask.interval) input.interval = interval;
      if (!until?.isSame(defaultCalendarTask.until))
        input.until = until?.toDate();
      if (frequency !== defaultCalendarTask.frequency)
        input.frequency = frequency;
      if (weekdays !== defaultCalendarTask.weekdays)
        input.weekdays = weekdays?.map((w) => w.weekday);
    }

    mutation.mutate(input);
  }
  const t = useTranslations();

  return (
    <Credenza
      open={open}
      onOpenChange={(openDialog) => {
        if (!openDialog) setStateToDefault(); //Revert the data back to default when closing
        setOpen(openDialog);
      }}
    >
      <CredenzaContent className="mb-64 sm:max-w-[600px]">
        <CredenzaHeader>
          <CredenzaTitle>{t("apps.calendar.Edit event")}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="space-y-6">
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Event title..."
              onChange={(e) => setTitle(e.target.value)}
              value={title ?? ""}
            />
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col space-y-2">
              <Label>{t("From")}</Label>
              <DateTimePicker
                value={from.toDate()}
                onChange={(newDate) => setFrom(dayjs(newDate))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <Checkbox
                id="critical"
                checked={type === "CRITICAL"}
                onCheckedChange={(checked) =>
                  setType(checked ? "CRITICAL" : "NORMAL")
                }
              />
              <Label className="flex items-center gap-1" htmlFor="critical">
                <LuAlertCircle
                  className={cn("text-muted-foreground transition-colors", {
                    "text-orange-400": type === "CRITICAL",
                  })}
                />
                {t("Critical task")}
              </Label>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              {t("Is this task considered critical or important")}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <RecurrencePicker
              open={personalizedRecurrenceOpen}
              setOpen={setPersonalizedRecurrenceOpen}
              interval={interval}
              setInterval={setInterval}
              frequency={frequency}
              setFrequency={setFrequency}
              until={until}
              setUntil={setUntil}
              count={count}
              setCount={setCount}
              weekdays={weekdays}
              setWeekdays={setWeekdays}
            />
          </div>
          <Textarea
            placeholder={`${t("apps.calendar.Add description")}...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CredenzaBody>
        <CredenzaFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!isFormChanged}
                    loading={mutation.isPending}
                    onClick={() => setEditDefinitionOpen(true)}
                  >
                    {t("Ok")}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent hidden={isFormChanged}>
                <p>Please change some data in order to accept the changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CredenzaFooter>
        <SubmitEditEventDialog
          open={editDefinitionOpen}
          setOpen={setEditDefinitionOpen}
          allowedDefinitions={allowedEditDefinitions}
          submit={handleSubmitFormData}
        />
      </CredenzaContent>
    </Credenza>
  );
}

function SubmitEditEventDialog({
  open,
  setOpen,
  allowedDefinitions,
  submit,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allowedDefinitions: {
    single: boolean;
    thisAndFuture: boolean;
    all: boolean;
  };
  submit: (definition: "single" | "thisAndFuture" | "all") => void;
}) {
  const [definition, setDefinition] = useState<
    "single" | "thisAndFuture" | "all"
  >("single");

  const t = useTranslations();

  return (
    <Credenza
      open={open}
      onOpenChange={(boolean) => {
        setOpen(boolean);
      }}
    >
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{t("apps.calendar.Edit event")}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="my-6">
          <RadioGroup className="flex flex-col space-y-2">
            {allowedDefinitions.single && (
              <div className="flex">
                <RadioGroupItem
                  id="single"
                  value={"single"}
                  onClick={() => {
                    setDefinition("single");
                  }}
                  checked={definition === "single"}
                />
                <Label htmlFor="single" className="ml-2">
                  {t("apps.calendar.This event")}
                </Label>
              </div>
            )}
            {allowedDefinitions.thisAndFuture && (
              <div className="flex">
                <RadioGroupItem
                  id="thisAndFuture"
                  value={"thisAndFuture"}
                  checked={definition === "thisAndFuture"}
                  onClick={() => {
                    setDefinition("thisAndFuture");
                  }}
                />
                <Label htmlFor="thisAndFuture" className="ml-2">
                  {t("apps.calendar.This and future events")}
                </Label>
              </div>
            )}
            {allowedDefinitions.all && (
              <div className="flex">
                <RadioGroupItem
                  id="all"
                  value={"all"}
                  checked={definition === "all"}
                  onClick={() => {
                    setDefinition("all");
                  }}
                />
                <Label htmlFor="all" className="ml-2">
                  {t("apps.calendar.All events")}
                </Label>
              </div>
            )}
          </RadioGroup>
        </CredenzaBody>
        <CredenzaFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setOpen(false);
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => {
              submit(definition);
            }}
          >
            {t("Ok")}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
