import { useFormatter, useTranslations } from "next-intl";
import { LuLoaderCircle } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";

export function WarnOverlappingShifts({
  overlaps,
  onClickConfirm,
  isSubmitting,
  open,
  setOpen,
}: {
  overlaps: RouterOutputs["app"]["kodixCare"]["findOverlappingShifts"];
  onClickConfirm: () => void;
  isSubmitting: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const format = useFormatter();
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="mt-6">
          <DialogTitle>
            {t("It seems that there are some overlapping shifts")}
          </DialogTitle>
        </DialogHeader>
        {overlaps.length && (
          <ul className="my-4 list-disc rounded-md border p-4 pl-5">
            {overlaps.map((overlap) => (
              <li key={overlap.id} className="mb-2 flex items-center gap-2">
                <AvatarWrapper
                  className="size-6"
                  src={overlap.Caregiver.image ?? ""}
                  fallback={overlap.Caregiver.name}
                />
                {overlap.Caregiver.name}:
                <span className="text-muted-foreground">
                  {`${format.dateTime(overlap.startAt, "shortWithHours")} - ${format.dateTime(overlap.endAt, "shortWithHours")}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <DialogDescription>
          {t("Are you sure you want to create a shift anyways")}
        </DialogDescription>
        <DialogFooter className="gap-3 sm:justify-between">
          <Button
            variant={"outline"}
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => {
              onClickConfirm();
              setOpen(false);
            }}
          >
            {isSubmitting ? (
              <>
                <LuLoaderCircle className="mr-2 size-4 animate-spin" />
                {t("Saving")}...
              </>
            ) : (
              t("Confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
