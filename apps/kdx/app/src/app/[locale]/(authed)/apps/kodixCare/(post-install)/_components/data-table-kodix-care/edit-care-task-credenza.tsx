import type { CareTask } from "node_modules/@kdx/api/src/internal/calendarAndCareTaskCentral";
import { useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { kodixCareAppId } from "@kodix/shared/db";
import { cn } from "@kodix/ui";
import { Alert, AlertDescription, AlertTitle } from "@kodix/ui/alert";
import { Button } from "@kodix/ui/button";
import { DateTimePicker } from "@kodix/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kodix/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { Textarea } from "@kodix/ui/textarea";
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
import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

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
      details: task.details,
      doneAt: task.doneAt,
      id: task.id,
    }),
    [task],
  );
  const form = useForm({
    defaultValues,
    schema: ZEditCareTaskInputSchema(t).pick({
      details: true,
      doneAt: true,
      id: true,
    }),
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
    <Dialog onOpenChange={handleCloseOrOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-row items-center" ref={parent2}>
            {!isLogView ? (
              <DialogTitle>{t("apps.kodixCare.Edit task")}</DialogTitle>
            ) : (
              <>
                <Button
                  className="mr-2"
                  onClick={() => {
                    setIsLogView(false);
                  }}
                  size={"sm"}
                  variant={"ghost"}
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
            className={cn(
              "h-[600px] grow transition-all duration-300 ease-in-out",
            )}
            ref={parent}
          >
            {!isLogView ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(async (values) => {
                    await mutation.mutateAsync({
                      details: values.details,
                      doneAt: values.doneAt,
                      id: values.id,
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
                        onClick={() => setIsLogView(true)}
                        size={"sm"}
                        type="button"
                        variant={"outline"}
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
                                clearable
                                onChange={(newDate) =>
                                  field.onChange(newDate ?? null)
                                }
                                value={field.value ?? undefined}
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
                              className="w-full"
                              placeholder={`${t("apps.kodixCare.Any information")}...`}
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
                      disabled={!form.formState.isDirty}
                      loading={mutation.isPending}
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
      end: task.date,
      start: task.date,
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
      rowId: careTaskId,
      tableNames: ["careTask"],
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
            <TableCell className="h-24 text-center" colSpan={3}>
              {t("No results")}.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
