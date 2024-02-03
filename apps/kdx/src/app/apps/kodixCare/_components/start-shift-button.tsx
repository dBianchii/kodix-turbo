"use client";

import type { Dispatch } from "react";
import { useState } from "react";
import { LuLoader2 } from "react-icons/lu";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Button } from "@kdx/ui/button";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { api } from "~/trpc/react";
import { startShiftButtonAction } from "./actions";

export default function StartShiftButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const query = api.app.kodixCare.getCurrentShift.useQuery(undefined, {
    enabled: false,
  });

  async function handleClick() {
    setLoading(true);
    const updatedFetch = await query.refetch();
    if (updatedFetch.data && !updatedFetch.data.shiftEndedAt) {
      setLoading(false);
      setOpen(true);
      return;
    }
    const result = await startShiftButtonAction();
    setLoading(false);
    if (defaultSafeActionToastError(result)) return;
  }

  return (
    <>
      <Button size={"sm"} onClick={() => handleClick()}>
        {loading ? (
          <LuLoader2 className="mx-2 h-4 w-4 animate-spin" />
        ) : (
          children ?? "Start Shift"
        )}
      </Button>
      <EndPreviousShiftDialog open={open} setOpen={setOpen} />
    </>
  );
}

function EndPreviousShiftDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Previous shift exists</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Previous shift exists. Would you like to jorongo baculakateo?
        </AlertDialogDescription>
        <AlertDialogFooter className="">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button>Yeaa</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
