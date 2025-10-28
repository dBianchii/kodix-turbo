"use client";

import { useState } from "react";
import { cn } from "@kodix/ui";
import { Button } from "@kodix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@kodix/ui/table";
import { toast } from "@kodix/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LuChevronLeft } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";

import { DeleteTeamConfirmationDialog } from "~/app/[locale]/(authed)/team/settings/general/_components/delete-team-confirmation-dialog";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useRouter } from "~/i18n/routing";

import { switchTeamAction } from "./actions";

export default function EditUserTeamsTableClient({
  teams,
  user,
}: {
  teams: RouterOutputs["team"]["getAll"];
  user: User;
}) {
  const t = useTranslations();
  const currentTeam = user.activeTeamId;
  const sortedTeams = teams.sort((a, b) => {
    if (a.id === currentTeam) return -1;
    if (b.id === currentTeam) return 1;
    return 0;
  });
  return (
    <div className="rounded-md border">
      <Table>
        <TableBody>
          {sortedTeams.length ? (
            sortedTeams.map((team) => (
              <CustomRow key={team.id} team={team} user={user} />
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center"
                colSpan={sortedTeams.length}
              >
                {t("No results")}.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomRow({
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
      className="cursor-pointer"
      key={team.id}
      onClick={async () => {
        await switchTeamAction({
          teamId: team.id,
        });
      }}
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
              <p className="ml-1 font-bold text-muted-foreground italic">
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
      <TableCell
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-end space-x-4">
          <form
            onSubmit={(e) => {
              setManageLoading(true);
              e.stopPropagation();
              e.preventDefault();

              if (team.id !== user.activeTeamId)
                void switchTeamAction({
                  redirect: "/team/settings",
                  teamId: team.id,
                });
              else void router.push("/team/settings");
            }}
          >
            <Button loading={manageLoading} type="submit" variant="outline">
              {t("Manage")}
            </Button>
          </form>
          <LeaveOrDeleteTeamDropdown
            isOwner={isOwner}
            teamId={team.id}
            teamName={team.name}
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
      onError: (e) => trpcErrorToastDefault(e),
      onSuccess: () => {
        toast.success(t("account.You have left the team"));
        void queryClient.invalidateQueries(trpc.team.getAllUsers.pathFilter());
        router.refresh();
      },
    }),
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      <DeleteTeamConfirmationDialog
        open={open}
        setOpen={(_open) => {
          setOpen(_open);
          setTimeout(() => {
            //A hack to fix page becoming unresponsive: https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2295203962
            const body = document.querySelector("body");
            if (body) body.style.pointerEvents = "auto";
          }, 200);
        }}
        teamId={teamId}
        teamName={teamName}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8 p-0" variant="ghost">
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
