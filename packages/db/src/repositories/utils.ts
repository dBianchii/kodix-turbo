import type { SQLWrapper } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import { and, eq, inArray } from "drizzle-orm";

import { teams } from "../schema";

export const createWithinTeams = (teamIds: string[]) => {
  const withinTeams = (...sqls: (SQLWrapper | undefined)[]) => {
    const teamExpression =
      teamIds.length === 1
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          eq(teams.id, teamIds[0]!)
        : inArray(teams.id, teamIds);

    if (!sqls.length) return teamExpression;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return and(teamExpression, ...sqls)!;
  };

  return withinTeams;
};

export const createWithinTeamsForTable = <T extends MySqlTable>(
  teamIds: string[],
  table: T,
) => {
  //@ts-expect-error - teamId is not a column in all tables
  if (!table.teamId) {
    throw new Error("Table is missing a teamId column");
  }

  const withinTeams = (...sqls: (SQLWrapper | undefined)[]) => {
    const teamExpression =
      teamIds.length === 1
        ? //@ts-expect-error - teamId is not a column in all tables
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          eq(table.teamId, teamIds[0]!)
        : //@ts-expect-error - teamId is not a column in all tables
          inArray(table.teamId, teamIds);

    if (!sqls.length) return teamExpression;

    return and(teamExpression, ...sqls);
  };

  return withinTeams;
};

export const assertTeamIdInList = (
  input: { teamId: string },
  teamIds: string[],
) => {
  if (!teamIds.includes(input.teamId))
    throw new Error(`Team ID ${input.teamId} is not allowed.`);
};
