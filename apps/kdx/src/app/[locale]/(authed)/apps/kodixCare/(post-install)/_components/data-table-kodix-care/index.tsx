"use client";

import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type { CareTask } from "node_modules/@kdx/api/src/internal/calendarAndCareTaskCentral";
import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import {
  LuAlertCircle,
  LuArrowLeftRight,
  LuCheck,
  LuLoader2,
  LuPlus,
  LuText,
} from "react-icons/lu";
import {
  RxCalendar,
  RxDotsHorizontal,
  RxLockClosed,
  RxTrash,
} from "react-icons/rx";
import { create } from "zustand";

import type { RouterOutputs } from "@kdx/api";
import dayjs from "@kdx/dayjs";
import { Link } from "@kdx/locales/next-intl/navigation";
import { cn } from "@kdx/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Button, buttonVariants } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { DataTableColumnHeader } from "@kdx/ui/data-table/data-table-column-header";
import { DataTableViewOptions } from "@kdx/ui/data-table/data-table-view-options";
import { DateTimePicker24h } from "@kdx/ui/date-n-time/date-time-picker-24h";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { Textarea } from "@kdx/ui/textarea";
import { toast } from "@kdx/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";
import {
  ZCreateCareTaskInputSchema,
  ZEditCareTaskInputSchema,
} from "@kdx/validators/trpc/app/kodixCare/careTask";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { DateTimeSelectorWithLeftAndRightArrows } from "./date-time-selector-with-left-and-right-buttons";

type CareTaskOrCalendarTask =
  RouterOutputs["app"]["kodixCare"]["careTask"]["getCareTasks"][number];

const columnHelper = createColumnHelper<CareTaskOrCalendarTask>();

export const useCareTaskStore = create<{
  input: {
    dateStart: Date;
    dateEnd: Date;
  };
  editDetailsOpen: boolean;
  unlockMoreTasksCredenzaWithDateOpen: Date | false;
  setUnlockMoreTasksCredenzaOpenWithDate: (open: Date | false) => void;
  currentlyEditing: CareTask["id"] | undefined;
  setEditDetailsOpen: (open: boolean) => void;
  setCurrentlyEditing: (id: string | undefined) => void;
  onDateChange: (date: Date) => void;
}>((set) => ({
  input: {
    dateStart: dayjs().startOf("day").toDate(),
    dateEnd: dayjs().endOf("day").toDate(),
  },
  onDateChange: (date) =>
    set(() => ({
      input: {
        dateStart: dayjs(date).startOf("day").toDate(),
        dateEnd: dayjs(date).endOf("day").toDate(),
      },
      editDetailsOpen: false,
      unlockMoreTasksCredenzaWithDateOpen: false,
    })),

  editDetailsOpen: false,
  setEditDetailsOpen: (open) => set(() => ({ editDetailsOpen: open })),

  unlockMoreTasksCredenzaWithDateOpen: false,
  setUnlockMoreTasksCredenzaOpenWithDate: (dateOrFalse) =>
    set(() => ({ unlockMoreTasksCredenzaWithDateOpen: dateOrFalse })),

  currentlyEditing: undefined,
  setCurrentlyEditing: (id) => set(() => ({ currentlyEditing: id })),
}));

export default function DataTableKodixCare() {
  const {
    input,
    setEditDetailsOpen,
    editDetailsOpen,
    currentlyEditing,
    setCurrentlyEditing,
    setUnlockMoreTasksCredenzaOpenWithDate,
  } = useCareTaskStore();

  const utils = api.useUtils();
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);

  const query = api.app.kodixCare.careTask.getCareTasks.useQuery(input);
  const saveCareTaskMutation =
    api.app.kodixCare.careTask.editCareTask.useMutation({
      onMutate: async (editedCareTask) => {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.app.kodixCare.careTask.getCareTasks.cancel();
        // Snapshot the previous value
        const previousCareTasks =
          utils.app.kodixCare.careTask.getCareTasks.getData();

        // Optimistically update to the new value
        utils.app.kodixCare.careTask.getCareTasks.setData(input, (prev) => {
          return prev?.map((x) => {
            if (x.id === editedCareTask.id) {
              if (editedCareTask.doneAt !== undefined)
                x.doneAt = editedCareTask.doneAt;
              if (editedCareTask.details !== undefined)
                x.details = editedCareTask.details;
            }

            return x;
          });
        });

        // Return a context object with the snapshotted value
        return { previousCareTasks };
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (err, __, context) => {
        utils.app.kodixCare.careTask.getCareTasks.setData(
          input,
          context?.previousCareTasks,
        );
        trpcErrorToastDefault(err);
      },
      // Always refetch after error or success:
      onSettled: () => {
        void utils.app.kodixCare.careTask.getCareTasks.invalidate();
      },
    });

  const isCareTask = (id: CareTaskOrCalendarTask["id"]): id is string => !!id;
  const t = useTranslations();
  const format = useFormatter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Title")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <div className="w-8">
                {isCareTask(ctx.row.original.id) ? (
                  <Checkbox
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!ctx.row.original.id) return; //Will never happen. its just to make ts happy
                      setCurrentlyEditing(ctx.row.original.id);

                      saveCareTaskMutation.mutate({
                        id: ctx.row.original.id,
                        doneAt: ctx.row.original.doneAt ? null : new Date(),
                      });
                    }}
                    checked={!!ctx.row.original.doneAt}
                    className="size-5"
                  />
                ) : (
                  <RxLockClosed className="size-4" />
                )}
              </div>
              <span className="font-semibold">{ctx.getValue()}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("date", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <RxCalendar className="mr-2 size-4" />
            {t("Date")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => (
          <div>
            {format.dateTime(ctx.row.original.date, {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        ),
      }),
      columnHelper.accessor("doneAt", {
        header: ({ column }) => {
          return (
            <DataTableColumnHeader column={column}>
              <LuCheck className="mr-2 size-4 text-green-400" />
              {t("Done at")}
            </DataTableColumnHeader>
          );
        },
        cell: (ctx) => {
          if (!ctx.row.original.id) return null;
          if (!ctx.row.original.doneAt) return null;
          return (
            <div>
              {format.dateTime(ctx.row.original.doneAt, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>
          );
        },
      }),
      columnHelper.accessor("details", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <LuText className="mr-2 size-4 text-orange-400" />
            {t("Details")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => <div>{ctx.row.original.details}</div>,
      }),
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <LuAlertCircle className="mr-2 size-4 text-orange-400" />
            {t("Critical")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => (
          <div className="flex max-w-sm items-center justify-center">
            {ctx.getValue() === "CRITICAL" ? (
              <LuAlertCircle className="mr-2 size-4 text-orange-400" />
            ) : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: "edit",
        header: () => null,
        cell: (ctx) => {
          if (!isCareTask(ctx.row.original.id)) return null;

          return (
            <div className="space-x-4">
              {/* <Checkbox
              checked={info.row.getIsSelected()}
              onCheckedChange={(value) => info.row.toggleSelected(!!value)}
              aria-label="Select row"
            /> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <RxDotsHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCareTask(ctx.row.original.id)) return; //?Will never happen. its just to make ts happy

                      setCurrentlyEditing(ctx.row.original.id);
                      setDeleteTaskOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <RxTrash className="mr-2 size-4" />
                    {t("Delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [format, saveCareTaskMutation, setCurrentlyEditing, t],
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data: query.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  const currentlyEditingCareTask = useMemo(() => {
    if (!query.data?.length) return undefined;
    return query.data.find((x) => x.id === currentlyEditing) as CareTask;
  }, [currentlyEditing, query.data]);

  return (
    <>
      {currentlyEditingCareTask && (
        <>
          <EditCareTaskCredenza
            task={currentlyEditingCareTask}
            mutation={saveCareTaskMutation}
            open={editDetailsOpen}
            setOpen={setEditDetailsOpen}
          />
          <DeleteCareTaskAlertDialog
            task={currentlyEditingCareTask}
            open={deleteTaskOpen}
            setOpen={setDeleteTaskOpen}
          />
        </>
      )}

      <UnlockMoreTasksCredenza />
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <div className="flex gap-2 sm:mr-auto">
          <AddCareTaskCredenzaButton />
          <SyncTasksFromCalendarCredenzaButton />
        </div>

        <DateTimeSelectorWithLeftAndRightArrows />
        <DataTableViewOptions table={table} />
      </div>
      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!query.isLoading ? (
              table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => {
                      if (!row.original.id) {
                        //If it's locked...
                        if (
                          row.original.date >
                          dayjs().endOf("day").add(1, "day").toDate()
                        )
                          return toast.warning(
                            t(
                              "You cannot unlock tasks that are scheduled for after tomorrow end of day",
                            ),
                          );
                        setUnlockMoreTasksCredenzaOpenWithDate(
                          row.original.date,
                        );
                        return;
                      }

                      setCurrentlyEditing(row.original.id);
                      setEditDetailsOpen(true);
                    }}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn({
                      "bg-muted/30": !row.original.id,
                    })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("No results")}
                  </TableCell>
                </TableRow>
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex h-full items-center justify-center">
                    <LuLoader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function DeleteCareTaskAlertDialog({
  task,
  open,
  setOpen,
}: {
  task: CareTask;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const t = useTranslations();

  const utils = api.useUtils();

  const mutation = api.app.kodixCare.careTask.deleteCareTask.useMutation({
    onError: trpcErrorToastDefault,
    onSettled: () => {
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete task")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("Are you sure you want to delete this task")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutation.mutate({
                id: task.id,
              });
              setOpen(false);
            }}
            className={cn(
              buttonVariants({
                variant: "destructive",
              }),
            )}
          >
            {t("Yes")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SyncTasksFromCalendarCredenzaButton() {
  const [syncCredenzaOpen, setSyncCredenzaOpen] = useState(false);

  const utils = api.useUtils();
  const syncCareTasksFromCalendarMutation =
    api.app.kodixCare.careTask.syncCareTasksFromCalendar.useMutation({
      onSuccess: () => {
        void utils.app.kodixCare.invalidate();
      },
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void utils.app.kodixCare.careTask.getCareTasks.invalidate();
        void utils.app.kodixCare.getCurrentShift.invalidate();
      },
    });
  const t = useTranslations();
  return (
    <Credenza open={syncCredenzaOpen} onOpenChange={setSyncCredenzaOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CredenzaTrigger asChild>
              <Button variant="secondary" size="sm" aria-label="Documentation">
                <LuArrowLeftRight className="size-4" />
              </Button>
            </CredenzaTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t("Sync tasks")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CredenzaContent className="sm:max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>{t("Sync tasks")}</CredenzaTitle>
          <CredenzaDescription>
            {t(
              "Substitue the tasks of this turn with the tasks from the calendar",
            )}
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2"></div>
        </div>
        <CredenzaFooter className="gap-3 sm:justify-between">
          <CredenzaClose asChild>
            <Button type="button" variant="secondary">
              {t("Close")}
            </Button>
          </CredenzaClose>
          <Button
            disabled={syncCareTasksFromCalendarMutation.isPending}
            onClick={async () => {
              await syncCareTasksFromCalendarMutation.mutateAsync();
              setSyncCredenzaOpen(false);
            }}
          >
            {syncCareTasksFromCalendarMutation.isPending ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              t("Sync tasks")
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

function AddCareTaskCredenzaButton() {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const t = useTranslations();

  const form = useForm({
    schema: ZCreateCareTaskInputSchema(t),
    defaultValues: {
      type: "NORMAL",
    },
  });
  const mutation = api.app.kodixCare.careTask.createCareTask.useMutation({
    onError: trpcErrorToastDefault,
    onSettled: () => {
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onSuccess: () => {
      setOpen(false);
    },
  });

  useEffect(() => {
    form.reset();
  }, [open, form]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button size={"sm"}>
          <LuPlus className="mr-2" />
          {t("apps.kodixCare.Add task")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              mutation.mutate(values);
              setOpen(false);
            })}
          >
            <CredenzaHeader>
              <CredenzaTitle>{t("apps.kodixCare.Add task")}</CredenzaTitle>
            </CredenzaHeader>
            <CredenzaBody className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Title")}</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <Input {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Date")}</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2">
                        <DateTimePicker24h
                          date={field.value}
                          setDate={(newDate) =>
                            field.onChange(newDate ?? new Date())
                          }
                          disabledDate={(date) => {
                            const thing = dayjs(date).isBefore(new Date());
                            if (!thing) console.log(date);

                            return thing;
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
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
                        <LuAlertCircle
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
                      {t.rich(
                        "Wether or not this task is considered critical or important",
                        {
                          settings: (chunks) => (
                            <Link
                              target="_blank"
                              href="/apps/kodixCare/settings"
                              className={
                                "text-primary underline-offset-4 hover:underline"
                              }
                            >
                              {chunks}
                            </Link>
                          ),
                        },
                      )}
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`${t("apps.kodixCare.Any information")}...`}
                        className="w-full"
                        rows={6}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CredenzaBody>
            <CredenzaFooter className="mt-6 justify-end">
              <Button disabled={mutation.isPending} type="submit">
                {t("Save")}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}

function UnlockMoreTasksCredenza() {
  const utils = api.useUtils();
  const t = useTranslations();
  const mutation = api.app.kodixCare.careTask.unlockMoreTasks.useMutation({
    onSuccess: () => {
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
    },
  });

  const {
    unlockMoreTasksCredenzaWithDateOpen,
    setUnlockMoreTasksCredenzaOpenWithDate,
  } = useCareTaskStore();

  return (
    <AlertDialog
      open={!!unlockMoreTasksCredenzaWithDateOpen}
      onOpenChange={(open) => {
        if (!open) setUnlockMoreTasksCredenzaOpenWithDate(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("apps.kodixCare.Unlock all tasks up until here")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "apps.kodixCare.This will unlock all tasks of this turn up until this task",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() => {
              if (!unlockMoreTasksCredenzaWithDateOpen) return;

              mutation.mutate({
                selectedTimestamp: unlockMoreTasksCredenzaWithDateOpen,
              });
              setUnlockMoreTasksCredenzaOpenWithDate(false);
            }}
          >
            {t("Yes")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditCareTaskCredenza({
  task,
  mutation,
  open,
  setOpen,
}: {
  task: CareTask;
  mutation: ReturnType<
    typeof api.app.kodixCare.careTask.editCareTask.useMutation
  >;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const t = useTranslations();

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

  useEffect(() => {
    form.reset(defaultValues);
  }, [task, open, form, defaultValues]);

  const format = useFormatter();

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              mutation.mutate({
                id: values.id,
                details: values.details,
                doneAt: values.doneAt,
              });
              setOpen(false);
            })}
          >
            <CredenzaHeader>
              <CredenzaTitle>{t("apps.kodixCare.Edit task")}</CredenzaTitle>
            </CredenzaHeader>
            <div className="mt-6 flex flex-col gap-2 rounded-md border p-4 text-foreground/80">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {task.title ?? ""}
                </span>
                {task.type === "CRITICAL" && (
                  <LuAlertCircle className="size-3 text-orange-400" />
                )}
              </div>

              <span className="line-clamp-3 text-xs font-semibold">
                {task.description ?? ""}
              </span>
              <span className="flex text-xs font-semibold">
                <RxCalendar className="mr-2 size-3 text-muted-foreground" />
                {format.dateTime(task.date, {
                  day: "2-digit",
                  month: "short",
                  hour: "numeric",
                  minute: "numeric",
                })}
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
            <CredenzaFooter className="mt-6 justify-end">
              <Button disabled={mutation.isPending} type="submit">
                {t("Save")}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}
