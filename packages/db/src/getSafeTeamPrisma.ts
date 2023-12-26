import { prisma } from "./index";

export function getSafeTeamPrisma({
  userId,
  activeTeamId,
}: {
  userId: string;
  activeTeamId: string;
}) {
  return prisma.$extends({
    name: "safeTeamPrisma", //Optional: name appears in errorLogs
    query: {
      $allModels: {
        async $allOperations({ query, args, model, operation }) {
          if (operation === "create" || operation === "createMany")
            return query(args);

          switch (model) {
            case "EventMaster":
            case "AppTeamConfig":
            case "UserAppRole":
            case "Invitation":
            case "Todo":
              args.where = {
                ...args.where,
                teamId: activeTeamId,
              };
              break;

            case "Team":
              args.where = {
                ...args.where,
                Users: {
                  some: {
                    id: userId,
                  },
                },
              };
              break;

            case "EventException":
            case "EventCancellation":
            case "EventDone":
              args.where = {
                ...args.where,
                EventMaster: {
                  teamId: activeTeamId,
                },
              };
              break;
          }

          return query(args);
        },
      },
    },
  });
}
