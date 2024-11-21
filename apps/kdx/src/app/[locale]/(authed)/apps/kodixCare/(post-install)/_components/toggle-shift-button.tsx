"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuLoader2 } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { DateTimePicker24h } from "@kdx/ui/date-n-time/date-time-picker-24h";
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
import { ZDoCheckoutForShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export function ToggleShiftButton({ user }: { user: User }) {
  const query = api.app.kodixCare.getCurrentShift.useQuery();

  if (!(query.data && !query.data.shiftEndedAt))
    return <StartShiftDialogButton />;

  if (query.data.Caregiver.id === user.id)
    return <DoCheckoutDialogButton currentShift={query.data} />;

  return <StartShiftWarnPreviousPersonDialog />;
}

function StartShiftDialogButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const utils = api.useUtils();
  const mutation = api.app.kodixCare.toggleShift.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
      return;
    },
  });
  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button size={"sm"}>{t("apps.kodixCare.Start shift")}</Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{t("apps.kodixCare.Start shift")}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="mb-4">
          <CredenzaDescription>
            {t(
              "apps.kodixCare.You are about to start a new shift are you sure",
            )}
          </CredenzaDescription>
        </CredenzaBody>
        <CredenzaFooter className="justify-end">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <LuLoader2 className="mx-2 size-4 animate-spin" />
            ) : (
              t("apps.kodixCare.Start new shift")
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

function StartShiftWarnPreviousPersonDialog() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const mutation = api.app.kodixCare.toggleShift.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
      void utils.app.kodixCare.getCurrentShift.invalidate();
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });
  const t = useTranslations();

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button size={"sm"} variant={"orange"}>
          {t("apps.kodixCare.End previous shift and start new")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{t("apps.kodixCare.Start new shift")}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <CredenzaDescription>
            {t(
              "apps.kodixCare.Previous shift is in progress are you sure you would like to start a new one",
            )}
          </CredenzaDescription>
        </CredenzaBody>
        <CredenzaFooter className="justify-end">
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
              t("apps.kodixCare.End previous shift and start new")
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

function DoCheckoutDialogButton({
  currentShift: _,
}: {
  currentShift: NonNullable<
    RouterOutputs["app"]["kodixCare"]["getCurrentShift"]
  >;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const t = useTranslations();

  const form = useForm({
    schema: ZDoCheckoutForShiftInputSchema(t),
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
    <Credenza
      open={open}
      onOpenChange={(open) => {
        form.reset({
          date: new Date(),
        });
        setOpen(open);
      }}
    >
      <CredenzaTrigger asChild>
        <Button size={"sm"} variant={"destructive"}>
          {t("apps.kodixCare.Checkout")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{t("apps.kodixCare.Checkout shift")}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <Form {...form}>
            <form
              className="base flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) => {
                mutation.mutate(values);
              })}
            >
              <CredenzaDescription className="mb-4">
                {t(
                  "You are about to finish your shift and checkout Are you sure",
                )}
              </CredenzaDescription>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateTimePicker24h
                        date={field.value}
                        setDate={(date) =>
                          form.setValue("date", date ?? field.value)
                        }
                      />
                    </FormControl>
                    <FormMessage className="w-full" />
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
                        rows={4}
                        {...field}
                        placeholder={t("apps.kodixCare.Additional notes")}
                      />
                    </FormControl>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
              <CredenzaFooter className="mt-6 justify-end">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  variant={"destructive"}
                >
                  {mutation.isPending ? (
                    <LuLoader2 className="mx-2 size-4 animate-spin" />
                  ) : (
                    t("apps.kodixCare.Checkout")
                  )}
                </Button>
              </CredenzaFooter>
            </form>
          </Form>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
