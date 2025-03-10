import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuArrowRight, LuLoader2, LuPlus } from "react-icons/lu";

import type { User } from "@kdx/auth";
import { kodixCareAppId } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { DateTimePicker } from "@kdx/ui/date-time-picker";
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
import { ZCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";
import { useShiftOverlap } from "./hooks";
import { WarnOverlappingShifts } from "./warn-overlapping-shifts";

const useMyRoles = () => {
  const trpc = useTRPC();
  const getMyRolesQuery = useQuery(
    trpc.team.appRole.getMyRoles.queryOptions({
      appId: kodixCareAppId,
    }),
  );

  const shouldAutoSelectMyself = useMemo(
    () =>
      !getMyRolesQuery.data?.some((r) => r === "ADMIN") &&
      getMyRolesQuery.data?.some((r) => r === "CAREGIVER"),
    [getMyRolesQuery.data],
  );
  return { getMyRolesQuery, shouldAutoSelectMyself };
};

const useCreateShiftForm = ({
  open,
  userId,
}: {
  open: { preselectedStart: Date; preselectedEnd: Date } | boolean;
  userId: string;
}) => {
  const { shouldAutoSelectMyself } = useMyRoles();

  const t = useTranslations();
  const form = useForm({
    schema: ZCreateCareShiftInputSchema(t),
  });

  useEffect(() => {
    //Pre-select some values
    if (typeof open === "object") {
      form.setValue("startAt", open.preselectedStart);
      form.setValue("endAt", open.preselectedEnd);
    }
    if (shouldAutoSelectMyself) form.setValue("careGiverId", userId);
  }, [open, form, shouldAutoSelectMyself, userId]);

  const { startAt, endAt } = form.watch();
  return { form, startAt, endAt };
};

export function CreateShiftCredenzaButton({
  open,
  setOpen,
  user,
}: {
  open: { preselectedStart: Date; preselectedEnd: Date } | boolean;
  setOpen: (
    isOpen: { preselectedStart: Date; preselectedEnd: Date } | boolean,
  ) => void;
  user: User;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const getAllCaregiversQuery = useQuery(
    trpc.app.kodixCare.getAllCaregivers.queryOptions(undefined, {
      enabled: !!open,
    }),
  );
  const { getMyRolesQuery } = useMyRoles();

  const mutation = useMutation(
    trpc.app.kodixCare.createCareShift.mutationOptions({
      onSuccess: () => {
        setOpen(false);
      },
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.findOverlappingShifts.pathFilter(),
        );
      },
    }),
  );

  const { form, startAt, endAt } = useCreateShiftForm({
    userId: user.id,
    open,
  });
  const { overlappingShifts, isChecking } = useShiftOverlap({ startAt, endAt });

  return (
    <Credenza
      open={!!open}
      onOpenChange={(open) => {
        form.reset();
        setOpen(open);
      }}
    >
      <CredenzaTrigger asChild>
        <Button size={"sm"}>
          <LuPlus className="mr-2" />
          {t("apps.kodixCare.Create shift")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-[750px]">
        {overlappingShifts ? (
          <WarnOverlappingShifts
            isSubmitting={mutation.isPending}
            overlaps={overlappingShifts}
            onClickConfirm={form.handleSubmit((values) => {
              mutation.mutate(values);
            })}
            open={showOverlapWarning}
            setOpen={setShowOverlapWarning}
          />
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              if (!overlappingShifts) return;

              if (
                overlappingShifts.some(
                  (shift) => shift.Caregiver.id === values.careGiverId,
                )
              ) {
                form.setError("careGiverId", {
                  message: t(
                    "api.This caregiver already has a shift at this time",
                  ),
                });
                return;
              }

              if (overlappingShifts.length) {
                setShowOverlapWarning(true);
                return;
              }

              mutation.mutate(values);
            })}
          >
            <CredenzaHeader>
              <CredenzaTitle>{t("apps.kodixCare.Create shift")}</CredenzaTitle>
            </CredenzaHeader>
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
                          <DateTimePicker
                            value={field.value}
                            onChange={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
                <LuArrowRight className="mt-8 hidden size-6 shrink-0 self-center md:mb-[14px] md:block" />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("End")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker
                            value={field.value}
                            onChange={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="w-full" />
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
                    <div className="flex flex-row gap-2">
                      <Select
                        disabled={
                          !getMyRolesQuery.data?.some((x) => x === "ADMIN") ||
                          getMyRolesQuery.isFetching
                        }
                        {...field}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="select-40"
                            className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                          >
                            <SelectValue
                              placeholder={
                                getMyRolesQuery.isLoading
                                  ? "Loading..."
                                  : t("Select a caregiver")
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                          {getAllCaregiversQuery.data?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <span className="flex items-center gap-2">
                                <AvatarWrapper
                                  className="size-10 rounded-full"
                                  fallback={user.name}
                                  src={user.image ?? ""}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                />
                                <span>
                                  <span className="block font-medium">
                                    {user.name}
                                  </span>
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
            </CredenzaBody>
            <CredenzaFooter className="mt-6 justify-end">
              <Button disabled={isChecking || mutation.isPending} type="submit">
                {isChecking || mutation.isPending ? (
                  <>
                    <LuLoader2 className="mr-2 size-4 animate-spin" />
                    {isChecking ? t("Checking") : t("Saving")}...
                  </>
                ) : (
                  t("Create")
                )}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}
