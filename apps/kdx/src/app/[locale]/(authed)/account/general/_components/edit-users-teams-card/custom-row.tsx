"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuChevronLeft } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { TableCell, TableRow } from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { DeleteTeamConfirmationDialog } from "~/app/[locale]/(authed)/team/settings/general/_components/delete-team-confirmation-dialog";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

import { switchTeamAction } from "./actions";

export function CustomRow({
  team,
  user,
}: {
  team: RouterOutputs["team"]["getAll"][0];
  user: User;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();
  const isOwner = team.ownerId === user.id;

  return (
    <TableRow
      key={team.id}
      onClick={() =>
        switchTeamAction({
          teamId: team.id,
        })
      }
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell className="w-2">
        {<LuChevronLeft className={cn(!isHovered && "text-transparent")} />}
      </TableCell>
      <TableCell className="flex flex-row space-x-4">
        <div className="flex flex-col items-start">
          <div className="flex flex-row">
            <span className="font-bold">{team.name}</span>{" "}
            {team.id === user.activeTeamId && (
              <p className="text-muted-foreground ml-1 font-bold italic">
                {" "}
                - {t("Current")}
              </p>
            )}
          </div>
          <span className="text-muted-foreground">
            {" "}
            {t("COUNT members", {
              count: team.UsersToTeams.length,
            })}
          </span>

          {isOwner && (
            <span className="text-muted-foreground">{t("Owner")}</span>
          )}
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end space-x-4">
          <form
            onSubmit={(e) => {
              setManageLoading(true);
              e.stopPropagation();
              e.preventDefault();

              if (team.id !== user.activeTeamId)
                void switchTeamAction({
                  teamId: team.id,
                  redirect: "/team/settings",
                });
              else void router.push(`/team/settings`);
            }}
          >
            <Button variant="outline" type="submit" loading={manageLoading}>
              {t("Manage")}
            </Button>
          </form>
          <LeaveOrDeleteTeamDropdown
            teamId={team.id}
            teamName={team.name}
            isOwner={isOwner}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function LeaveOrDeleteTeamDropdown({
  isOwner,
  teamId,
  teamName,
}: {
  isOwner: boolean;
  teamId: string;
  teamName: string;
}) {
  const trpc = useTRPC();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const leaveTeamMutation = useMutation(
    trpc.team.leaveTeam.mutationOptions({
      onSuccess: () => {
        toast.success(t("account.You have left the team"));
        void queryClient.invalidateQueries(trpc.team.getAllUsers.pathFilter());
        router.refresh();
      },
      onError: (e) => trpcErrorToastDefault(e),
    }),
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      <DeleteTeamConfirmationDialog
        teamId={teamId}
        teamName={teamName}
        open={open}
        setOpen={(open) => {
          setOpen(open);
          setTimeout(() => {
            //A hack to fix page becoming unresponsive: https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2295203962
            const body = document.querySelector("body");
            if (body) body.style.pointerEvents = "auto";
          }, 200);
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("Open menu")}</span>
            <RxDotsHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner ? (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setOpen(true);
              }}
            >
              {t("Delete team")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                leaveTeamMutation.mutate({
                  teamId,
                });
              }}
            >
              {t("Leave")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
