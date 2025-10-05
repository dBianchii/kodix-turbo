"use client";

import { Button } from "@kodix/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import { Separator } from "@kodix/ui/separator";
import { toast } from "@kodix/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kodix/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MdNotificationsActive } from "react-icons/md";

import type { RouterOutputs } from "@kdx/api";
import { useTRPC } from "@kdx/api/trpc/react/client";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useRouter } from "~/i18n/routing";

export function NotificationsPopoverClient({
  initialNotifications,
}: {
  initialNotifications: RouterOutputs["user"]["getInvitations"];
}) {
  const trpc = useTRPC();
  const t = useTranslations();
  const query = useQuery(
    trpc.user.getInvitations.queryOptions(undefined, {
      initialData: initialNotifications,
    }),
  );
  const router = useRouter();
  const queryClient = useQueryClient();
  const acceptMutation = useMutation(
    trpc.team.invitation.accept.mutationOptions({
      onError: (error) => {
        trpcErrorToastDefault(error);
      },
      onSuccess: () => {
        toast.success(t("header.Invitation accepted"));
        void queryClient.invalidateQueries(
          trpc.user.getInvitations.pathFilter(),
        );
        router.refresh();
      },
    }),
  );
  const declineMutation = useMutation(
    trpc.team.invitation.decline.mutationOptions({
      onError: (error) => {
        trpcErrorToastDefault(error);
      },
      onSuccess: () => {
        toast.success(t("Invitation declined"));
        void queryClient.invalidateQueries(
          trpc.user.getInvitations.pathFilter(),
        );
        router.refresh();
      },
    }),
  );

  if (!query.data.length) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <MdNotificationsActive className="size-4 text-orange-500" />
                <span className="sr-only">{t("notifications")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("notifications")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MdNotificationsActive className="size-4 text-orange-500" />
            <h4 className="font-medium leading-none">
              {t("New notifications")}
            </h4>
          </div>
          <Separator />
        </div>
        <div className="pt-4">
          <ul className="space-y-2">
            {query.data.map((invitation) => (
              <li key={invitation.id} className="flex flex-col gap-2">
                <div>
                  <p className="text-muted-foreground text-sm">
                    <span className="font-bold text-foreground">
                      {invitation.InvitedBy.name}
                    </span>{" "}
                    {t("invited you to")}{" "}
                    <span className="font-bold text-foreground">
                      {invitation.Team.name}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2 self-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      declineMutation.mutate({ invitationId: invitation.id });
                    }}
                    loading={
                      declineMutation.isPending || acceptMutation.isPending
                    }
                  >
                    {t("Decline")}
                  </Button>
                  <Button
                    loading={
                      declineMutation.isPending || acceptMutation.isPending
                    }
                    size="sm"
                    onClick={() => {
                      acceptMutation.mutate({ invitationId: invitation.id });
                    }}
                  >
                    {t("accept")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
