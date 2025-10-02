"use client";

import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type { CareTask } from "node_modules/@kdx/api/src/internal/calendarAndCareTaskCentral";
import { useEffect, useMemo, useState } from "react";
import dayjs from "@kodix/dayjs";
import { cn } from "@kodix/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kodix/ui/alert-dialog";
import { Button, buttonVariants } from "@kodix/ui/button";
import { Checkbox } from "@kodix/ui/checkbox";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kodix/ui/credenza";
import { DataTableColumnHeader } from "@kodix/ui/data-table/data-table-column-header";
import { DataTableViewOptions } from "@kodix/ui/data-table/data-table-view-options";
import { DateTimePicker } from "@kodix/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kodix/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { Textarea } from "@kodix/ui/textarea";
import { toast } from "@kodix/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kodix/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import {
  LuArrowLeftRight,
  LuCalendar,
  LuCheck,
  LuCircleAlert,
  LuLoaderCircle,
  LuLock,
  LuPlus,
  LuText,
  LuTrash,
} from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";
import { create } from "zustand";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { Link } from "~/i18n/routing";

import { DateTimeSelectorWithLeftAndRightArrows } from "./date-time-selector-with-left-and-right-buttons";
import { EditCareTaskCredenza } from "./edit-care-task-credenza";
import { useSaveCareTaskMutation } from "./hooks";

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

export default function DataTableKodixCare({ user }: { user: User }) {
  const trpc = useTRPC();
  const t = useTranslations();
  const format = useFormatter();
  const {
    input,
    setEditDetailsOpen,
    editDetailsOpen,
    currentlyEditing,
    setCurrentlyEditing,
    setUnlockMoreTasksCredenzaOpenWithDate,
  } = useCareTaskStore();

  const saveCareTaskMutation = useSaveCareTaskMutation();
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);

  const query = useQuery(
    trpc.app.kodixCare.careTask.getCareTasks.queryOptions(input),
  );
  const data = useMemo(() => query.data ?? [], [query.data]);

  const isCareTask = (id: CareTaskOrCalendarTask["id"]): id is string => !!id;
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <DataTableColumnHeader className="ml-8" column={column}>
            {t("Title")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <div className="w-8">
                {isCareTask(ctx.row.original.id) ? (
                  <Checkbox
                    checked={!!ctx.row.original.doneAt}
                    className="size-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!ctx.row.original.id) return; //Will never happen. its just to make ts happy
                      setCurrentlyEditing(ctx.row.original.id);

                      saveCareTaskMutation.mutate({
                        id: ctx.row.original.id,
                        doneAt: ctx.row.original.doneAt ? null : new Date(),
                      });
                    }}
                  />
                ) : (
                  <LuLock className="size-4" />
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
            <LuCalendar className="mr-2 size-4" />
            {t("Date")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => (
          <div>{format.dateTime(ctx.row.original.date, "shortWithHours")}</div>
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
              {format.dateTime(ctx.row.original.doneAt, "shortWithHours")}
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
            <LuCircleAlert className="mr-2 size-4 text-orange-400" />
            {t("Critical")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => (
          <div className="flex max-w-sm items-center justify-center">
            {ctx.getValue() === "CRITICAL" ? (
              <LuCircleAlert className="mr-2 size-4 text-orange-400" />
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
                  <Button className="h-8 w-8 p-0" variant="ghost">
                    <span className="sr-only">Open menu</span>
                    <RxDotsHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCareTask(ctx.row.original.id)) return; //?Will never happen. its just to make ts happy

                      setCurrentlyEditing(ctx.row.original.id);
                      setDeleteTaskOpen(true);
                    }}
                  >
                    <LuTrash className="mr-2 size-4" />
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
    data,
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
            mutation={saveCareTaskMutation}
            open={editDetailsOpen}
            setOpen={setEditDetailsOpen}
            task={currentlyEditingCareTask}
            user={user}
          />
          <DeleteCareTaskAlertDialog
            open={deleteTaskOpen}
            setOpen={setDeleteTaskOpen}
            task={currentlyEditingCareTask}
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
            {query.isLoading ? (
              <TableRow>
                <TableCell className="h-24" colSpan={columns.length}>
                  <div className="flex h-full items-center justify-center">
                    <LuLoaderCircle className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cn({
                    "bg-muted/30": !row.original.id,
                  })}
                  data-state={row.getIsSelected() && "selected"}
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
                      setUnlockMoreTasksCredenzaOpenWithDate(row.original.date);
                      return;
                    }

                    setCurrentlyEditing(row.original.id);
                    setEditDetailsOpen(true);
                  }}
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
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  {t("No results")}
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
  const trpc = useTRPC();
  const t = useTranslations();

  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.app.kodixCare.careTask.deleteCareTask.mutationOptions({
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
    }),
  );

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
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
            className={cn(
              buttonVariants({
                variant: "destructive",
              }),
            )}
            onClick={() => {
              mutation.mutate({
                id: task.id,
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

function SyncTasksFromCalendarCredenzaButton() {
  const trpc = useTRPC();
  const [syncCredenzaOpen, setSyncCredenzaOpen] = useState(false);

  const queryClient = useQueryClient();
  const syncCareTasksFromCalendarMutation = useMutation(
    trpc.app.kodixCare.careTask.syncCareTasksFromCalendar.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.app.kodixCare.pathFilter());
      },
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
    }),
  );
  const t = useTranslations();
  return (
    <Credenza onOpenChange={setSyncCredenzaOpen} open={syncCredenzaOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CredenzaTrigger asChild>
              <Button aria-label="Documentation" size="sm" variant="secondary">
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
          <div className="grid flex-1 gap-2" />
        </div>
        <CredenzaFooter className="gap-3 sm:justify-between">
          <CredenzaClose asChild>
            <Button type="button" variant="secondary">
              {t("Close")}
            </Button>
          </CredenzaClose>
          <Button
            loading={syncCareTasksFromCalendarMutation.isPending}
            onClick={async () => {
              await syncCareTasksFromCalendarMutation.mutateAsync();
              setSyncCredenzaOpen(false);
            }}
          >
            {t("Sync tasks")}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

function AddCareTaskCredenzaButton() {
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const t = useTranslations();

  const form = useForm({
    schema: ZCreateCareTaskInputSchema(t),
    defaultValues: {
      type: "NORMAL",
      title: "",
      description: "",
    },
  });
  const mutation = useMutation(
    trpc.app.kodixCare.careTask.createCareTask.mutationOptions({
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
      onSuccess: () => {
        setOpen(false);
      },
    }),
  );

  useEffect(() => {
    form.reset();
  }, [open, form]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
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
                          onChange={(newDate) =>
                            field.onChange(newDate ?? new Date())
                          }
                          value={field.value}
                          // disabledDate={(date) => {
                          //   const thing = dayjs(date).isBefore(new Date());
                          //   if (!thing) console.log(date);

                          //   return thing;
                          // }}
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
                      {t.rich(
                        "Wether or not this task is considered critical or important",
                        {
                          settings: (chunks) => (
                            <Link
                              className={
                                "text-primary underline-offset-4 hover:underline"
                              }
                              href="/apps/kodixCare/settings"
                              target="_blank"
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
                        className="w-full"
                        placeholder={`${t("apps.kodixCare.Any information")}...`}
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

function UnlockMoreTasksCredenza() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const mutation = useMutation(
    trpc.app.kodixCare.careTask.unlockMoreTasks.mutationOptions({
      onError: trpcErrorToastDefault,
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
      },
    }),
  );

  const {
    unlockMoreTasksCredenzaWithDateOpen,
    setUnlockMoreTasksCredenzaOpenWithDate,
  } = useCareTaskStore();

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) setUnlockMoreTasksCredenzaOpenWithDate(false);
      }}
      open={!!unlockMoreTasksCredenzaWithDateOpen}
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
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
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
