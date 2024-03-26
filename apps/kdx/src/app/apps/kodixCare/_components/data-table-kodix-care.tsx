"use client";

import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { IoMdTime } from "react-icons/io";
import { LuLoader2 } from "react-icons/lu";
import { RxPencil1 } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import type { FixedColumnsType } from "@kdx/ui/data-table";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import { DataTable } from "@kdx/ui/data-table";
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
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Textarea } from "@kdx/ui/textarea";
import { TimePickerInput } from "@kdx/ui/time-picker-input";
import { toast } from "@kdx/ui/toast";
import { ZSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { DatePicker } from "~/app/_components/date-picker";
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
  const { data, isLoading } = api.app.kodixCare.getCareTasks.useQuery(input, {
    refetchOnMount: false,
    initialData: initialCareTasks,
  });
  const utils = api.useUtils();

  const mutation = api.app.kodixCare.saveCareTask.useMutation({
    onSuccess: () => {
      void utils.app.kodixCare.getCareTasks.invalidate();
    },
  });

  const columns = [
    columnHelper.accessor("title", {
      header: () => <div className="pl-2">Title</div>,
      cell: (info) => <span className="pl-2 ">{info.getValue()}</span>,
    }),
    columnHelper.accessor("description", {
      header: () => <div>Description</div>,
      cell: (info) => <p className="">{info.getValue()}</p>,
    }),
    columnHelper.accessor("date", {
      header: () => <div>Date and time</div>,
      cell: (info) => (
        <div className="flex w-60 flex-row gap-3 pl-2">
          <div className="flex flex-col items-start">
            <span className="">
              {dayjs(info.getValue()).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: function Cell(info) {
        return (
          <div className="flex flex-row items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"ghost"}>
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
                  />
                </div>
                <DialogFooter className="mt-6 gap-3 sm:justify-between">
                  <DialogClose asChild>
                    <Button variant={"ghost"}>Close</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* If it is a real caretask from caretask table and it was edited before... */}
            {info.row.original.id.length > 0 && info.row.original.updatedAt && (
              <CheckBoxAlterDoneDialog info={info} mutation={mutation} />
            )}
            {/* If it is a real caretask from caretask table and it was never edited before... */}
            {info.row.original.id.length > 0 &&
              !info.row.original.updatedAt && (
                <CareTaskNotYetDoneCheckboxDialog
                  info={info}
                  session={session}
                  mutation={mutation}
                />
              )}
          </div>
        );
      },
    }),
  ] as FixedColumnsType<
    RouterOutputs["app"]["kodixCare"]["getCareTasks"][number]
  >;

  if (isLoading) return <LuLoader2 className="size-6 animate-spin" />;

  return <DataTable columns={columns} data={data} />;
}

function CheckBoxAlterDoneDialog({
  info,
  mutation,
}: {
  info: CellContext<CareTask & { id: string }, unknown>;
  mutation: ReturnType<typeof api.app.kodixCare.saveCareTask.useMutation>;
}) {
  const form = useForm({
    schema: ZSaveCareTaskInputSchema.pick({
      id: true,
      doneAt: true,
    }),
    defaultValues: {
      id: info.row.original.id,
      doneAt: info.row.original.doneAt,
    },
  });

  return (
    <div className="p-1">
      <Dialog onOpenChange={() => form.reset()}>
        <DialogTrigger asChild>
          <Checkbox
            checked={!!info.row.original.doneAt}
            className="ml-4 size-5 border-muted-foreground"
          />
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
                <DialogTitle>
                  Would you like to change the task &quot;done&quot; status?
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-8">
                <FormField
                  control={form.control}
                  name="doneAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormLabel></FormLabel>
                        <Checkbox
                          className="size-5 border-muted-foreground"
                          checked={!!field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked ? info.row.original.doneAt : null,
                            );
                          }}
                        >
                          Done
                        </Checkbox>
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doneAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DatePicker
                            className="w-fit"
                            disabledDate={(date) => date > new Date()}
                            date={field.value ?? undefined}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                          <div className="flex items-center gap-1 pl-4">
                            <IoMdTime className="size-5 text-muted-foreground" />
                            <TimePickerInput
                              picker={"hours"}
                              date={field.value ?? undefined}
                              setDate={(newDate) =>
                                field.onChange(newDate ?? new Date())
                              }
                            />
                            <TimePickerInput
                              picker={"minutes"}
                              date={field.value ?? undefined}
                              setDate={(newDate) =>
                                field.onChange(newDate ?? new Date())
                              }
                            />
                          </div>
                        </div>
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
          <Checkbox
            checked={false}
            className="ml-4 size-5 border-muted-foreground"
          />
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
                          <DatePicker
                            className="w-fit"
                            disabledDate={(date) => date > new Date()}
                            date={field.value ?? undefined}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                          <div className="flex items-center gap-1 pl-4">
                            <IoMdTime className="size-5 text-muted-foreground" />
                            <TimePickerInput
                              picker={"hours"}
                              date={field.value ?? undefined}
                              setDate={(newDate) =>
                                field.onChange(newDate ?? new Date())
                              }
                            />
                            <TimePickerInput
                              picker={"minutes"}
                              date={field.value ?? undefined}
                              setDate={(newDate) =>
                                field.onChange(newDate ?? new Date())
                              }
                            />
                          </div>
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
