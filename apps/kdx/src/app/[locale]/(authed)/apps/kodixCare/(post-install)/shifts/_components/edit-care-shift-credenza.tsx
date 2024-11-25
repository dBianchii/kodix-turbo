import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuArrowRight, LuLoader2, LuLock, LuUnlock } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import { kodixCareRoleDefaultIds } from "@kdx/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kdx/ui/alert-dialog";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kdx/ui/credenza";
import { DateTimePicker24h } from "@kdx/ui/date-n-time/date-time-picker-24h";
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
import { Label } from "@kdx/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import { Textarea } from "@kdx/ui/textarea";
import { toast } from "@kdx/ui/toast";
import { ZEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { useCareShiftsData, useEditCareShift, useShiftOverlap } from "./hooks";
import { WarnOverlappingShifts } from "./warn-overlapping-shifts";

export function EditCareShiftCredenza({
  careShift,
  careGivers,
  myRoles,
  setCareShift,
}: {
  careShift: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number];
  setCareShift: (shiftId: string | null) => void;
  myRoles: RouterOutputs["team"]["appRole"]["getMyRoles"];
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const t = useTranslations();
  const canEditCareGiver = myRoles.some(
    (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
  );
  const [confirmFinishShiftAlertOpen, setConfirmFinishShiftAlertOpen] =
    useState(false);
  const [warnOverlappingShiftsOpen, setWarnOverlappingShiftsOpen] =
    useState(false);

  const mutation = useEditCareShift();
  const form = useForm({
    schema: ZEditCareShiftInputSchema(t),
    defaultValues: {
      id: careShift.id,
      startAt: careShift.startAt,
      endAt: careShift.endAt,
      careGiverId: careShift.caregiverId,
      checkIn: careShift.checkIn,
      checkOut: careShift.checkOut,
      notes: careShift.notes ?? undefined,
    },
  });

  const { startAt, endAt } = form.watch();
  const { isChecking, overlappingShifts } = useShiftOverlap({
    startAt,
    endAt,
    excludeId: careShift.id,
  });

  const handleClose = () => {
    form.reset();
    setCareShift(null);
  };

  const handleSendData = async (values: {
    id: string;
    startAt?: Date | undefined;
    endAt?: Date | undefined;
    checkIn?: Date | null | undefined;
    checkOut?: Date | null | undefined;
    notes?: string | undefined;
    careGiverId?: string | undefined;
  }) => {
    await mutation.mutateAsync(values);
    handleClose();
  };

  const isLocked = !!careShift.finished;

  return (
    <Credenza open={!!careShift} onOpenChange={handleClose}>
      <CredenzaContent className="max-w-[750px]">
        <ConfirmFinishShiftAlert
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          checkIn={form.getValues().checkIn!}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          checkOut={form.getValues().checkOut!}
          onConfirm={form.handleSubmit(handleSendData)}
          isSubmitting={mutation.isPending}
          open={confirmFinishShiftAlertOpen}
          setOpen={setConfirmFinishShiftAlertOpen}
        />
        {overlappingShifts ? (
          <WarnOverlappingShifts
            isSubmitting={mutation.isPending}
            overlaps={overlappingShifts}
            onClickConfirm={() => {
              const { checkIn, checkOut } = form.getValues();
              if (!!checkIn && !!checkOut) {
                setWarnOverlappingShiftsOpen(false);
                setConfirmFinishShiftAlertOpen(true);
                return;
              }
              void form.handleSubmit(handleSendData)();
            }}
            open={warnOverlappingShiftsOpen}
            setOpen={setWarnOverlappingShiftsOpen}
          />
        ) : null}
        <CredenzaHeader className="flex flex-row items-center">
          <div className="mr-2 flex h-full flex-col">
            <Lock isLocked={isLocked} idCareShift={careShift.id} />
          </div>
          <div className="flex flex-col">
            <CredenzaTitle>{t("apps.kodixCare.Edit shift")}</CredenzaTitle>
            <CredenzaDescription>
              {t("apps.kodixCare.Edit shift for")} {careShift.Caregiver.name}
            </CredenzaDescription>
          </div>
        </CredenzaHeader>

        <Form {...form}>
          <form
            onClick={() => {
              if (!isLocked) return;
              toast.warning(
                t(
                  "apps.kodixCare.This shift is locked. Unlock it to make changes",
                ),
              );
            }}
            onSubmit={form.handleSubmit(async (values) => {
              if (!overlappingShifts) return;
              if (values.startAt && values.endAt) {
                if (
                  overlappingShifts.some(
                    (shift) => shift.Caregiver.id === values.careGiverId,
                  )
                )
                  return form.setError("careGiverId", {
                    message: t(
                      "api.This caregiver already has a shift at this time",
                    ),
                  });

                if (overlappingShifts.length) {
                  setWarnOverlappingShiftsOpen(true);
                  return;
                }
              }

              const { checkIn, checkOut } = form.getValues();
              if (!!checkIn && !!checkOut) {
                setWarnOverlappingShiftsOpen(false);
                setConfirmFinishShiftAlertOpen(true);
                return;
              }
              await handleSendData(values);
            })}
            className="space-y-6"
          >
            <CredenzaBody className="grid gap-4 py-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Start")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            disabled={isLocked}
                            date={field.value}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("End")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            disabled={isLocked}
                            date={field.value}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Check in")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            disabled={isLocked}
                            date={field.value}
                            setDate={(newDate) => field.onChange(newDate)}
                            showClearButton
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Check out")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            disabled={isLocked}
                            showClearButton
                            date={field.value}
                            setDate={(newDate) => field.onChange(newDate)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="careGiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Caregiver")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          disabled={!canEditCareGiver || isLocked}
                          className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                        >
                          <SelectValue placeholder={t("Select a caregiver")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {careGivers.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="p-2"
                          >
                            <div className="flex items-center gap-2">
                              <AvatarWrapper
                                className="size-10 rounded-full"
                                src={user.image ?? ""}
                                alt={user.name}
                                fallback={user.name}
                                width={40}
                                height={40}
                              />
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("apps.kodixCare.Additional notes")}
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        disabled={isLocked}
                        {...field}
                        placeholder={t("apps.kodixCare.Additional notes")}
                        rows={3}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </CredenzaBody>
            <CredenzaFooter>
              <Button
                type="submit"
                disabled={
                  mutation.isPending || !form.formState.isDirty || isChecking
                }
              >
                {isChecking || mutation.isPending ? (
                  <>
                    <LuLoader2 className="mr-2 size-4 animate-spin" />
                    {isChecking ? t("Checking") : t("Saving")}...
                  </>
                ) : (
                  t("apps.kodixCare.Edit shift")
                )}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}

function ConfirmFinishShiftAlert({
  checkIn,
  checkOut,
  isSubmitting,
  onConfirm,
  open,
  setOpen,
}: {
  checkIn: Date;
  checkOut: Date;
  isSubmitting: boolean;
  onConfirm: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("apps.kodixCare.Confirm finish shift")}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t("apps.kodixCare.Are you sure you want to finish this shift")}
        </DialogDescription>
        <div className="my-4 flex w-full flex-col items-center justify-between sm:flex-row">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">{t("Check in")}</Label>
            <DateTimePicker24h disabled date={checkIn} />
          </div>
          <LuArrowRight className="mt-4 size-6 rotate-90 text-muted-foreground sm:rotate-0" />
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">{t("Check out")}</Label>
            <DateTimePicker24h disabled date={checkOut} />
          </div>
        </div>
        <DialogFooter className="gap-3 sm:justify-between">
          <Button
            variant={"outline"}
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            {t("Cancel")}
          </Button>
          <Button onClick={onConfirm}>
            {isSubmitting ? (
              <LuLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              t("Confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Lock({
  isLocked,
  idCareShift,
}: {
  isLocked: boolean;
  idCareShift: string;
}) {
  const query = useCareShiftsData([]);
  const mutation = useEditCareShift();
  const LockIcon = isLocked ? LuLock : LuUnlock;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          aria-label="Toggle locked"
          disabled={!isLocked}
          variant={!isLocked ? "ghost" : "secondary"}
          type="button"
        >
          {query.isFetching || mutation.isPending ? (
            <LuLoader2 className="size-5 animate-spin" />
          ) : (
            <LockIcon className="size-5" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-center gap-2">
          <LuUnlock className="mt-2 size-5 text-muted-foreground" />
          <AlertDialogTitle>Unlock shift</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to unlock this shift?
        </AlertDialogDescription>
        <DialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await mutation.mutateAsync({
                id: idCareShift,
                finished: false,
              });
            }}
          >
            Unlock
          </AlertDialogAction>
        </DialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
