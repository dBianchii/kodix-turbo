"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { LuLoader2 } from "react-icons/lu";
import { RxChevronLeft, RxChevronRight, RxLockClosed } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { format } from "@kdx/date-fns";
import { useI18n } from "@kdx/locales/client";
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
import { cn } from "@kdx/ui/utils";
import { ZSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { DatePicker } from "~/app/[locale]/_components/date-picker";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

type CareTask = RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];
const columnHelper = createColumnHelper<CareTask>();

const DATE_FORMAT = "PPP, HH:mm";

export default function DataTableKodixCare({
  initialCareTasks,
  initialInput,
  session,
}: {
  initialCareTasks: RouterOutputs["app"]["kodixCare"]["getCareTasks"];
  initialInput: TGetCareTasksInputSchema;
  session: Session;
}) {
  const [input, setInput] = useState(initialInput);

  const { data } = api.app.kodixCare.getCareTasks.useQuery(input, {
    refetchOnMount: false,
    initialData: initialCareTasks,
  });
  const utils = api.useUtils();
  const [saveTaskAsDoneDialogOpen, setSaveTaskAsDoneDialogOpen] =
    useState(false);
  const [saveTaskAsNotDoneDialogOpen, setSaveTaskAsNotDoneDialogOpen] =
    useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [unlockMoreTasksDialogOpen, setUnlockMoreTasksDialogOpen] =
    useState(false);
  const [currentlyEditing, setCurrentlyEditing] = useState<string | undefined>(
    undefined,
  );

  const mutation = api.app.kodixCare.saveCareTask.useMutation({
    onMutate: async (savedCareTask) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await utils.app.kodixCare.getCareTasks.cancel();
      // Snapshot the previous value
      const previousCareTasks = utils.app.kodixCare.getCareTasks.getData();

      // Optimistically update to the new value
      utils.app.kodixCare.getCareTasks.setData(initialInput, (prev) => {
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
        initialInput,
        context?.previousCareTasks,
      );
      trpcErrorToastDefault(err);
    },
    // Always refetch after error or success:
    onSettled: () => {
      void utils.app.kodixCare.getCareTasks.invalidate();
    },
  });
  const t = useI18n();

  const columns = [
    columnHelper.accessor("title", {
      header: () => <span className="ml-8">{t("Title")}</span>,
      cell: (ctx) => (
        <div className="flex flex-row items-center">
          <div className="w-8">
            {ctx.row.original.id.length > 0 ? (
              <Checkbox
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentlyEditing(ctx.row.original.id);
                  if (ctx.row.original.doneAt === null)
                    return setSaveTaskAsDoneDialogOpen(true);

                  setSaveTaskAsNotDoneDialogOpen(true);
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
      ),
    }),
    columnHelper.accessor("doneAt", {
      header: () => t("Date"),
      cell: (ctx) => <div>{format(ctx.row.original.date, DATE_FORMAT)}</div>,
    }),
    columnHelper.accessor("doneAt", {
      header: () => t("Done at"),
      cell: (ctx) => {
        if (!ctx.row.original.id) return null;
        if (!ctx.row.original.doneAt) return null;
        return <div>{format(ctx.row.original.doneAt, DATE_FORMAT)}</div>;
      },
    }),
    columnHelper.accessor("details", {
      header: () => t("Details"),
      cell: (ctx) => <div className="max-w-sm">{ctx.row.original.details}</div>,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentlyEditingCareTask = useMemo(() => {
    return data?.find((x) => x.id === currentlyEditing);
  }, [currentlyEditing, data]);

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
            session={session}
          />
          <SaveTaskAsNotDoneDialog
            task={currentlyEditingCareTask}
            mutation={mutation}
            open={saveTaskAsNotDoneDialogOpen}
            setOpen={setSaveTaskAsNotDoneDialogOpen}
          />
          <UnlockMoreTasksDialog
            task={currentlyEditingCareTask}
            mutation={mutation}
            open={unlockMoreTasksDialogOpen}
            setOpen={setUnlockMoreTasksDialogOpen}
          />
        </>
      )}
      <div className="flex justify-center gap-2">
        <Button
          ref={leftArrowRef}
          variant="ghost"
          onClick={() => {
            setInput((prev) => ({
              dateStart: dayjs(prev.dateStart).add(-1, "days").toDate(),
              dateEnd: dayjs(prev.dateEnd).add(-1, "days").toDate(),
            }));
          }}
          className="h-10 w-10 p-3"
        >
          <RxChevronLeft />
        </Button>
        <DatePicker
          date={input.dateEnd}
          setDate={(newDate) =>
            setInput({
              dateStart: dayjs(newDate).startOf("day").toDate(),
              dateEnd: dayjs(newDate).endOf("day").toDate(),
            })
          }
        />
        <Button
          ref={rightArrowRef}
          variant="ghost"
          onClick={() => {
            setInput((prev) => ({
              dateStart: dayjs(prev.dateStart).add(1, "days").toDate(),
              dateEnd: dayjs(prev.dateEnd).add(1, "days").toDate(),
            }));
          }}
          className="h-10 w-10 p-3"
        >
          <RxChevronRight />
        </Button>
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
            {table.getRowModel().rows?.length ? (
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

                      setCurrentlyEditing(row.original.id);
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
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function UnlockMoreTasksDialog({
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
  const t = useI18n();
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
              toast.promise(
                mutation.mutateAsync({
                  id: task.id,
                  doneAt: null,
                }),
                {
                  loading: `${t("Saving")}...`,
                  success: () => {
                    setOpen(false);
                    return t("apps.kodixCare.Task marked as not done");
                  },
                },
              );
            }}
          >
            {mutation.isPending ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              t("Yes")
            )}
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
  const t = useI18n();

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
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              toast.promise(
                mutation.mutateAsync({
                  id: values.id,
                  details: values.details,
                  doneAt: values.doneAt,
                }),
                {
                  loading: `${t("Updating")}...`,
                  success: () => {
                    setOpen(false);
                    return t("apps.kodixCare.Task updated");
                  },
                },
              );
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
                          field.onChange(e.target.value ?? undefined);
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
                {mutation.isPending && (
                  <LuLoader2 className="mr-2 size-5 animate-spin" />
                )}
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
  session,
}: {
  task: CareTask;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
  open: boolean;
  setOpen: (open: boolean) => void;
  session: Session;
}) {
  //If you find a better way to reset all fields to the default on open feel free to do it.
  const defaultValues = useMemo(
    () => ({
      id: task.id,
      details: task.details,
      doneAt: new Date(),
      doneByUserId: session.user.id,
    }),
    [task, session.user.id],
  );

  const form = useForm({
    schema: ZSaveCareTaskInputSchema,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const t = useI18n();

  return (
    <div className="p-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                toast.promise(
                  mutation.mutateAsync({
                    ...values,
                    id: task.id,
                  }),
                  {
                    loading: `${t("Saving")}...`,
                    success: () => {
                      form.reset();
                      setOpen(false);
                      return t("apps.kodixCare.Task marked as done");
                    },
                  },
                );
              })}
            >
              <DialogHeader>
                <DialogTitle>
                  {t("apps.kodixCare.Mark task as done")}
                </DialogTitle>
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
                  {mutation.isPending ? (
                    <LuLoader2 className="size-4 animate-spin" />
                  ) : (
                    t("Save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SaveTaskAsNotDoneDialog({
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
  const t = useI18n();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("apps.kodixCare.Are you sure")}</DialogTitle>
        </DialogHeader>
        <DialogFooter className="mt-6 justify-end">
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              toast.promise(
                mutation.mutateAsync({
                  id: task.id,
                  doneAt: null,
                }),
                {
                  loading: `${t("Saving")}...`,
                  success: () => {
                    setOpen(false);
                    return t("apps.kodixCare.Task marked as not done");
                  },
                },
              );
            }}
          >
            {mutation.isPending ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              t("apps.kodixCare.Mark task as not done")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
