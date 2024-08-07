"use client";

import { useState } from "react";
import { LuLoader2 } from "react-icons/lu";
import { RxPlus } from "react-icons/rx";
import { RRule, Weekday } from "rrule";

import dayjs from "@kdx/dayjs";
import { useTranslations } from "@kdx/locales/next-intl/client";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { Textarea } from "@kdx/ui/textarea";
import { ZCreateInputSchema } from "@kdx/validators/trpc/app/calendar";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { RecurrencePicker } from "./recurrence-picker";

export function CreateEventDialogButton() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const [personalizedRecurrenceOpen, setPersonalizedRecurrenceOpen] =
    useState(false);

  const form = useForm({
    schema: ZCreateInputSchema,
    defaultValues: {
      title: "",
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
      count: 1,
    },
  });
  form.watch();

  const mutation = api.app.calendar.create.useMutation({
    onSuccess: () => {
      void utils.app.calendar.getAll.invalidate();
      void utils.app.kodixCare.getCareTasks.invalidate();
      form.reset();
      setOpen(false);
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  const t = useTranslations();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) form.reset();
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <RxPlus className="mr-2 size-4" />
          {t("apps.calendar.Create event")}
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("apps.calendar.New event")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              mutation.mutate(values);
            })}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex flex-row">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>{t("apps.calendar.Event title")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`${t("apps.calendar.Event title")}...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row">
                <div className="flex flex-col space-y-2">
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("From")}</FormLabel>
                        <FormControl>
                          <div className="flex flex-row gap-2">
                            <DateTimePicker
                              date={field.value}
                              setDate={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="w-full" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-row">
                <RecurrencePicker
                  open={personalizedRecurrenceOpen}
                  setOpen={setPersonalizedRecurrenceOpen}
                  interval={form.getValues("interval")}
                  setInterval={(interval) => {
                    form.setValue("interval", interval);
                  }}
                  frequency={form.getValues("frequency")}
                  setFrequency={(freq) => form.setValue("frequency", freq)}
                  until={
                    form.getValues("until")
                      ? dayjs(form.getValues("until"))
                      : undefined
                  }
                  setUntil={(dayjs) => form.setValue("until", dayjs?.toDate())}
                  count={form.getValues("count")}
                  setCount={(count) => form.setValue("count", count)}
                  weekdays={form
                    .getValues("weekdays")
                    ?.map((x) => new Weekday(x))}
                  setWeekdays={(weekdays) =>
                    form.setValue(
                      "weekdays",
                      weekdays?.map((wd) => wd.weekday),
                    )
                  }
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={`${t("apps.calendar.Add description")}...`}
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <LuLoader2 className="mx-2 size-4 animate-spin" />
                ) : (
                  t("apps.calendar.Create event")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
