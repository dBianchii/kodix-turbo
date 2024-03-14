import { db } from "@kdx/db";

const team = await db.query.teams.findFirst({
  where: (teams, { eq }) =>
    eq(teams.id, "6cfbb314-1282-49c8-816c-f7ae7368b721"),
  with: {
    UsersToTeams: {
      // where: (usersToTeams, { eq }) =>
      //   eq(usersToTeams.userId, "8f1a6d17-d51b-48f3-b683-6b5f840718ac"),
      with: {
        User: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    },
  },
});
console.log(team);
