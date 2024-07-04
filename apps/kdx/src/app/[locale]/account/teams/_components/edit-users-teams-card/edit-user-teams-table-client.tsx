"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuLoader2 } from "react-icons/lu";
import { RxChevronLeft, RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { useI18n } from "@kdx/locales/client";
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

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { switchTeamAction } from "./actions";

export default function EditUserTeamsTableClient({
  teams,
  user,
}: {
  teams: RouterOutputs["team"]["getAllForLoggedUser"];
  user: User;
}) {
  const t = useI18n();
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
  team: RouterOutputs["team"]["getAllForLoggedUser"][0];
  user: User;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const router = useRouter();
  const t = useI18n();
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
          {team.ownerId === user.id && (
            <span className="text-muted-foreground">{t("Owner")}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
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
          <LeaveTeamDropdown user={user} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function LeaveTeamDropdown({ user }: { user: User }) {
  const t = useI18n();
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate } = api.team.removeUser.useMutation({
    onSuccess: () => {
      toast(t("account.User removed from team"));
      void utils.team.getAllUsers.invalidate();
      router.refresh();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t("Open menu")}</span>
          <RxDotsHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            mutate({
              userId: user.id,
            });
          }}
        >
          {t("Leave")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
