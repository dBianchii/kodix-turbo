import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kodix/ui/alert-dialog";
import { Button } from "@kodix/ui/button";
import { AvatarWrapper } from "@kodix/ui/common/avatar-wrapper";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kodix/ui/common/credenza";
import { DateTimePicker } from "@kodix/ui/common/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kodix/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { cn } from "@kodix/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kodix/ui/select";
import { toast } from "@kodix/ui/sonner";
import { Textarea } from "@kodix/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuLoaderCircle, LuLock, LuLockOpen, LuTrash } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

import { useMyRoles } from "./create-care-shift-credenza";
import { useCareShiftsData, useEditCareShift, useShiftOverlap } from "./hooks";
import { WarnOverlappingShifts } from "./warn-overlapping-shifts";

export function EditCareShiftCredenza({
  user,
  careShift,
  careGivers,
  setCareShift,
}: {
  user: User;
  careShift: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number];
  setCareShift: (shiftId: string | null) => void;
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const trpc = useTRPC();
  const t = useTranslations();
  const { getMyRolesQuery } = useMyRoles();
  const userIsAdmin = getMyRolesQuery.data?.some((x) => x === "ADMIN");
  const canEdit = careShift.caregiverId === user.id || !!userIsAdmin;
  const canEditCareGiver = userIsAdmin;

  const [confirmFinishShiftAlertOpen, setConfirmFinishShiftAlertOpen] =
    useState(false);
  const [warnOverlappingShiftsOpen, setWarnOverlappingShiftsOpen] =
    useState(false);

  const mutation = useEditCareShift();
  const form = useForm({
    defaultValues: {
      careGiverId: careShift.caregiverId,
      checkIn: careShift.checkIn,
      checkOut: careShift.checkOut,
      endAt: careShift.endAt,
      finishedByUserId: careShift.finishedByUserId,
      id: careShift.id,
      notes: careShift.notes ?? undefined,
      startAt: careShift.startAt,
    },
    schema: ZEditCareShiftInputSchema(t),
  });
  const queryClient = useQueryClient();
  const deleteCareShiftMutation = useMutation(
    trpc.app.kodixCare.deleteCareShift.mutationOptions({
      onError: (err) => trpcErrorToastDefault(err),
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.findOverlappingShifts.pathFilter(),
        );
      },
      onSuccess: () => {
        setCareShift(null);
        toast.success(t("Shift deleted"));
      },
    }),
  );

  const { startAt, endAt } = form.watch();
  const { isChecking, overlappingShifts } = useShiftOverlap({
    endAt,
    excludeId: careShift.id,
    startAt,
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
    <Credenza onOpenChange={handleClose} open={!!careShift}>
      <CredenzaContent className="max-w-[750px]">
        <ConfirmFinishShiftAlert
          isSubmitting={mutation.isPending}
          onConfirm={({ finish }) => {
            form.setValue("finishedByUserId", finish ? user.id : null);

            void form.handleSubmit(handleSendData)();
          }}
          open={confirmFinishShiftAlertOpen}
          setOpen={setConfirmFinishShiftAlertOpen}
        />
        {overlappingShifts ? (
          <WarnOverlappingShifts
            isSubmitting={mutation.isPending}
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
            overlaps={overlappingShifts}
            setOpen={setWarnOverlappingShiftsOpen}
          />
        ) : null}
        <CredenzaHeader className="flex flex-row items-center">
          <div className="mr-2 flex h-full flex-col">
            <Lock idCareShift={careShift.id} isLocked={isLocked} />
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
            className="space-y-6"
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
          >
            <CredenzaBody>
              {/** biome-ignore lint/a11y/noStaticElementInteractions: Fix me */}
              {/** biome-ignore lint/a11y/useKeyWithClickEvents: Fix me */}
              {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: Fix me */}
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
                                  onChange={(newDate) =>
                                    field.onChange(newDate ?? new Date())
                                  }
                                  value={field.value}
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
                                  clearable
                                  disabled={isLocked || !canEdit}
                                  onChange={(newDate) =>
                                    field.onChange(newDate ?? null)
                                  }
                                  value={field.value ?? undefined}
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
                                  onChange={(newDate) =>
                                    field.onChange(newDate ?? new Date())
                                  }
                                  value={field.value}
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
                                  clearable
                                  disabled={isLocked || !canEdit}
                                  onChange={(newDate) =>
                                    field.onChange(newDate ?? null)
                                  }
                                  value={field.value ?? undefined}
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
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                                disabled={
                                  !(canEditCareGiver && canEdit) || isLocked
                                }
                              >
                                <SelectValue
                                  placeholder={t("Select a caregiver")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {careGivers.map((u) => (
                                <SelectItem
                                  className="p-2"
                                  key={u.id}
                                  value={user.id}
                                >
                                  <div className="flex items-center gap-2">
                                    <AvatarWrapper
                                      alt={u.name}
                                      className="size-10 rounded-full"
                                      fallback={user.name}
                                      height={40}
                                      src={user.image ?? ""}
                                      width={40}
                                    />
                                    <span className="font-medium">
                                      {u.name}
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
                  disabled={!canEdit || deleteCareShiftMutation.isPending}
                  onClick={() => {
                    deleteCareShiftMutation.mutate({
                      id: careShift.id,
                    });
                  }}
                  type="button"
                  variant={"destructive"}
                >
                  {deleteCareShiftMutation.isPending ? (
                    <>
                      <LuTrash className="mr-2 size-4" />
                      <LuLoaderCircle className="mr-2 size-4 animate-spin" />
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
                disabled={
                  mutation.isPending || isChecking || isLocked || !canEdit
                }
                type="submit"
              >
                {isChecking || mutation.isPending ? (
                  <>
                    <LuLoaderCircle className="mr-2 size-4 animate-spin" />
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle>
            {t("apps.kodixCare.Are you sure you want to finish this shift")}
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:justify-between">
          <Button
            disabled={isSubmitting}
            onClick={() => onConfirm({ finish: false })}
            variant={"secondary"}
          >
            {t("No")}
          </Button>
          <Button onClick={() => onConfirm({ finish: true })}>
            {isSubmitting ? (
              <LuLoaderCircle className="mr-2 size-4 animate-spin" />
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
  const query = useCareShiftsData();
  const mutation = useEditCareShift();
  const t = useTranslations();
  const LockIcon = isLocked ? LuLock : LuLockOpen;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          aria-label="Toggle locked"
          disabled={!isLocked}
          type="button"
          variant={isLocked ? "secondary" : "ghost"}
        >
          {query.isFetching || mutation.isPending ? (
            <LuLoaderCircle className="size-5 animate-spin" />
          ) : (
            <LockIcon className="size-5" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-center gap-2">
          <LuLock className="mt-2 size-5 text-muted-foreground" />
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
                finishedByUserId: null,
                id: idCareShift,
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
