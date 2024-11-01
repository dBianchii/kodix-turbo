"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { LuLoader2 } from "react-icons/lu";
import { RxPlusCircled } from "react-icons/rx";

import { useRouter } from "@kdx/locales/next-intl/navigation";
import { getErrorMessage } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
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
    <Credenza open={open} onOpenChange={setOpen}>
      {children ?? (
        <CredenzaTrigger asChild>
          <Button size={"sm"} className={cn(className)}>
            <RxPlusCircled className="mr-2 size-5" />
            {t("Create new team")}
          </Button>
        </CredenzaTrigger>
      )}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{t("Create new team")}</CredenzaTitle>
          <CredenzaDescription>
            {t("create-a-new-team-and-invite-your-team-members")}
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("team-name")}</Label>
            <Input
              id="name"
              placeholder="Acme Inc."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
        </CredenzaBody>
        <CredenzaFooter>
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
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
