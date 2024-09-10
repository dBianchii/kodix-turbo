"use client";

import { useState } from "react";

import type { User } from "@kdx/auth";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import { useI18nZodErrors } from "@kdx/validators/useI18nZodErrors";

import { DeleteTeamConfirmationDialog } from "./delete-team-confirmation-dialog";

export function DeleteTeamCardClient({ user }: { user: User }) {
  useI18nZodErrors();
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <Card className="w-full border-destructive text-left">
      <CardHeader>
        <CardTitle>{t("Delete team")}</CardTitle>
        <CardDescription>
          {t("Before deleting your team you must remove all members")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5"></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-destructive bg-destructive/40 px-6 py-4">
        {/* <CardDescription>
              {t("Please use 32 characters at maximum")}
            </CardDescription> */}
        <DeleteTeamConfirmationDialog
          teamName={teamName}
          open={open}
          setOpen={setOpen}
        />
        <Button variant={"destructive"} onClick={() => setOpen(true)}>
          {t("Delete team")}
        </Button>
      </CardFooter>
    </Card>
  );
}
