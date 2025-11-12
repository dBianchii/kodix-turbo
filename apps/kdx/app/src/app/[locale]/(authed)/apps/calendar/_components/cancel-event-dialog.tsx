import { useState } from "react";
import { Button } from "@kodix/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kodix/ui/common/credenza";
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
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.app.calendar.getAll.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
        setOpen(false);
      },
    }),
  );
  const t = useTranslations();

  return (
    <Credenza onOpenChange={setOpen} open={open}>
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
                className=""
                id="single"
                onClick={() => {
                  setRadioValue("single");
                }}
                value={"single"}
              />
              <Label className="ml-2" htmlFor="single">
                {t("apps.calendar.This event")}
              </Label>
            </div>
            <div className="flex">
              <RadioGroupItem
                id="thisAndFuture"
                onClick={() => {
                  setRadioValue("thisAndFuture");
                }}
                value={"thisAndFuture"}
              />
              <Label className="ml-2" htmlFor="thisAndFuture">
                {t("apps.calendar.This and future events")}
              </Label>
            </div>
            <div className="flex">
              <RadioGroupItem
                id="all"
                onClick={() => {
                  setRadioValue("all");
                }}
                value={"all"}
              />
              <Label className="ml-2" htmlFor="all">
                {t("apps.calendar.All events")}
              </Label>
            </div>
          </RadioGroup>
        </CredenzaBody>
        <CredenzaFooter className="bg-background">
          <Button
            onClick={() => {
              setOpen(false);
            }}
            variant={"outline"}
          >
            {t("Cancel")}
          </Button>
          <Button
            loading={mutation.isPending}
            onClick={() => {
              if (radioValue === "all")
                mutation.mutate({
                  eventExceptionId,
                  eventMasterId,
                  exclusionDefinition: "all",
                });
              else
                mutation.mutate({
                  date,
                  eventExceptionId,
                  eventMasterId,
                  exclusionDefinition: radioValue,
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
