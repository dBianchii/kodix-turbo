import type { CareTask } from "node_modules/@kdx/api/src/internal/calendarAndCareTaskCentral";
import { useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { kodixCareAppId } from "@kodix/shared/db";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import {
  LuArrowLeft,
  LuCalendar,
  LuCircleAlert,
  LuLoaderCircle,
  LuScrollText,
  LuTriangleAlert,
} from "react-icons/lu";

import type { User } from "@kdx/auth";
import { cn } from "@kdx/ui";
import { Alert, AlertDescription, AlertTitle } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { Textarea } from "@kdx/ui/textarea";
import { ZEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import { useTRPC } from "~/trpc/react";

import type { useSaveCareTaskMutation } from "./hooks";

export function EditCareTaskCredenza({
  user,
  task,
  mutation,
  open,
  setOpen,
}: {
  user: User;
  task: CareTask;
  mutation: ReturnType<typeof useSaveCareTaskMutation>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [isLogView, setIsLogView] = useState(false);
  const t = useTranslations();
  const [parent] = useAutoAnimate({
    easing: "ease-in-out",
  });
  const [parent2] = useAutoAnimate({
    easing: "ease-in-out",
  });
  const [parent3] = useAutoAnimate({
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
    setOpen(open);
    setIsLogView(false);
    if (!open) {
      form.reset(defaultValues);
    }
  };

  const format = useFormatter();

  return (
    <Dialog open={open} onOpenChange={handleCloseOrOpen}>
      <DialogContent>
        <DialogHeader>
          <div ref={parent2} className="flex flex-row items-center">
            {!isLogView ? (
              <DialogTitle>{t("apps.kodixCare.Edit task")}</DialogTitle>
            ) : (
              <>
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
                <DialogTitle>{t("Logs")}</DialogTitle>
              </>
            )}
          </div>
        </DialogHeader>
        <div className={cn(isLogView && "overflow-auto")}>
          <div
            ref={parent}
            className={cn(
              "h-[600px] grow transition-all duration-300 ease-in-out",
            )}
          >
            {!isLogView ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(async (values) => {
                    await mutation.mutateAsync({
                      id: values.id,
                      details: values.details,
                      doneAt: values.doneAt,
                    });
                    handleCloseOrOpen(false);
                  })}
                >
                  <div className="mt-6 flex flex-col gap-2 rounded-md border p-4 text-foreground/80">
                    <div className="flex gap-2">
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-semibold text-sm">
                          {task.title ?? null}
                        </span>
                        {task.type === "CRITICAL" && (
                          <LuCircleAlert className="size-3 text-orange-400" />
                        )}
                      </div>
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
                    <span className="line-clamp-3 font-semibold text-xs">
                      {task.description ?? null}
                    </span>
                    <span className="flex items-center font-semibold text-xs">
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
                              <DateTimePicker
                                value={field.value ?? undefined}
                                onChange={(newDate) =>
                                  field.onChange(newDate ?? null)
                                }
                                clearable
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
                  <DialogFooter className="mt-6 justify-end">
                    <Button
                      loading={mutation.isPending}
                      disabled={!form.formState.isDirty}
                      type="submit"
                    >
                      {t("Save")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <LogsView careTaskId={task.id} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AlertNoShiftsOrNotYours({
  task,
  user,
}: {
  task: CareTask;
  user: User;
}) {
  const trpc = useTRPC();
  const overlappingShiftsQuery = useQuery(
    trpc.app.kodixCare.findOverlappingShifts.queryOptions({
      start: task.date,
      end: task.date,
    }),
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
      <LuTriangleAlert className="h-4 w-4" />
      <AlertTitle>{t("Warning")}</AlertTitle>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}

function LogsView({ careTaskId }: { careTaskId: string }) {
  const trpc = useTRPC();
  const getAppActivityLogsQuery = useQuery(
    trpc.app.getAppActivityLogs.queryOptions({
      appId: kodixCareAppId,
      tableNames: ["careTask"],
      rowId: careTaskId,
    }),
  );
  const t = useTranslations();
  const format = useFormatter();
  if (getAppActivityLogsQuery.isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoaderCircle className="size-6 animate-spin" />
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
            <TableCell colSpan={3} className="h-24 text-center">
              {t("No results")}.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
