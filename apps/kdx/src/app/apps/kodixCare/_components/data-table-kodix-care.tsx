"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { LuLoader2 } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
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
  const [saveTaskAsDoneDialogOpen, setSaveTaskAsDoneDialogOpen] =
    useState(false);
  const [saveTaskAsNotDoneDialogOpen, setSaveTaskAsNotDoneDialogOpen] =
    useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
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
      header: () => <span className="ml-8">Title</span>,
      cell: (ctx) => (
        <div className="flex flex-row items-center">
          <div className="w-8">
            {/* If it is a real caretask from caretask table and it was edited before... */}
            {/* {ctx.row.original.id.length > 0 && ctx.row.original.updatedAt && (
              <div className="ml-2">
                <Checkbox
                  checked={!!ctx.row.original.doneAt}
                  className="size-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentlyEditing(ctx.row.original.id);
                    setEditDoneOpen(true);
                  }}
                />
              </div>
            )} */}
            {/* If it is a real caretask from caretask table and it was never edited before... */}
            {ctx.row.original.id.length > 0 && (
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
      cell: (ctx) => {
        if (!ctx.row.original.id) return null;
        if (!ctx.row.original.doneAt) return null;
        return format(ctx.row.original.doneAt, "LLL. dd - h:mm");
      },
    }),
    columnHelper.accessor("details", {
      header: () => "Details",
      cell: (ctx) => ctx.row.original.details,
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

  return (
    <>
      {currentlyEditingCareTask && (
        <>
          {/* <EditDoneCheckBoxDialog
            task={currentlyEditingCareTask}
            mutation={mutation}
            open={editDoneOpen}
            setOpen={setEditDoneOpen}
          /> */}
          {/* <EditCareTaskDialog
            task={currentlyEditingCareTask}
            mutation={mutation}
            open={editDetailsOpen}
            setOpen={setEditDetailsOpen}
          /> */}
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
            session={session}
          />
        </>
      )}
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
                  onClick={() => {
                    if (!row.original.id) return;

                    setCurrentlyEditing(row.original.id);
                    setEditDetailsOpen(true);
                  }}
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
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
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
  const form = useForm({
    schema: ZSaveCareTaskInputSchema.pick({
      id: true,
      details: true,
      doneAt: true,
    }),
    defaultValues: {
      id: task.id,
      details: task.details,
    },
  });

  useEffect(() => {
    form.reset({
      id: task.id,
      details: task.details,
      doneAt: task.doneAt,
    });
  }, [task, open, form]);

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
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
                  loading: "Updating...",
                  success: () => {
                    setOpen(false);
                    return `Task updated!`;
                  },
                },
              );
            })}
          >
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="doneAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Done at</FormLabel>
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
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any information..."
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
            <DialogFooter className="mt-6 gap-3 sm:justify-between">
              <DialogClose asChild>
                <Button variant={"ghost"} disabled={mutation.isPending}>
                  Close
                </Button>
              </DialogClose>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending && (
                  <LuLoader2 className="mr-2 size-5 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// function EditDoneCheckBoxDialog({
//   task,
//   mutation,
//   open,
//   setOpen,
// }: {
//   task: CareTask;
//   mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
//   open: boolean;
//   setOpen: (open: boolean) => void;
// }) {
//   const form = useForm({
//     schema: ZSaveCareTaskInputSchema.pick({
//       id: true,
//       details: true,
//       doneAt: true,
//     }),
//     defaultValues: {
//       id: task.id,
//       details: task.details,
//     },
//   });

//   useEffect(() => {
//     form.reset({
//       id: task.id,
//       doneAt: task.doneAt,
//     });
//   }, [task, open, form]);

//   if (!task) return null;

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(open) => {
//         setOpen(open);
//       }}
//     >
//       <DialogContent>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(async (values) => {
//               toast.promise(
//                 mutation.mutateAsync({
//                   id: values.id,
//                   details: values.details,
//                   doneAt: values.doneAt,
//                 }),
//                 {
//                   loading: "Updating...",
//                   success: () => {
//                     setOpen(false);
//                     return `Task updated!`;
//                   },
//                 },
//               );
//             })}
//           >
//             <DialogHeader>
//               <DialogTitle>
//                 {task.doneAt ? (
//                   <>Mark task as not done?</>
//                 ) : (
//                   <>Mark task as done?</>
//                 )}
//               </DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <FormField
//                 control={form.control}
//                 name="doneAt"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <div className="flex flex-row gap-2">
//                         <DateTimePicker
//                           date={field.value ?? undefined}
//                           setDate={(newDate) =>
//                             field.onChange(newDate ?? new Date())
//                           }
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage className="w-full" />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="details"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Details</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Any information..."
//                         className="w-full"
//                         rows={6}
//                         {...field}
//                         onChange={(e) => {
//                           field.onChange(e.target.value ?? undefined);
//                         }}
//                         value={field.value ?? undefined}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <DialogFooter className="mt-6 gap-3 sm:justify-between">
//               <DialogClose asChild>
//                 <Button variant={"ghost"} disabled={mutation.isPending}>
//                   Close
//                 </Button>
//               </DialogClose>
//               <Button disabled={mutation.isPending} type="submit">
//                 {mutation.isPending && (
//                   <LuLoader2 className="mr-2 size-5 animate-spin" />
//                 )}
//                 Save
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
  const form = useForm({
    schema: ZSaveCareTaskInputSchema,
    defaultValues: {
      id: task.id,
      details: task.details,
      doneAt: new Date(),
      doneByUserId: session.user.id,
    },
  });

  useEffect(() => {
    form.reset();
  }, [open, form, task]);

  return (
    <div className="p-1">
      <Dialog
        open={open}
        onOpenChange={(open) => {
          form.reset();
          form.setValue("doneAt", new Date());
          form.setValue("details", task.details);
          form.setValue("doneByUserId", session.user.id);
          setOpen(open);
        }}
      >
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                toast.promise(mutation.mutateAsync(values), {
                  loading: "Saving...",
                  success: () => {
                    form.reset();
                    setOpen(false);
                    return `Task marked as complete!`;
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
                  <Button variant={"ghost"} disabled={mutation.isPending}>
                    Close
                  </Button>
                </DialogClose>
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? (
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

function SaveTaskAsNotDoneDialog({
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
  return (
    <div className="p-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to mark this task as not done?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:justify-between">
            <DialogClose asChild>
              <Button variant={"ghost"} disabled={mutation.isPending}>
                Close
              </Button>
            </DialogClose>
            <Button
              disabled={mutation.isPending}
              onClick={() => {
                toast.promise(
                  mutation.mutateAsync({
                    id: task.id,
                    doneAt: null,
                  }),
                  {
                    loading: "Saving...",
                    success: () => {
                      setOpen(false);
                      return `Task marked as not done!`;
                    },
                  },
                );
              }}
            >
              {mutation.isPending ? (
                <LuLoader2 className="size-4 animate-spin" />
              ) : (
                <>Mark task as not done</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
