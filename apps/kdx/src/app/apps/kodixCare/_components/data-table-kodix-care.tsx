"use client";

import type { CellContext } from "@tanstack/react-table";
import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { LuLoader2 } from "react-icons/lu";
import { RxPencil1 } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
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
  Form,
  FormControl,
  FormField,
  FormItem,
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

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

type CareTask = RouterOutputs["app"]["kodixCare"]["getCareTasks"][number];

const columnHelper = createColumnHelper<CareTask>();

export default function DataTableKodixCare({
  initialCareTasks,
  input,
  session,
}: {
  initialCareTasks: RouterOutputs["app"]["kodixCare"]["getCareTasks"];
  input: TGetCareTasksInputSchema;
  session: Session;
}) {
  const { data } = api.app.kodixCare.getCareTasks.useQuery(input, {
    refetchOnMount: false,
    initialData: initialCareTasks,
  });
  const utils = api.useUtils();

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

  const columns = [
    columnHelper.accessor("title", {
      header: () => null,
      cell: (ctx) => (
        <div className="flex flex-row items-center">
          <div className="w-8">
            {/* If it is a real caretask from caretask table and it was edited before... */}
            {ctx.row.original.id.length > 0 && ctx.row.original.updatedAt && (
              <div className="ml-2">
                <Checkbox
                  checked={!!ctx.row.original.doneAt}
                  onCheckedChange={() => {
                    mutation.mutate({
                      id: ctx.row.original.id,
                      doneByUserId: ctx.row.original.doneAt
                        ? null
                        : session.user.id,
                      doneAt: ctx.row.original.doneAt ? null : new Date(),
                    });
                  }}
                  className="size-5"
                />
              </div>
            )}
            {/* If it is a real caretask from caretask table and it was never edited before... */}
            {ctx.row.original.id.length > 0 && !ctx.row.original.updatedAt && (
              <CareTaskNotYetDoneCheckboxDialog
                info={ctx}
                session={session}
                mutation={mutation}
              />
            )}
          </div>
          <span className="pl-2 font-semibold">{ctx.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("date", {
      header: () => "Date",
      cell: (ctx) => format(ctx.row.original.date, "LLL. dd - h:mm"),
    }),
    columnHelper.accessor("doneAt", {
      header: () => "Done at",
      cell: function Cell(ctx) {
        const [date, setDate] = useState(ctx.row.original.doneAt ?? undefined);

        if (!ctx.row.original.id) return null;

        return (
          <DateTimePicker
            size="sm"
            onOpenChange={(open) => {
              if (!open) {
                if (
                  dayjs(date ?? undefined).isSame(
                    ctx.row.original.doneAt ?? undefined,
                  )
                )
                  return;
                //Send request whenever dialog is closed
                mutation.mutate({
                  id: ctx.row.original.id,
                  doneAt: date ?? null,
                });
              }
            }}
            date={date}
            setDate={(newDate) => setDate(newDate)}
          />
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: function Cell(ctx) {
        const [details, setDetails] = useState(ctx.row.original.details!);

        if (!ctx.row.original.id) return null;

        return (
          <div className="flex flex-row">
            <Dialog
              onOpenChange={() => {
                setDetails(ctx.row.original.details!);
              }}
            >
              <DialogTrigger asChild>
                <Button variant={"ghost"} className="ml-auto">
                  <RxPencil1 className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add notes</DialogTitle>
                  <DialogDescription>
                    Add custom notes to this task
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="Any information..."
                    className="w-full"
                    rows={6}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>
                <DialogFooter className="mt-6 gap-3 sm:justify-between">
                  <DialogClose asChild>
                    <Button variant={"ghost"} disabled={mutation.isPending}>
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={mutation.isPending}
                    onClick={() => {
                      mutation.mutate({
                        id: ctx.row.original.id,
                        details,
                      });
                    }}
                  >
                    {mutation.isPending && (
                      <LuLoader2 className="mr-2 size-5 animate-spin" />
                    )}
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
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
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  {
                    "bg-muted/30": !row.original.id,
                    "hover:bg-muted/30": !row.original.id,
                  },
                  "h-12",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
function CareTaskNotYetDoneCheckboxDialog({
  info,
  session,
  mutation,
}: {
  info: CellContext<CareTask & { id: string }, unknown>;
  session: Session;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
}) {
  const form = useForm({
    schema: ZSaveCareTaskInputSchema,
    defaultValues: {
      id: info.row.original.id,
      doneAt: new Date(),
      doneByUserId: session.user.id,
    },
  });

  return (
    <div className="p-1">
      <Dialog onOpenChange={() => form.reset()}>
        <DialogTrigger asChild>
          <Checkbox checked={false} className="size-5" />
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                mutation.mutate(values, {
                  onSuccess: () => {
                    form.reset();
                    toast.success("Task completed!");
                  },
                  onError: (error) => {
                    trpcErrorToastDefault(error);
                  },
                });
              })}
            >
              <DialogHeader>
                <DialogTitle>Add information to conclude this task</DialogTitle>
                <DialogDescription>
                  Add the date and time of completion and details about the
                  procedure.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="doneAt"
                  render={({ field }) => (
                    <FormItem>
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
                          placeholder="Any information..."
                          className="w-full"
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-6 gap-3 sm:justify-between">
                <DialogClose asChild>
                  <Button
                    variant={"ghost"}
                    disabled={form.formState.isSubmitting}
                  >
                    Close
                  </Button>
                </DialogClose>
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting ? (
                    <LuLoader2 className="size-4 animate-spin" />
                  ) : (
                    <>Save</>
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
