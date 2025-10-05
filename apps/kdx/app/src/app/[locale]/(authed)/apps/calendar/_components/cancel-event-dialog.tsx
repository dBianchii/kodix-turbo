import { useState } from "react";
import { Button } from "@kodix/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kodix/ui/credenza";
import { Label } from "@kodix/ui/label";
import { RadioGroup, RadioGroupItem } from "@kodix/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useTRPC } from "@kdx/api/trpc/react/client";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

export function CancelationDialog({
  eventMasterId,
  eventExceptionId,
  date,
  open,
  setOpen,
}: {
  eventMasterId: string;
  eventExceptionId: string | undefined;
  date: Date;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const trpc = useTRPC();
  const [radioValue, setRadioValue] = useState<
    "all" | "thisAndFuture" | "single"
  >("single");

  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.app.calendar.cancel.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.calendar.getAll.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
        setOpen(false);
      },
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
    }),
  );
  const t = useTranslations();

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>
            {t("apps.calendar.Exclude current event")}
          </CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="py-4">
          <RadioGroup className="flex flex-col space-y-2" defaultValue="single">
            <div className="flex">
              <RadioGroupItem
                id="single"
                value={"single"}
                onClick={() => {
                  setRadioValue("single");
                }}
                className=""
              />
              <Label htmlFor="single" className="ml-2">
                {t("apps.calendar.This event")}
              </Label>
            </div>
            <div className="flex">
              <RadioGroupItem
                id="thisAndFuture"
                value={"thisAndFuture"}
                onClick={() => {
                  setRadioValue("thisAndFuture");
                }}
              />
              <Label htmlFor="thisAndFuture" className="ml-2">
                {t("apps.calendar.This and future events")}
              </Label>
            </div>
            <div className="flex">
              <RadioGroupItem
                id="all"
                value={"all"}
                onClick={() => {
                  setRadioValue("all");
                }}
              />
              <Label htmlFor="all" className="ml-2">
                {t("apps.calendar.All events")}
              </Label>
            </div>
          </RadioGroup>
        </CredenzaBody>
        <CredenzaFooter className="bg-background">
          <Button
            variant={"outline"}
            onClick={() => {
              setOpen(false);
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            loading={mutation.isPending}
            onClick={() => {
              if (radioValue === "all")
                mutation.mutate({
                  eventExceptionId: eventExceptionId,
                  eventMasterId: eventMasterId,
                  exclusionDefinition: "all",
                });
              else
                mutation.mutate({
                  eventExceptionId: eventExceptionId,
                  eventMasterId: eventMasterId,
                  exclusionDefinition: radioValue,
                  date,
                });
            }}
          >
            {t("Ok")}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
