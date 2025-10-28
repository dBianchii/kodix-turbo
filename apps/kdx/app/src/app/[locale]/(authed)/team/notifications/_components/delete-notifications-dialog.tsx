"use client";

import type { Row } from "@tanstack/react-table";
import { getErrorMessage } from "@kodix/shared/utils";
import { Button } from "@kodix/ui/button";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kodix/ui/credenza";
import { toast } from "@kodix/ui/toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuTrash } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";

import { deleteNotificationsAction } from "../_actions/delete-notifications.action";

interface DeleteTasksDialogProps extends React.ComponentProps<typeof Credenza> {
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
          <Button size="sm" variant="outline">
            <LuTrash aria-hidden="true" className="mr-2 size-4" />
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
              disabled={isPending}
              onClick={() => {
                toast.promise(
                  mutateAsync({
                    ids: notifications.map((n) => n.original.id),
                  }),
                  {
                    error: (err) => getErrorMessage(err),
                    loading: t("Deleting"),
                    success: () => {
                      onSuccess?.();
                      props.onOpenChange?.(false);
                      return t("Notifications deleted");
                    },
                  },
                );
              }}
              variant="destructive"
            >
              {t("Delete")}
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
