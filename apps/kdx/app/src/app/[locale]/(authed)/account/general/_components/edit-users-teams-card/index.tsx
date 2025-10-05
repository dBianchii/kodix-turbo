import { Table, TableBody, TableCell, TableRow } from "@kodix/ui/table";
import { getTranslations } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { auth } from "@kdx/auth";

import { CustomRow } from "./custom-row";

export async function EditUserTeamsTable() {
  const teams = await trpcCaller.team.getAll();

  const { user } = await auth();
  if (!user) return null;

  const t = await getTranslations();
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
