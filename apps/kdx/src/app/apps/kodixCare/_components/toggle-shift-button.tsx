"use client";

import { useState } from "react";
import { LuLoader2 } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";
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
import { ZDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function ToggleShiftButton({ session }: { session: Session }) {
  const query = api.app.kodixCare.getCurrentShift.useQuery();

  if (!(query.data && !query.data.checkOut)) return <StartShiftDialogButton />;

  if (query.data.Caregiver.id === session.user.id)
    return <DoCheckoutDialogButton currentShift={query.data} />;

  return <StartShiftWarnPreviousPersonDialog />;
}

function StartShiftDialogButton() {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const mutation = api.app.kodixCare.toggleShift.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.kodixCare.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
      return;
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>Start shift</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Shift</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <DialogDescription>
            You are about to start a new shift. Are you sure?
          </DialogDescription>
        </div>
        <DialogFooter className="justify-end">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <LuLoader2 className="mx-2 size-4 animate-spin" />
            ) : (
              "Start new shift"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StartShiftWarnPreviousPersonDialog() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const mutation = api.app.kodixCare.toggleShift.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.kodixCare.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"orange"}>
          End previous shift and start new
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Previous shift exists</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Previous shift exists. Would you like to end it and start a new one?
        </DialogDescription>
        <DialogFooter className="justify-end">
          <Button
            variant={"orange"}
            onClick={() => {
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <LuLoader2 className="mx-2 size-4 animate-spin" />
            ) : (
              "End previous shift and start new"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DoCheckoutDialogButton({
  currentShift,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const form = useForm({
    schema: ZDoCheckoutForShiftInputSchema,
    defaultValues: {
      date: new Date(),
    },
  });

  const mutation = api.app.kodixCare.doCheckoutForShift.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        form.setValue("date", new Date());
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"destructive"}>
          Checkout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout Shift</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="base"
            onSubmit={form.handleSubmit(async (values) => {
              mutation.mutate(values);
            })}
          >
            <DialogDescription className="mb-4">
              You are about to finish your shift and checkout. Are you sure?
            </DialogDescription>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-row gap-2">
                      <div className="flex items-center gap-1 pl-4">
                        <DateTimePicker
                          disabledDate={(date) =>
                            dayjs(date).startOf("day") >
                            dayjs(currentShift.checkIn).startOf("day")
                          }
                          date={field.value}
                          setDate={(date) =>
                            form.setValue("date", date ?? field.value)
                          }
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="w-full" />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6 justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending}
                variant={"destructive"}
              >
                {mutation.isPending ? (
                  <LuLoader2 className="mx-2 size-4 animate-spin" />
                ) : (
                  "Checkout"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
