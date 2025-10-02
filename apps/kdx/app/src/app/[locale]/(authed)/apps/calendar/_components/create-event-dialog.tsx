"use client";

import { useEffect, useState } from "react";
import dayjs from "@kodix/dayjs";
import { cn } from "@kodix/ui";
import { Button } from "@kodix/ui/button";
import { Checkbox } from "@kodix/ui/checkbox";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kodix/ui/credenza";
import { DateTimePicker } from "@kodix/ui/date-time-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import { Textarea } from "@kodix/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuCircleAlert, LuPlus } from "react-icons/lu";
import { RRule, Weekday } from "rrule";

import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZCreateInputSchema } from "@kdx/validators/trpc/app/calendar";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

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
      onError: trpcErrorToastDefault,
    }),
  );

  const t = useTranslations();

  return (
    <Credenza onOpenChange={setOpen} open={open}>
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
              className="space-y-6"
              onSubmit={form.handleSubmit((values) => {
                mutation.mutate(values);
              })}
            >
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("apps.calendar.Event title")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`${t("apps.calendar.Event title")}...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("From")}</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value === "CRITICAL"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "CRITICAL" : "NORMAL")
                            }
                          />
                        </FormControl>
                        <FormLabel className="flex items-center gap-1">
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

                <div className="space-y-2">
                  <RecurrencePicker
                    count={form.getValues("count")}
                    frequency={form.getValues("frequency")}
                    interval={form.getValues("interval")}
                    open={personalizedRecurrenceOpen}
                    setCount={(count) => form.setValue("count", count)}
                    setFrequency={(freq) => form.setValue("frequency", freq)}
                    setInterval={(interval) => {
                      form.setValue("interval", interval);
                    }}
                    setOpen={setPersonalizedRecurrenceOpen}
                    setUntil={(dayjs) =>
                      form.setValue("until", dayjs?.toDate())
                    }
                    setWeekdays={(weekdays) =>
                      form.setValue(
                        "weekdays",
                        weekdays?.map((wd) => wd.weekday),
                      )
                    }
                    until={
                      form.getValues("until")
                        ? dayjs(form.getValues("until"))
                        : undefined
                    }
                    weekdays={form
                      .getValues("weekdays")
                      ?.map((x) => new Weekday(x))}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`${t("apps.calendar.Add description")}...`}
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CredenzaFooter>
                <Button loading={mutation.isPending} size="sm" type="submit">
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
