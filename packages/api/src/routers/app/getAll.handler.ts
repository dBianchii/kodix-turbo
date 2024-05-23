import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../procedures";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const apps = await ctx.db.query.apps.findMany({
    with: {
      AppsToTeams: {
        with: {
          Team: true,
        },
      },
    },
    columns: {
      id: true,
    },
  });

  if (!apps.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No apps found",
    });
  }
  const appsWithInstalled = apps
    .map((app) => {
      return {
        ...app,
        installed: !!app.AppsToTeams.find(
          (x) => x.teamId === ctx.session?.user.activeTeamId,
        ),
      };
    })
    .map(
      // remove AppsToTeams fields
      ({ AppsToTeams: _, ...rest }) => rest,
    );

  return appsWithInstalled;
};
