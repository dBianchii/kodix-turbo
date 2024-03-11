"use client";

import type { ComponentProps, Dispatch } from "react";
import { useEffect, useState } from "react";
import { IoMdTime } from "react-icons/io";
import { LuLoader2 } from "react-icons/lu";
import { z } from "zod";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";
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
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { TimePickerInput } from "@kdx/ui/time-picker-input";

import { DatePicker } from "~/app/_components/date-picker";
import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { api } from "~/trpc/react";
import { doCheckoutAction, toggleShiftButtonAction } from "./actions";

export function ToggleShiftButton({ session }: { session: Session }) {
  const query = api.app.kodixCare.getCurrentShift.useQuery();

  const [openStartShiftDialog, setOpenStartShiftWarnPreviousDialog] =
    useState(false);
  const [isDoCheckoutDialogOpen, setIsDoCheckoutDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);

  async function handleClick() {
    if (query.data && !query.data.checkOut) {
      if (query.data.Caregiver.id === session.user.id) {
        setIsDoCheckoutDialogOpen(true);
        return;
      }
      if (query.data.Caregiver.id !== session.user.id) {
        //Warn user that he is about to end the previous shift of another person and start a new one
        setOpenStartShiftWarnPreviousDialog(true);
        return;
      }
    }

    setIsStartShiftDialogOpen(true);
  }

  const state: {
    message: string;
    variant: ComponentProps<typeof Button>["variant"];
  } = {
    message: "Start Shift",
    variant: "default",
  };

  if (query.data) {
    const loggedUserIsSessionsCaregiver =
      session.user.id === query.data.Caregiver.id;
    if (loggedUserIsSessionsCaregiver) {
      if (!query.data.checkOut) {
        state.message = "Checkout";
        state.variant = "destructive";
      } else {
        state.message = "Start new shift";
        state.variant = "default";
      }
    } else {
      if (!query.data.checkOut) {
        state.message = "End previous shift and start new";
        state.variant = "orange";
      } else {
        state.message = "Start new shift";
        state.variant = "default";
      }
    }
  }

  return (
    <>
      <Button
        size={"sm"}
        onClick={() => handleClick()}
        variant={state.variant}
        disabled={query.isFetching}
      >
        {query.isFetching ? (
          <LuLoader2 className="mx-2 size-4 animate-spin" />
        ) : (
          state.message
        )}
      </Button>
      <StartShiftDialog
        startShiftOpen={isStartShiftDialogOpen}
        setStartShiftOpen={setIsStartShiftDialogOpen}
      />
      <StartShiftWarnPreviousPersonDialog
        open={openStartShiftDialog}
        setOpen={setOpenStartShiftWarnPreviousDialog}
      />
      {query.data && (
        <DoCheckoutDialog
          open={isDoCheckoutDialogOpen}
          setOpen={setIsDoCheckoutDialogOpen}
          currentShift={query.data}
        />
      )}
    </>
  );
}

function StartShiftDialog({
  startShiftOpen,
  setStartShiftOpen,
}: {
  startShiftOpen: boolean;
  setStartShiftOpen: Dispatch<React.SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);
  const utils = api.useUtils();
  async function handleClick() {
    setLoading(true);
    const result = await toggleShiftButtonAction();
    if (defaultSafeActionToastError(result)) {
      setLoading(false);
      return;
    }

    void utils.app.kodixCare.getCareTasks.invalidate();
    void utils.app.kodixCare.getCurrentShift.invalidate();
    setStartShiftOpen(false);
    setLoading(false);
  }
  return (
    <Dialog open={startShiftOpen} onOpenChange={setStartShiftOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Shift</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <DialogDescription>
            You are about to start a new shift. Are you sure?
          </DialogDescription>
        </div>
        <DialogFooter className="gap-3 sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Close
            </Button>
          </DialogClose>
          <Button onClick={() => handleClick()} disabled={loading}>
            {loading ? (
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

function StartShiftWarnPreviousPersonDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
}) {
  const utils = api.useUtils();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await toggleShiftButtonAction();
    if (defaultSafeActionToastError(result)) {
      setLoading(false);
      return;
    }
    void utils.app.kodixCare.getCareTasks.invalidate();
    void utils.app.kodixCare.getCurrentShift.invalidate();
    setOpen(false);
    setLoading(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Previous shift exists</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Previous shift exists. Would you like to end it and start a new one?
        </DialogDescription>
        <DialogFooter className="gap-3 sm:justify-between">
          <DialogClose>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogClose>
          <Button
            variant={"orange"}
            onClick={() => handleClick()}
            disabled={loading}
          >
            {loading ? (
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

function DoCheckoutDialog({
  open,
  setOpen,
  currentShift,
}: {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    schema: z.object({
      date: z
        .date()
        .refine(
          (date) => dayjs(date).isAfter(dayjs(currentShift.checkIn)),
          `Time must be after check-in time. (${dayjs(
            currentShift.checkIn,
          ).format("HH:mm")})`,
        ),
    }),
    defaultValues: {
      date: new Date(),
    },
  });
  useEffect(() => {
    form.reset({ date: new Date() });
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout Shift</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="base"
            onSubmit={form.handleSubmit(async (values) => {
              setIsSubmitting(true);
              const result = await doCheckoutAction(values.date);
              if (defaultSafeActionToastError(result)) {
                setIsSubmitting(false);
                setOpen(false);
                return;
              }

              void utils.app.kodixCare.getCurrentShift.invalidate();
              setIsSubmitting(false);
              setOpen(false);
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
                      <DatePicker
                        disabledDate={(date) =>
                          dayjs(date).startOf("day") <
                          dayjs(currentShift.checkIn).startOf("day")
                        }
                        date={field.value}
                        setDate={(newDate) =>
                          form.setValue(
                            "date",
                            newDate ?? dayjs(new Date()).toDate(),
                          )
                        }
                        className="w-fit"
                      />
                      <div className="flex items-center gap-1 pl-4">
                        <IoMdTime className="size-5 text-muted-foreground" />
                        <TimePickerInput
                          picker={"hours"}
                          date={field.value}
                          setDate={(date) =>
                            form.setValue("date", date ?? field.value)
                          }
                        />
                        <TimePickerInput
                          picker={"minutes"}
                          date={field.value}
                          setDate={(date) =>
                            form.setValue("date", date ?? field.value)
                          }
                        />
                      </div>
                      {/* <Input
                        type="time"
                        className="w-36"
                        value={dayjs(field.value).format("HH:mm")}
                        onChange={(e) => {
                          form.setValue(
                            "date",
                            dayjs(field.value)
                              .hour(parseInt(e.target.value.split(":")[0]!))
                              .minute(parseInt(e.target.value.split(":")[1]!))
                              .toDate(),
                          );
                        }}
                      /> */}
                    </div>
                  </FormControl>
                  <FormMessage className="w-full" />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 gap-3 sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant={"destructive"}
              >
                {isSubmitting ? (
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
