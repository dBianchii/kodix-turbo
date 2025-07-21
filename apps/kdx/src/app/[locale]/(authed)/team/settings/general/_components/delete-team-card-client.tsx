"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { User } from "@kdx/auth";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";

import { DeleteTeamConfirmationDialog } from "./delete-team-confirmation-dialog";

export function DeleteTeamCardClient({ user }: { user: User }) {
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
      <CardFooter className="flex justify-end border-destructive border-t bg-destructive/40 px-6 py-4">
        {/* <CardDescription>
              {t("Please use 32 characters at maximum")}
            </CardDescription> */}
        <DeleteTeamConfirmationDialog
          teamId={user.activeTeamId}
          teamName={user.activeTeamName}
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
