"use client";

import type { Row } from "@tanstack/react-table";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { RxTrash } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { getErrorMessage } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { toast } from "@kdx/ui/toast";

import { deleteNotificationsAction } from "../_actions/deleteNotificationsAction";

interface DeleteTasksDialogProps
  extends React.ComponentPropsWithoutRef<typeof Credenza> {
  notifications: Row<
    RouterOutputs["user"]["getNotifications"]["data"][number]
  >[];
  onSuccess?: () => void;
  showTrigger?: boolean;
}

export function DeleteNotificationsDialog({
  notifications,
  onSuccess,
  showTrigger = true,
  ...props
}: DeleteTasksDialogProps) {
  const t = useTranslations();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteNotificationsAction,
  });

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <RxTrash className="mr-2 size-4" aria-hidden="true" />
            {t("Delete")} ({notifications.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{t("Are you absolutely sure")}?</CredenzaTitle>
          <CredenzaDescription>
            {t(
              "This action cannot be undone This will permanently delete your",
            )}{" "}
            <span className="font-medium">{notifications.length} </span>
            {t("notification", {
              count: notifications.length,
            })}{" "}
            {t("from our servers")}
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter className="gap-2 sm:space-x-0">
          <CredenzaClose asChild>
            <Button variant="outline">{t("Cancel")}</Button>
          </CredenzaClose>
          <CredenzaClose asChild>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={() => {
                toast.promise(
                  mutateAsync({
                    ids: notifications.map((n) => n.original.id),
                  }),
                  {
                    loading: t("Deleting"),
                    success: () => {
                      onSuccess?.();
                      props.onOpenChange?.(false);
                      return t("Notifications deleted");
                    },
                    error: (err) => getErrorMessage(err),
                  },
                );
              }}
              disabled={isPending}
            >
              {t("Delete")}
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
