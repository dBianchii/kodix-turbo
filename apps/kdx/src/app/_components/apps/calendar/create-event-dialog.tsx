"use client";

import type { Weekday } from "rrule";
import { useState } from "react";
import { LuLoader2 } from "react-icons/lu";
import { RxPlus } from "react-icons/rx";
import { RRule } from "rrule";

import type { RouterInputs } from "@kdx/api";
import type { Dayjs } from "@kdx/dayjs";
import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Textarea } from "@kdx/ui/textarea";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { RecurrencePicker } from "./recurrence-picker";

export function CreateEventDialogButton() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const { mutate: createEvent, isPending } =
    api.app.calendar.create.useMutation({
      onSuccess: () => {
        void utils.app.calendar.getAll.invalidate();
        revertStateToDefault();
        setOpen(false);
      },
      onError: (e) => trpcErrorToastDefault(e),
    });
  const [personalizedRecurrenceOpen, setPersonalizedRecurrenceOpen] =
    useState(false);

  const defaultState = {
    title: "",
    description: "",
    from: dayjs(new Date())
      .startOf("hour")
      .hour(
        dayjs.utc().minute() < 30
          ? new Date().getHours()
          : new Date().getHours() + 1,
      )
      .minute(dayjs.utc().minute() < 30 ? 30 : 0)
      .toDate(),

    frequency: RRule.DAILY,
    interval: 1,
    until: undefined,
    count: 1,
    byweekday: undefined,
  };

  const [title, setTitle] = useState(defaultState.title);
  const [description, setDescription] = useState(defaultState.description);
  const [from, setFrom] = useState(defaultState.from);
  const [frequency, setFrequency] = useState(defaultState.frequency);
  const [interval, setInterval] = useState(defaultState.interval);
  const [until, setUntil] = useState<Dayjs | undefined>(defaultState.until);
  const [count, setCount] = useState<number | undefined>(defaultState.count);
  const [weekdays, setWeekdays] = useState<Weekday[] | undefined>();

  function revertStateToDefault() {
    setTitle(defaultState.title);
    setDescription(defaultState.description);
    setFrom(defaultState.from);
    setFrequency(defaultState.frequency);
    setInterval(defaultState.interval);
    setUntil(defaultState.until);
    setCount(defaultState.count);
  }

  function handleSubmitFormData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //We need to make sure that everything is the same as from, except for the date.
    const input: RouterInputs["app"]["calendar"]["create"] = {
      title,
      description,
      from: from,
      until: until?.toDate(),
      frequency,
      interval,
      count,
      weekdays: weekdays?.map((wd) => wd.weekday),
    };

    createEvent(input);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(boolean) => {
        if (!boolean) revertStateToDefault(); //reset form data when closing
        setOpen(boolean);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <RxPlus className="mr-2 size-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitFormData} className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-row gap-2">
              <Input
                placeholder="Event title..."
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col space-y-2">
                <Label>From</Label>
                <DateTimePicker
                  date={from}
                  setDate={(date) => setFrom(date ?? new Date())}
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
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <LuLoader2 className="mx-2 size-4 animate-spin" />
              ) : (
                <>Create task</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
