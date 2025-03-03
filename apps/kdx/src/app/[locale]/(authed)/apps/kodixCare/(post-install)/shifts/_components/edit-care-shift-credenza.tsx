import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuLoader2, LuLock, LuTrash, LuUnlock } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { cn } from "@kdx/ui";
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
import { DateTimePicker } from "@kdx/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import { Textarea } from "@kdx/ui/textarea";
import { toast } from "@kdx/ui/toast";
import { ZEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";
import { useCareShiftsData, useEditCareShift, useShiftOverlap } from "./hooks";
import { WarnOverlappingShifts } from "./warn-overlapping-shifts";

export function EditCareShiftCredenza({
  user,
  careShift,
  careGivers,
  myRoles,
  setCareShift,
}: {
  user: User;
  careShift: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number];
  setCareShift: (shiftId: string | null) => void;
  myRoles: RouterOutputs["team"]["appRole"]["getMyRoles"];
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const api = useTRPC();
  const t = useTranslations();
  const userIsAdmin = myRoles.some((x) => x === "ADMIN");
  const canEdit = careShift.caregiverId === user.id || userIsAdmin;
  const canEditCareGiver = userIsAdmin;

  const [confirmFinishShiftAlertOpen, setConfirmFinishShiftAlertOpen] =
    useState(false);
  const [warnOverlappingShiftsOpen, setWarnOverlappingShiftsOpen] =
    useState(false);

  const mutation = useEditCareShift();
  const form = useForm({
    schema: ZEditCareShiftInputSchema(t),
    defaultValues: {
      finishedByUserId: careShift.finishedByUserId,
      id: careShift.id,
      startAt: careShift.startAt,
      endAt: careShift.endAt,
      careGiverId: careShift.caregiverId,
      checkIn: careShift.checkIn,
      checkOut: careShift.checkOut,
      notes: careShift.notes ?? undefined,
    },
  });
  const queryClient = useQueryClient();
  const deleteCareShiftMutation = useMutation(
    api.app.kodixCare.deleteCareShift.mutationOptions({
      onSuccess: () => {
        setCareShift(null);
        toast.success(t("Shift deleted"));
      },
      onError: (err) => trpcErrorToastDefault(err),
      onSettled: () => {
        void queryClient.invalidateQueries(
          api.app.kodixCare.getAllCareShifts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          api.app.kodixCare.findOverlappingShifts.pathFilter(),
        );
      },
    }),
  );

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

  const isLocked = !!careShift.finishedByUserId;

  return (
    <Credenza open={!!careShift} onOpenChange={handleClose}>
      <CredenzaContent className="max-w-[750px]">
        <ConfirmFinishShiftAlert
          onConfirm={({ finish }) => {
            form.setValue("finishedByUserId", finish ? user.id : null);

            void form.handleSubmit(handleSendData)();
          }}
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

                if (
                  overlappingShifts.length &&
                  form.formState.touchedFields.startAt &&
                  form.formState.touchedFields.endAt
                ) {
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
            <CredenzaBody>
              <div
                onClick={() => {
                  if (!isLocked) return;
                  toast.warning(
                    t(
                      "apps.kodixCare.This shift is locked. Unlock it to make changes",
                    ),
                  );
                }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="startAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Start")}</FormLabel>
                            <FormControl>
                              <div className="flex flex-row gap-2">
                                <DateTimePicker
                                  disabled={isLocked || !canEdit}
                                  value={field.value}
                                  onChange={(newDate) =>
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
                        name="checkIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Check in")}</FormLabel>
                            <FormControl>
                              <div className="flex flex-row gap-2">
                                <DateTimePicker
                                  disabled={isLocked || !canEdit}
                                  value={field.value ?? undefined}
                                  onChange={(newDate) =>
                                    field.onChange(newDate ?? null)
                                  }
                                  clearable
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="endAt"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>{t("End")}</FormLabel>
                            <FormControl>
                              <div className="flex flex-row gap-2">
                                <DateTimePicker
                                  disabled={isLocked || !canEdit}
                                  value={field.value}
                                  onChange={(newDate) =>
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
                        name="checkOut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Check out")}</FormLabel>
                            <FormControl>
                              <div className="flex flex-row gap-2">
                                <DateTimePicker
                                  disabled={isLocked || !canEdit}
                                  clearable
                                  value={field.value ?? undefined}
                                  onChange={(newDate) =>
                                    field.onChange(newDate ?? null)
                                  }
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
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
                                disabled={
                                  !canEditCareGiver || !canEdit || isLocked
                                }
                                className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                              >
                                <SelectValue
                                  placeholder={t("Select a caregiver")}
                                />
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
                                    <span className="font-medium">
                                      {user.name}
                                    </span>
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
                              disabled={isLocked || !canEdit}
                              {...field}
                              placeholder={t("apps.kodixCare.Additional notes")}
                              rows={3}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CredenzaBody>
            <CredenzaFooter
              className={cn({
                "flex md:justify-between": !isLocked,
              })}
            >
              {!isLocked && (
                <Button
                  type="button"
                  variant={"destructive"}
                  disabled={!canEdit || deleteCareShiftMutation.isPending}
                  onClick={() => {
                    deleteCareShiftMutation.mutate({
                      id: careShift.id,
                    });
                  }}
                >
                  {deleteCareShiftMutation.isPending ? (
                    <>
                      <LuTrash className="mr-2 size-4" />
                      <LuLoader2 className="mr-2 size-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <LuTrash className="mr-2 size-4" />
                      {t("Delete")}
                    </>
                  )}
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  mutation.isPending || isChecking || isLocked || !canEdit
                }
              >
                {isChecking || mutation.isPending ? (
                  <>
                    <LuLoader2 className="mr-2 size-4 animate-spin" />
                    {isChecking ? t("Checking") : t("Saving")}...
                  </>
                ) : (
                  t("Save")
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
  isSubmitting,
  onConfirm,
  open,
  setOpen,
}: {
  isSubmitting: boolean;
  onConfirm: ({ finish }: { finish: boolean }) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle>
            {t("apps.kodixCare.Are you sure you want to finish this shift")}
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:justify-between">
          <Button
            variant={"secondary"}
            onClick={() => onConfirm({ finish: false })}
            disabled={isSubmitting}
          >
            {t("No")}
          </Button>
          <Button onClick={() => onConfirm({ finish: true })}>
            {isSubmitting ? (
              <LuLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              t("Yes")
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
  const t = useTranslations();
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
          <AlertDialogTitle>{t("Unlock shift")}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {t("Are you sure you want to unlock this shift")}
        </AlertDialogDescription>
        <DialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await mutation.mutateAsync({
                id: idCareShift,
                finishedByUserId: null,
              });
            }}
          >
            {t("Unlock")}
          </AlertDialogAction>
        </DialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
