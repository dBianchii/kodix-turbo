import { useEffect, useMemo, useState } from "react";
import { kodixCareAppId } from "@kodix/shared/db";
import { Button } from "@kodix/ui/button";
import { AvatarWrapper } from "@kodix/ui/common/avatar-wrapper";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kodix/ui/common/credenza";
import { DateTimePicker } from "@kodix/ui/common/date-time-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kodix/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuArrowRight, LuLoaderCircle, LuPlus } from "react-icons/lu";

import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { Link } from "~/i18n/routing";

import { useShiftOverlap } from "./hooks";
import { WarnOverlappingShifts } from "./warn-overlapping-shifts";

export const useMyRoles = () => {
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
  return { endAt, form, startAt };
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

  const mutation = useMutation(
    trpc.app.kodixCare.createCareShift.mutationOptions({
      onError: trpcErrorToastDefault,
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.findOverlappingShifts.pathFilter(),
        );
      },
      onSuccess: () => {
        setOpen(false);
      },
    }),
  );

  const { form, startAt, endAt } = useCreateShiftForm({
    open,
    userId: user.id,
  });
  const { overlappingShifts, isChecking } = useShiftOverlap({ endAt, startAt });

  return (
    <Credenza
      onOpenChange={(isOpen) => {
        form.reset();
        setOpen(isOpen);
      }}
      open={!!open}
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
            onClickConfirm={form.handleSubmit((values) => {
              mutation.mutate(values);
            })}
            open={showOverlapWarning}
            overlaps={overlappingShifts}
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
                            onChange={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                            value={field.value}
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
                            onChange={(newDate: Date | undefined) =>
                              field.onChange(newDate ?? new Date())
                            }
                            value={field.value}
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
                      <FormControl>
                        <SelectCaregiver
                          disabled={isChecking || mutation.isPending}
                          onValueChange={(value) => field.onChange(value)}
                          user={user}
                          value={field.value}
                        />
                      </FormControl>
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
                    <LuLoaderCircle className="mr-2 size-4 animate-spin" />
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

function SelectCaregiver({
  disabled,
  value,
  onValueChange,
  user,
}: {
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  user: User;
}) {
  const t = useTranslations();
  const trpc = useTRPC();
  const getMyRolesQuery = useQuery(
    trpc.team.appRole.getMyRoles.queryOptions({
      appId: kodixCareAppId,
    }),
  );
  const activeTeamQuery = useQuery(trpc.team.getActiveTeam.queryOptions());
  const getAllCaregiversQuery = useQuery(
    trpc.app.kodixCare.getAllCaregivers.queryOptions(),
  );

  return (
    <Select disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectTrigger className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0">
        <SelectValue
          placeholder={
            getMyRolesQuery.isLoading ? "Loading..." : t("Select a caregiver")
          }
        />
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
        {getAllCaregiversQuery.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-2 text-md text-muted-foreground">
            {t("No caregivers found")}
            {activeTeamQuery.data?.ownerId === user.id ? (
              <Link
                className="text-primary text-sm hover:underline"
                href="/team/settings/permissions/kodixCare"
              >
                {t("Add caregivers")}
              </Link>
            ) : null}
          </div>
        ) : (
          getAllCaregiversQuery.data?.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              <span className="flex items-center gap-2">
                <AvatarWrapper
                  alt={u.name}
                  className="size-10 rounded-full"
                  fallback={u.name}
                  height={40}
                  src={u.image ?? ""}
                  width={40}
                />
                <span>
                  <span className="block font-medium">{u.name}</span>
                </span>
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
