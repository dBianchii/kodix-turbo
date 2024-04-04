"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";
import { RxPlusCircled } from "react-icons/rx";

import type { Session } from "@kdx/auth";
import { useI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { toast } from "@kdx/ui/toast";
import { cn } from "@kdx/ui/utils";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { createTeamAction } from "./actions";

export function AddTeamDialogButton({
  session,
  children,
  className,
}: {
  session: Session;
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [teamName, changeTeamName] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const t = useI18n();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ?? (
        <DialogTrigger asChild>
          <Button className={cn(className)}>
            <RxPlusCircled className="mr-2 size-5" />
            {t("Create new team")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Create new team")}</DialogTitle>
          <DialogDescription>
            {t("create-a-new-team-and-invite-your-team-members")}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("team-name")}</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={teamName}
                onChange={(e) => changeTeamName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button
            disabled={isPending}
            onClick={async () => {
              setIsPending(true);
              const result = await createTeamAction({
                userId: session.user.id,
                teamName: teamName,
              });
              setIsPending(false);
              if (defaultSafeActionToastError(result)) return;
              setOpen(false);
              toast(`${t("Team")} ${result.data?.name} ${t("created")}`, {
                description: t("Successfully created a new team"),
              });
              return router.refresh();
            }}
          >
            {isPending && <LuLoader2 className="mr-2 size-5 animate-spin" />}
            {t("Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
