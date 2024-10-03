"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { LuLoader2 } from "react-icons/lu";
import { RxPlusCircled } from "react-icons/rx";

import { useTranslations } from "@kdx/locales/next-intl/client";
import { useRouter } from "@kdx/locales/next-intl/navigation";
import { getErrorMessage } from "@kdx/shared";
import { cn } from "@kdx/ui";
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

import { createTeamAction } from "./actions";

export function AddTeamDialogButton({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [open, setOpen] = useState(false);
  const { isExecuting, executeAsync } = useAction(createTeamAction);
  const t = useTranslations();
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
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button
            disabled={isExecuting}
            onClick={() => {
              toast.promise(
                executeAsync({
                  teamName,
                }),
                {
                  error: getErrorMessage,
                  success: (res) => {
                    setOpen(false);

                    router.refresh();
                    if (res?.data)
                      return `${t("Team")} ${res.data.name} ${t("created")}`;
                  },
                },
              );
            }}
          >
            {isExecuting && <LuLoader2 className="mr-2 size-5 animate-spin" />}
            {t("Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
