import { AvatarWrapper } from "@kodix/ui/common/avatar-wrapper";
import { Button } from "@kodix/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kodix/ui/dialog";
import { useFormatter, useTranslations } from "next-intl";
import { LuLoaderCircle } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";

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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader className="mt-6">
          <DialogTitle>
            {t("It seems that there are some overlapping shifts")}
          </DialogTitle>
        </DialogHeader>
        {overlaps.length && (
          <ul className="my-4 list-disc rounded-md border p-4 pl-5">
            {overlaps.map((overlap) => (
              <li className="mb-2 flex items-center gap-2" key={overlap.id}>
                <AvatarWrapper
                  className="size-6"
                  fallback={overlap.Caregiver.name}
                  src={overlap.Caregiver.image ?? ""}
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
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
            variant={"outline"}
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
