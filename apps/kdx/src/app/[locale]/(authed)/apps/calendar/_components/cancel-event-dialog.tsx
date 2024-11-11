import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuLoader2 } from "react-icons/lu";

import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@kdx/ui/credenza";
import { Label } from "@kdx/ui/label";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

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
  const [radioValue, setRadioValue] = useState<
    "all" | "thisAndFuture" | "single"
  >("single");

  const utils = api.useUtils();
  const mutation = api.app.calendar.cancel.useMutation({
    onSuccess: () => {
      void utils.app.calendar.getAll.invalidate();
      void utils.app.kodixCare.careTask.getCareTasks.invalidate();
      setOpen(false);
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });
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
            {mutation.isPending ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              t("Ok")
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
