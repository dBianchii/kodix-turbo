"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, MoreHorizontal } from "lucide-react";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableRow,
  toast,
} from "@kdx/ui";

import { switchTeamAction } from "~/app/_components/header/actions";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export default function EditUserTeamsTableClient({
  teams,
  session,
}: {
  teams: RouterOutputs["team"]["getAllForLoggedUser"];
  session: Session;
}) {
  const currentWs = session.user.activeTeamId;
  const sortedTeams = teams.sort((a, b) => {
    if (a.id === currentWs) return -1;
    if (b.id === currentWs) return 1;
    return 0;
  });
  return (
    <div className="rounded-md border">
      <Table>
        <TableBody>
          {sortedTeams.length ? (
            sortedTeams.map((ws) => (
              <CustomRow ws={ws} session={session} key={ws.id} />
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={sortedTeams.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomRow({
  ws,
  session,
}: {
  ws: RouterOutputs["team"]["getAllForLoggedUser"][0];
  session: Session;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const router = useRouter();

  return (
    <TableRow
      key={ws.id}
      onClick={async () => {
        await switchTeamAction({
          teamId: ws.id,
        });
      }}
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell className="w-2">
        {<ChevronLeft className={cn(!isHovered && "text-transparent")} />}
      </TableCell>
      <TableCell className="flex flex-row space-x-4">
        <div className="flex flex-col items-start">
          <div className="flex flex-row">
            <span className="font-bold">{ws.name}</span>{" "}
            {ws.id === session.user.activeTeamId && (
              <p className="text-muted-foreground ml-1 font-bold italic">
                {" "}
                - Current
              </p>
            )}
          </div>
          {ws.ownerId === session.user.id && (
            <span className="text-muted-foreground">Owner</span>
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

              if (ws.id !== session.user.activeTeamId)
                void switchTeamAction({
                  teamId: ws.id,
                  redirect: "/team/settings",
                });
              else void router.push(`/team/settings`);
            }}
          >
            <Button variant="outline" type="submit">
              {manageLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Manage</>
              )}
            </Button>
          </form>
          <LeaveWsDropdown session={session} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function LeaveWsDropdown({ session }: { session: Session }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate } = api.team.removeUser.useMutation({
    onSuccess: () => {
      toast("User removed from team");
      void utils.team.getAllUsers.invalidate();
      router.refresh();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            mutate({
              teamId: session.user.activeTeamId,
              userId: session.user.id,
            });
          }}
        >
          Leave
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
