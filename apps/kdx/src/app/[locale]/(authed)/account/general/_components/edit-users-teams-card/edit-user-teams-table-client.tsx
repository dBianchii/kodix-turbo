"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuLoader2 } from "react-icons/lu";
import { RxChevronLeft, RxDotsHorizontal } from "react-icons/rx";

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
import { Table, TableBody, TableCell, TableRow } from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { DeleteTeamConfirmationDialog } from "~/app/[locale]/(authed)/team/settings/general/_components/delete-team-confirmation-dialog";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useRouter } from "~/i18n/routing";
import { api } from "~/trpc/react";
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
              <CustomRow team={team} user={user} key={team.id} />
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={sortedTeams.length}
                className="h-24 text-center"
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
      key={team.id}
      onClick={async () => {
        await switchTeamAction({
          teamId: team.id,
        });
      }}
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell className="w-2">
        {<RxChevronLeft className={cn(!isHovered && "text-transparent")} />}
      </TableCell>
      <TableCell className="flex flex-row space-x-4">
        <div className="flex flex-col items-start">
          <div className="flex flex-row">
            <span className="font-bold">{team.name}</span>{" "}
            {team.id === user.activeTeamId && (
              <p className="ml-1 font-bold italic text-muted-foreground">
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
                  teamId: team.id,
                  redirect: "/team/settings",
                });
              else void router.push(`/team/settings`);
            }}
          >
            <Button variant="outline" type="submit" disabled={manageLoading}>
              {manageLoading ? (
                <LuLoader2 className="size-4 animate-spin" />
              ) : (
                <>{t("Manage")}</>
              )}
            </Button>
          </form>
          <LeaveOrDeleteTeamDropdown
            teamId={team.id}
            teamName={team.name}
            user={user}
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
  user: User;
}) {
  const t = useTranslations();
  const utils = api.useUtils();
  const router = useRouter();
  const leaveTeamMutation = api.team.leaveTeam.useMutation({
    onSuccess: () => {
      toast.success(t("account.You have left the team"));
      void utils.team.getAllUsers.invalidate();
      router.refresh();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });
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
