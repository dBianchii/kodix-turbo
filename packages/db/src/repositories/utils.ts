export const createWithinTeams = (teamIds: string[]) => {
  const teamExpression =
    teamIds.length === 1
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eq(careTasks.teamId, teamIds[0]!)
      : inArray(careTasks.teamId, teamIds);
  if (!sqls.length) return teamExpression;
  return and(teamExpression, ...sqls);
};
