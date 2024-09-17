"use client";

import type {
  Column,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { CareTask } from "node_modules/@kdx/api/dist/api/src/routers/app/kodixCare/getCareTasks.handler";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  LuCheck,
  LuChevronDown,
  LuChevronsUpDown,
  LuChevronUp,
  LuLoader2,
  LuText,
} from "react-icons/lu";
import {
  RxCalendar,
  RxChevronLeft,
  RxChevronRight,
  RxLockClosed,
} from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { useFormatter } from "@kdx/locales/next-intl";
import { useTranslations } from "@kdx/locales/next-intl/client";
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "@kdx/ui/toast";
import { ZSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";

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
  user,
}: {
  initialCareTasks: RouterOutputs["app"]["kodixCare"]["getCareTasks"];
  initialInput: TGetCareTasksInputSchema;
  user: User;
}) {
  const [input, setInput] = useState(initialInput);
  const handleChangeInput = (date: Date) => {
    setInput({
      dateStart: dayjs(date).startOf("day").toDate(),
      dateEnd: dayjs(date).endOf("day").toDate(),
    });
    setSaveTaskAsDoneDialogOpen(false);
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
  const [saveTaskAsDoneDialogOpen, setSaveTaskAsDoneDialogOpen] =
    useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [unlockMoreTasksDialogOpen, setUnlockMoreTasksDialogOpen] =
    useState(false);
  const [unlockUpUntil, setUnlockUpUntil] = useState<Date>(new Date());
  const [currentlyEditing, setCurrentlyEditing] = useState<
    CareTask["id"] | undefined
  >(undefined);

  const mutation = api.app.kodixCare.saveCareTask.useMutation({
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

                      if (!ctx.row.original.doneAt)
                        return setSaveTaskAsDoneDialogOpen(true);

                      mutation.mutate({
                        id: ctx.row.original.id,
                        doneAt: null,
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
          <HeaderSort column={column} className="ml-8">
            <LuText className="mr-2 size-4 text-orange-400" />
            {t("Details")}
          </HeaderSort>
        ),
        cell: (ctx) => (
          <div className="max-w-sm">{ctx.row.original.details}</div>
        ),
      }),
    ],
    [format, mutation, t],
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
            mutation={mutation}
            open={editDetailsOpen}
            setOpen={setEditDetailsOpen}
          />
          <SaveTaskAsDoneDialog
            task={currentlyEditingCareTask}
            mutation={mutation}
            open={saveTaskAsDoneDialogOpen}
            setOpen={setSaveTaskAsDoneDialogOpen}
            user={user}
          />
        </>
      )}

      <UnlockMoreTasksDialog
        unlockUpUntil={unlockUpUntil}
        open={unlockMoreTasksDialogOpen}
        setOpen={setUnlockMoreTasksDialogOpen}
      />

      <div className="flex justify-center gap-2">
        <Button variant="outline" className="invisible mr-auto">
          {t("Columns")}
        </Button>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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
            {!query.isFetching ? (
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
                            "You cannot unlock tasks that are scheduled for after tomorrow end of day",
                          );
                        setUnlockUpUntil(row.original.date);
                        setUnlockMoreTasksDialogOpen(true);
                        return;
                      }

                      setCurrentlyEditing(row.original.id);
                      if (row.original.updatedAt) setEditDetailsOpen(true); //? Only able
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

function SaveTaskAsDoneDialog({
  task,
  mutation,
  open,
  setOpen,
  user,
}: {
  task: CareTask;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}) {
  //If you find a better way to reset all fields to the default on open feel free to do it.
  const defaultValues = useMemo(
    () => ({
      id: task.id,
      details: task.details,
      doneAt: new Date(),
      doneByUserId: user.id,
    }),
    [task, user.id],
  );

  const form = useForm({
    schema: ZSaveCareTaskInputSchema,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              mutation.mutate({
                ...values,
                id: task.id,
              });
              setOpen(false);
            })}
          >
            <DialogHeader>
              <DialogTitle>{t("apps.kodixCare.Mark task as done")}</DialogTitle>
              <DialogDescription>
                {t(
                  "apps.kodixCare.Please inform the date and time of completion",
                )}
              </DialogDescription>
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
                          {...field}
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
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? undefined}
                        placeholder={`${t("apps.kodixCare.Any information")}...`}
                        className="w-full"
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage className="w-full" />
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
