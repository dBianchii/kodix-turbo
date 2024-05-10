"use client";

import type { Row } from "@tanstack/react-table";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { RxTrash } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import { toast } from "@kdx/ui/toast";

import { getErrorMessage } from "~/helpers/miscelaneous";
import { deleteNotificationsAction } from "../_actions/deleteNotificationsAction";

interface DeleteTasksDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
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
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const t = useI18n();
  const { mutateAsync } = useMutation({
    mutationFn: deleteNotificationsAction,
  });

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RxTrash className="mr-2 size-4" aria-hidden="true" />
            {t("Delete")} ({notifications.length})
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Are you absolutely sure")}?</DialogTitle>
          <DialogDescription>
            {t(
              "This action cannot be undone This will permanently delete your",
            )}{" "}
            <span className="font-medium">{notifications.length} </span>
            {t("notification", {
              count: notifications.length,
            })}{" "}
            {t("from our servers")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">{t("Cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={() => {
                startDeleteTransition(() => {
                  toast.promise(
                    mutateAsync({
                      ids: notifications.map((n) => n.original.id),
                    }),
                    {
                      loading: t("Deleting"),
                      success: () => {
                        onSuccess?.();
                        return t("Notifications deleted");
                      },
                      error: (err) => getErrorMessage(err),
                    },
                  );
                });
              }}
              disabled={isDeletePending}
            >
              {t("Delete")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
