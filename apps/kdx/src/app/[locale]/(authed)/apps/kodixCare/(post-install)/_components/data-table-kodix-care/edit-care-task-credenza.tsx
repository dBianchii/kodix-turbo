import type { CareTask } from "node_modules/@kdx/api/src/internal/calendarAndCareTaskCentral";
import { useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useFormatter, useTranslations } from "next-intl";
import {
  LuAlertCircle,
  LuAlertTriangle,
  LuArrowLeft,
  LuCalendar,
  LuLoader2,
  LuScrollText,
} from "react-icons/lu";

import type { User } from "@kdx/auth";
import { kodixCareAppId } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { Alert, AlertDescription, AlertTitle } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kdx/ui/credenza";
import { DateTimePicker24h } from "@kdx/ui/date-n-time/date-time-picker-24h";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { Textarea } from "@kdx/ui/textarea";
import { ZEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import { api } from "~/trpc/react";

export function EditCareTaskCredenza({
  user,
  task,
  mutation,
  open,
  setOpen,
}: {
  user: User;
  task: CareTask;
  mutation: ReturnType<
    typeof api.app.kodixCare.careTask.editCareTask.useMutation
  >;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [isLogView, setIsLogView] = useState(false);
  const t = useTranslations();
  const [parent] = useAutoAnimate({
    duration: 300,
    easing: "ease-in-out",
  });
  const [parent2] = useAutoAnimate({
    duration: 300,
    easing: "ease-in-out",
  });
  const [parent3] = useAutoAnimate({
    duration: 300,
    easing: "ease-in-out",
  });
  const defaultValues = useMemo(
    () => ({
      id: task.id,
      details: task.details,
      doneAt: task.doneAt,
    }),
    [task],
  );
  const form = useForm({
    schema: ZEditCareTaskInputSchema(t).pick({
      id: true,
      details: true,
      doneAt: true,
    }),
    defaultValues,
  });

  const handleCloseOrOpen = (open: boolean) => {
    form.reset(defaultValues);
    setOpen(open);
    setIsLogView(false);
  };

  const format = useFormatter();

  return (
    <>
      <Credenza open={open} onOpenChange={handleCloseOrOpen}>
        <CredenzaContent
          className={cn({
            "max-w-[900px]": isLogView,
          })}
        >
          <CredenzaHeader>
            <div ref={parent2} className="flex flex-row items-center">
              {isLogView && (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className="mr-2"
                  onClick={() => {
                    setIsLogView(false);
                  }}
                >
                  <LuArrowLeft className="size-3" />
                </Button>
              )}
              {isLogView ? (
                <CredenzaTitle>{t("Logs")}</CredenzaTitle>
              ) : (
                <CredenzaTitle key={"somekey"}>
                  {t("apps.kodixCare.Edit task")}
                </CredenzaTitle>
              )}
            </div>
          </CredenzaHeader>
          <div className="overflow-hidden">
            <div
              ref={parent}
              className={cn(
                "h-[600px] flex-grow transition-all duration-300 ease-in-out",
              )}
            >
              {isLogView ? (
                <LogsView careTaskId={task.id} />
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((values) => {
                      mutation.mutate({
                        id: values.id,
                        details: values.details,
                        doneAt: values.doneAt,
                      });
                      handleCloseOrOpen(false);
                    })}
                  >
                    <div className="mt-6 flex flex-col gap-2 rounded-md border p-4 text-foreground/80">
                      <div className="flex gap-2">
                        <span className="text-sm font-semibold">
                          {task.title ?? ""}
                        </span>
                        {task.type === "CRITICAL" && (
                          <LuAlertCircle className="size-3 text-orange-400" />
                        )}
                        <Button
                          className="ml-auto"
                          variant={"outline"}
                          size={"sm"}
                          type="button"
                          onClick={() => setIsLogView(true)}
                        >
                          <LuScrollText className="mr-2 size-3" />
                          {t("Logs")}
                        </Button>
                      </div>
                      <span className="line-clamp-3 text-xs font-semibold">
                        {task.description ?? ""}
                      </span>
                      <span className="flex text-xs font-semibold">
                        <LuCalendar className="mr-2 size-3 text-muted-foreground" />
                        {format.dateTime(task.date, "shortWithHours")}
                      </span>
                    </div>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="doneAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Done at")}</FormLabel>
                            <FormControl>
                              <div className="flex flex-row gap-2">
                                <DateTimePicker24h
                                  date={field.value ?? undefined}
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
                      <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Details")}</FormLabel>
                            <FormControl>
                              <Textarea
                                autoFocus
                                placeholder={`${t("apps.kodixCare.Any information")}...`}
                                className="w-full"
                                rows={6}
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                }}
                                value={field.value ?? undefined}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div ref={parent3}>
                      <AlertNoShiftsOrNotYours task={task} user={user} />
                    </div>
                    <CredenzaFooter className="mt-6 justify-end">
                      <Button disabled={mutation.isPending} type="submit">
                        {t("Save")}
                      </Button>
                    </CredenzaFooter>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </CredenzaContent>
      </Credenza>
    </>
  );
}

function AlertNoShiftsOrNotYours({
  task,
  user,
}: {
  task: CareTask;
  user: User;
}) {
  const overlappingShiftsQuery =
    api.app.kodixCare.findOverlappingShifts.useQuery(
      {
        start: task.date,
        end: task.date,
      },
      {
        refetchOnWindowFocus: "always",
      },
    );

  const atLeastOneShiftExists = !!overlappingShiftsQuery.data?.length;
  const isAtLeastOneOfTheOverlappingShiftsMine =
    overlappingShiftsQuery.data?.some((x) => x.Caregiver.id === user.id);
  const t = useTranslations();

  if (
    overlappingShiftsQuery.isLoading ||
    (atLeastOneShiftExists && isAtLeastOneOfTheOverlappingShiftsMine)
  )
    return null;

  const text = !atLeastOneShiftExists
    ? t(
        "There is no shift associated with this task Its recommended that you create a shift for this task",
      )
    : !isAtLeastOneOfTheOverlappingShiftsMine
      ? t(
          "This task is not associated with any of your shifts You can still edit it but its recommended that you create a shift for it",
        )
      : "";

  return (
    <Alert variant="warning">
      <LuAlertTriangle className="h-4 w-4" />
      <AlertTitle>{t("Warning")}</AlertTitle>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}

function LogsView({ careTaskId }: { careTaskId: string }) {
  const getAppActivityLogsQuery = api.app.getAppActivityLogs.useQuery({
    appId: kodixCareAppId,
    tableNames: ["careTask"],
    rowId: careTaskId,
  });
  const t = useTranslations();
  const format = useFormatter();
  if (getAppActivityLogsQuery.isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader2 className="size-6 animate-spin" />
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("Date")}</TableHead>
          <TableHead>{t("User")}</TableHead>
          <TableHead>{t("Message")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getAppActivityLogsQuery.data?.length ? (
          getAppActivityLogsQuery.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format.dateTime(log.loggedAt, "shortWithHours")}
              </TableCell>
              <TableCell>{log.User.name}</TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className="h-24 text-center">
              {t("No results")}.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
