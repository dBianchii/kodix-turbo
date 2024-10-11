"use client";

import type {
  Column,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { CareTask } from "node_modules/@kdx/api/src/internal/calendarAndCareTaskCentral";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  LuAlertCircle,
  LuArrowLeftRight,
  LuCheck,
  LuChevronDown,
  LuChevronsUpDown,
  LuChevronUp,
  LuLoader2,
  LuPlus,
  LuText,
} from "react-icons/lu";
import {
  RxCalendar,
  RxChevronLeft,
  RxChevronRight,
  RxLockClosed,
} from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { useFormatter } from "@kdx/locales/next-intl";
import { useTranslations } from "@kdx/locales/next-intl/client";
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
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
  ZSaveCareTaskInputSchema,
} from "@kdx/validators/trpc/app/kodixCare";

import { DatePicker } from "~/app/[locale]/_components/date-picker";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

type CareTaskOrCalendarTask =
  RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];

const columnHelper = createColumnHelper<CareTaskOrCalendarTask>();

function HeaderSort({
  column,
  children,
  ...buttonAttributes
}: {
  column: Column<CareTaskOrCalendarTask>;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const className = "ml-2 size-4";
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      {...buttonAttributes}
    >
      {children}
      {column.getIsSorted() ? (
        column.getIsSorted() === "asc" ? (
          <LuChevronUp className={className} />
        ) : (
          <LuChevronDown className={className} />
        )
      ) : (
        <LuChevronsUpDown className={className} />
      )}
    </Button>
  );
}

export default function DataTableKodixCare({
  initialCareTasks,
  initialInput,
}: {
  initialCareTasks: RouterOutputs["app"]["kodixCare"]["getCareTasks"];
  initialInput: TGetCareTasksInputSchema;
}) {
  const [input, setInput] = useState(initialInput);
  const handleChangeInput = (date: Date) => {
    setInput({
      dateStart: dayjs(date).startOf("day").toDate(),
      dateEnd: dayjs(date).endOf("day").toDate(),
    });
    setEditDetailsOpen(false);
    setUnlockMoreTasksDialogOpen(false);
  };

  const query = api.app.kodixCare.getCareTasks.useQuery(input, {
    initialData:
      JSON.stringify(initialInput) === JSON.stringify(input) //? Only use initialData for the initial input
        ? initialCareTasks
        : undefined,
  });

  const utils = api.useUtils();
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);

  const [unlockMoreTasksDialogOpen, setUnlockMoreTasksDialogOpen] =
    useState(false);

  const [unlockUpUntil, setUnlockUpUntil] = useState<Date>(new Date());
  const [currentlyEditing, setCurrentlyEditing] = useState<
    CareTask["id"] | undefined
  >(undefined);

  const saveCareTaskMutation = api.app.kodixCare.saveCareTask.useMutation({
    onMutate: async (savedCareTask) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await utils.app.kodixCare.getCareTasks.cancel();
      // Snapshot the previous value
      const previousCareTasks = utils.app.kodixCare.getCareTasks.getData();

      // Optimistically update to the new value
      utils.app.kodixCare.getCareTasks.setData(input, (prev) => {
        return prev?.map((x) => {
          if (x.id === savedCareTask.id) {
            if (savedCareTask.doneAt !== undefined)
              x.doneAt = savedCareTask.doneAt;
            if (savedCareTask.doneByUserId !== undefined)
              x.doneByUserId = savedCareTask.doneByUserId;
            if (savedCareTask.details !== undefined)
              x.details = savedCareTask.details;
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
      utils.app.kodixCare.getCareTasks.setData(
        input,
        context?.previousCareTasks,
      );
      trpcErrorToastDefault(err);
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.app.kodixCare.getCareTasks.invalidate();
    },
  });

  const isCareTask = (id: CareTaskOrCalendarTask["id"]): id is string => !!id;
  const t = useTranslations();
  const format = useFormatter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <HeaderSort column={column} className="ml-8">
            {t("Title")}
          </HeaderSort>
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
          <HeaderSort column={column}>
            <RxCalendar className="mr-2 size-4" />
            {t("Date")}
          </HeaderSort>
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
            <HeaderSort column={column}>
              <LuCheck className="mr-2 size-4 text-green-400" />
              {t("Done at")}
            </HeaderSort>
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
          <HeaderSort column={column}>
            <LuText className="mr-2 size-4 text-orange-400" />
            {t("Details")}
          </HeaderSort>
        ),
        cell: (ctx) => <div>{ctx.row.original.details}</div>,
      }),
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <HeaderSort column={column}>
            <LuAlertCircle className="mr-2 size-4 text-orange-400" />
            {t("Critical")}
          </HeaderSort>
        ),
        cell: (ctx) => (
          <div className="flex max-w-sm items-center justify-center">
            {ctx.getValue() === "CRITICAL" ? (
              <LuAlertCircle className="mr-2 size-4 text-orange-400" />
            ) : null}
          </div>
        ),
      }),
    ],
    [format, saveCareTaskMutation, t],
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

  const leftArrowRef = useRef<HTMLButtonElement>(null);
  const rightArrowRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") leftArrowRef.current?.click();
      else if (e.key === "ArrowRight") rightArrowRef.current?.click();
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);

  return (
    <>
      {currentlyEditingCareTask && (
        <>
          <EditCareTaskDialog
            task={currentlyEditingCareTask}
            mutation={saveCareTaskMutation}
            open={editDetailsOpen}
            setOpen={setEditDetailsOpen}
          />
        </>
      )}

      <UnlockMoreTasksDialog
        unlockUpUntil={unlockUpUntil}
        open={unlockMoreTasksDialogOpen}
        setOpen={setUnlockMoreTasksDialogOpen}
      />
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <div className="flex gap-2 sm:mr-auto">
          <AddCareTaskDialog />
          <SyncTasksFromCalendarDialogButton />
        </div>
        <div className="flex gap-2">
          <Button
            ref={leftArrowRef}
            variant="ghost"
            onClick={() => {
              handleChangeInput(
                dayjs(input.dateStart).subtract(1, "days").toDate(),
              );
            }}
            className="h-10 w-10 p-3"
          >
            <RxChevronLeft />
          </Button>
          <DatePicker
            date={input.dateStart}
            setDate={(newDate) => handleChangeInput(dayjs(newDate).toDate())}
          />
          <Button
            ref={rightArrowRef}
            variant="ghost"
            onClick={() => {
              handleChangeInput(dayjs(input.dateStart).add(1, "days").toDate());
            }}
            className="h-10 w-10 p-3"
          >
            <RxChevronRight />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:ml-auto">
              {t("Columns")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
                        setUnlockUpUntil(row.original.date);
                        setUnlockMoreTasksDialogOpen(true);
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

function SyncTasksFromCalendarDialogButton() {
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const utils = api.useUtils();
  const syncCareTasksFromCalendarMutation =
    api.app.kodixCare.syncCareTasksFromCalendar.useMutation({
      onSuccess: () => {
        void utils.app.kodixCare.invalidate();
      },
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void utils.app.kodixCare.getCareTasks.invalidate();
        void utils.app.kodixCare.getCurrentShift.invalidate();
      },
    });
  const t = useTranslations();
  return (
    <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" aria-label="Documentation">
                <LuArrowLeftRight className="size-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t("Sync tasks")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Sync tasks")}</DialogTitle>
          <DialogDescription>
            {t(
              "Substitue the tasks of this turn with the tasks from the calendar",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2"></div>
        </div>
        <DialogFooter className="gap-3 sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("Close")}
            </Button>
          </DialogClose>
          <Button
            disabled={syncCareTasksFromCalendarMutation.isPending}
            onClick={async () => {
              await syncCareTasksFromCalendarMutation.mutateAsync();
              setSyncDialogOpen(false);
            }}
          >
            {syncCareTasksFromCalendarMutation.isPending ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              t("Sync tasks")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCareTaskDialog() {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const form = useForm({
    schema: ZCreateCareTaskInputSchema,
    defaultValues: {
      type: "NORMAL",
    },
  });
  const mutation = api.app.kodixCare.createCareTask.useMutation({
    onError: trpcErrorToastDefault,
    onSettled: () => {
      void utils.app.kodixCare.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onSuccess: () => {
      setOpen(false);
    },
  });
  const t = useTranslations();

  useEffect(() => {
    form.reset();
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <LuPlus className="mr-2" />
          {t("apps.kodixCare.Add task")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              mutation.mutate(values);
              setOpen(false);
            })}
          >
            <DialogHeader>
              <DialogTitle>{t("apps.kodixCare.Add task")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                        <DateTimePicker
                          date={field.value}
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
            </div>
            <DialogFooter className="mt-6 justify-end">
              <Button disabled={mutation.isPending} type="submit">
                {t("Save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function UnlockMoreTasksDialog({
  unlockUpUntil,
  open,
  setOpen,
}: {
  unlockUpUntil: Date;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const t = useTranslations();
  const mutation = api.app.kodixCare.unlockMoreTasks.useMutation({
    onSuccess: () => {
      void utils.app.kodixCare.getCareTasks.invalidate();
    },
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
              mutation.mutate({
                selectedTimestamp: unlockUpUntil,
              });
              setOpen(false);
            }}
          >
            {t("Yes")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditCareTaskDialog({
  task,
  mutation,
  open,
  setOpen,
}: {
  task: CareTask;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
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
    schema: ZSaveCareTaskInputSchema.pick({
      id: true,
      details: true,
      doneAt: true,
    }),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [task, open, form, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
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
            <DialogHeader>
              <DialogTitle>{t("apps.kodixCare.Edit task")}</DialogTitle>
            </DialogHeader>
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
            <DialogFooter className="mt-6 justify-end">
              <Button disabled={mutation.isPending} type="submit">
                {t("Save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
