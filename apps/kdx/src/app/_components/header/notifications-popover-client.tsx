"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";
import { MdNotificationsActive } from "react-icons/md";

import type { RouterOutputs } from "@kdx/api";
import { Button } from "@kdx/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { Separator } from "@kdx/ui/separator";
import { toast } from "@kdx/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export async function NotificationsPopoverClient({
  initialNotifications,
}: {
  initialNotifications: RouterOutputs["user"]["getNotifications"];
}) {
  const { data: notifications } = api.user.getNotifications.useQuery(
    undefined,
    {
      initialData: initialNotifications,
    },
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const utils = api.useUtils();
  const { mutate: mutateAccept } = api.team.invitation.accept.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      toast.success("Invitation accepted");
      void utils.user.getNotifications.invalidate();
      router.refresh();
    },
    onError: (error) => {
      trpcErrorToastDefault(error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
  const { mutate: mutateDecline } = api.team.invitation.decline.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      toast.success("Invitation declined");
      void utils.user.getNotifications.invalidate();
      router.refresh();
    },
    onError: (error) => {
      trpcErrorToastDefault(error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  if (!notifications.invitations.length) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <MdNotificationsActive className="size-4 text-orange-500" />
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MdNotificationsActive className="size-4 text-orange-500" />
            <h4 className="font-medium leading-none">New Notifications</h4>
          </div>
          <Separator />
        </div>
        <div className="pt-4">
          <ul className="space-y-2">
            {notifications.invitations.map((invitation) => (
              <li key={invitation.id} className="flex flex-col gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {invitation.InvitedBy.name}
                    </span>{" "}
                    invited you to{" "}
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
                      mutateDecline({ invitationId: invitation.id });
                    }}
                  >
                    {loading ? (
                      <LuLoader2 className="mr-2 size-5 animate-spin" />
                    ) : (
                      "Decline"
                    )}
                  </Button>
                  <Button
                    disabled={loading}
                    size="sm"
                    onClick={() => {
                      mutateAccept({ invitationId: invitation.id });
                    }}
                  >
                    {loading ? (
                      <LuLoader2 className="mr-2 size-5 animate-spin" />
                    ) : (
                      "Accept"
                    )}
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
