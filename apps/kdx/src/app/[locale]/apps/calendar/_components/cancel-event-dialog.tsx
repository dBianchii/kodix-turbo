import { useState } from "react";
import { LuLoader2 } from "react-icons/lu";

import { useI18n } from "@kdx/locales/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Label } from "@kdx/ui/label";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

/**
 * To use this this component, you need to wrap it around a AlertDialogTrigger component.
 */
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
      void utils.app.kodixCare.getCareTasks.invalidate();
      setOpen(false);
    },
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
  });
  const t = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("apps.calendar.Exclude current event")}
          </AlertDialogTitle>
          <div className="py-4">
            <RadioGroup
              className="flex flex-col space-y-2"
              defaultValue="single"
            >
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
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();

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
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
