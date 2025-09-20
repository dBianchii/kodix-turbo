"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { LuCirclePlus } from "react-icons/lu";

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

import { useRouter } from "~/i18n/routing";

import { getErrorMessage } from "../../../../../../../../../../../packages/kodix/shared/src/utils";
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
    <Credenza onOpenChange={setOpen} open={open}>
      {children ?? (
        <CredenzaTrigger asChild>
          <Button className={cn(className)} size={"sm"}>
            <LuCirclePlus className="mr-2 size-5" />
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
        <CredenzaBody>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("team-name")}</Label>
              <Input
                id="name"
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Acme Inc."
                value={teamName}
              />
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            {t("Cancel")}
          </Button>
          <Button
            loading={isExecuting}
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
                    if (res.data)
                      return `${t("Team")} ${res.data.name} ${t("created")}`;
                  },
                },
              );
            }}
          >
            {t("Create")}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
