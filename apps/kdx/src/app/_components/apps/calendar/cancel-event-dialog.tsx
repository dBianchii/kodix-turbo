import { useState } from "react";
import { LuLoader2 } from "react-icons/lu";

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

  const [buttonLoading, setButtonLoading] = useState(false);
  const utils = api.useUtils();
  const { mutate: cancelEvent } = api.app.calendar.cancel.useMutation({
    onMutate: () => {
      setButtonLoading(true);
    },
    onSuccess: () => {
      void utils.app.calendar.getAll.invalidate();
      setOpen(false);
    },
    onSettled: () => {
      setButtonLoading(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclude recurrent event</AlertDialogTitle>
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
                  This event
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
                  This and future events
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
                  All events
                </Label>
              </div>
            </RadioGroup>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();

              if (radioValue === "all")
                cancelEvent({
                  eventExceptionId: eventExceptionId,
                  eventMasterId: eventMasterId,
                  exclusionDefinition: "all",
                });
              else if (
                radioValue === "thisAndFuture" ||
                radioValue === "single"
              )
                cancelEvent({
                  eventExceptionId: eventExceptionId,
                  eventMasterId: eventMasterId,
                  exclusionDefinition: radioValue,
                  date,
                });
            }}
          >
            {buttonLoading ? (
              <LuLoader2 className="size-4 animate-spin" />
            ) : (
              <>OK</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
