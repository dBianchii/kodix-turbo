import type { Frequency } from "rrule";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { LuLoader2 } from "react-icons/lu";
import { RxCalendar } from "react-icons/rx";
import { RRule, Weekday } from "rrule";

import type { RouterInputs, RouterOutputs } from "@kdx/api";
import type { Dayjs } from "@kdx/dayjs";
import dayjs from "@kdx/dayjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";
import { Textarea } from "@kdx/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";
import { cn } from "@kdx/ui/utils";

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
  const { mutate: editEvent } = api.app.calendar.edit.useMutation({
    onMutate: () => {
      setButtonLoading(true);
    },
    onSuccess: () => {
      void utils.app.calendar.getAll.invalidate();
      setOpen(false);
    },
    onSettled: () => {
      setButtonLoading(false);
    },
    onError: (e) => trpcErrorToastDefault(e),
  });
  const [buttonLoading, setButtonLoading] = useState(false);
  const [personalizedRecurrenceOpen, setPersonalizedRecurrenceOpen] =
    useState(false);
  const [editDefinitionOpen, setEditDefinitionOpen] = useState(false);

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
      weekdays: RRule.fromString(calendarTask.rule).options.byweekday?.map(
        (w) => new Weekday(w),
      ),
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

  const setStateToDefault = useCallback(() => {
    setTitle(defaultCalendarTask.title);
    setDescription(defaultCalendarTask.description);
    setFrom(defaultCalendarTask.from);
    setFrequency(defaultCalendarTask.frequency);
    setInterval(defaultCalendarTask.interval);
    setUntil(defaultCalendarTask.until);
    setCount(defaultCalendarTask.count);
    setWeekdays(defaultCalendarTask.weekdays);
  }, [defaultCalendarTask]);

  useEffect(() => {
    setStateToDefault();
  }, [defaultCalendarTask, setStateToDefault]);

  const allowedEditDefinitions = {
    single: !(
      count !== defaultCalendarTask.count ||
      interval !== defaultCalendarTask.interval ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      (until && !until?.isSame(defaultCalendarTask.until)) ||
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
    weekdays !== defaultCalendarTask.weekdays;
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

    editEvent(input);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openDialog) => {
        if (!openDialog) setStateToDefault(); //Revert the data back to default when closing
        setOpen(openDialog);
      }}
    >
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Event title..."
              onChange={(e) => setTitle(e.target.value)}
              value={title ?? ""}
            />
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col space-y-2">
              <Label>From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[200px] pl-3 text-left font-normal",
                      !from && "text-muted-foreground",
                    )}
                  >
                    {from ? (
                      format(from.toDate(), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <RxCalendar className="ml-auto size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={from.toDate()}
                    onSelect={(date) => {
                      setFrom(
                        dayjs(date).hour(from.hour()).minute(from.minute()),
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="invisible">From</Label>
              <Input
                type="time"
                value={from.format("HH:mm")}
                onChange={(e) => {
                  const newTime = e.target.value;

                  setFrom(
                    dayjs(from)
                      .hour(parseInt(newTime.split(":")[0] ?? "0"))
                      .minute(parseInt(newTime.split(":")[1] ?? "0"))
                      .second(0)
                      .millisecond(0),
                  );
                }}
                className="w-26"
              />
            </div>
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
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></Textarea>
        </div>
        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={buttonLoading || !isFormChanged}
                    onClick={() => setEditDefinitionOpen(true)}
                  >
                    {buttonLoading ? (
                      <LuLoader2 className="mx-2 size-4 animate-spin" />
                    ) : (
                      <>OK</>
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent hidden={isFormChanged}>
                <p>Please change some data in order to accept the changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
        <SubmitEditEventDialog
          open={editDefinitionOpen}
          setOpen={setEditDefinitionOpen}
          allowedDefinitions={allowedEditDefinitions}
          submit={handleSubmitFormData}
        />
      </DialogContent>
    </Dialog>
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

  return (
    <AlertDialog
      open={open}
      onOpenChange={(boolean) => {
        setOpen(boolean);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit event</AlertDialogTitle>
          <div className="my-6">
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
                    This event
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
                    This and future events
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
                    All events
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              submit(definition);
            }}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
