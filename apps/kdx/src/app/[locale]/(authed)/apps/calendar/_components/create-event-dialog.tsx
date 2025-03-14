"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuCircleAlert, LuPlus } from "react-icons/lu";
import { RRule, Weekday } from "rrule";

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
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useTRPC } from "~/trpc/react";
import { RecurrencePicker } from "./recurrence-picker";

export function CreateEventDialogButton() {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

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
  useEffect(() => {
    form.reset();
  }, [open, form]);

  const mutation = useMutation(
    trpc.app.calendar.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.calendar.getAll.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
        form.reset();
        setOpen(false);
      },
      onError: (e) => trpcErrorToastDefault(e),
    }),
  );

  const t = useTranslations();

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button size="sm">
          <LuPlus className="mr-2 size-4" />
          {t("apps.calendar.Create event")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="mb-64 sm:max-w-[600px]">
        <CredenzaHeader>
          <CredenzaTitle>{t("apps.calendar.New event")}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
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
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="w-full" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="py-3">
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value === "CRITICAL"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "CRITICAL" : "NORMAL")
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex gap-1">
                          <LuCircleAlert
                            className={cn(
                              "text-muted-foreground transition-colors",
                              {
                                "text-orange-400": field.value === "CRITICAL",
                              },
                            )}
                          />
                          {t("Critical task")}
                        </FormLabel>
                      </div>
                      <FormDescription>
                        {t("Is this task considered critical or important")}
                      </FormDescription>
                    </FormItem>
                  )}
                />
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
                    setUntil={(dayjs) =>
                      form.setValue("until", dayjs?.toDate())
                    }
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
              <CredenzaFooter>
                <Button type="submit" size="sm" loading={mutation.isPending}>
                  {t("apps.calendar.Create event")}
                </Button>
              </CredenzaFooter>
            </form>
          </Form>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
