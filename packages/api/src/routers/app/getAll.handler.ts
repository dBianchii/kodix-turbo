import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../trpc";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const apps = await ctx.prisma.app.findMany({
    include: {
      Teams: true,
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
        installed: !!app.Teams.find(
          (x) => x.id === ctx.session?.user.activeTeamId,
        ),
      };
    })
    .map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ Teams, devPartnerId, subscriptionCost, ...rest }) => rest,
    ); // remove some fields
  return appsWithInstalled;
};
