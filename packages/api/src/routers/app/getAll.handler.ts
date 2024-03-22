import { unstable_cache } from "next/cache";
import { TRPCError } from "@trpc/server";

import { db } from "@kdx/db";

import type { TPublicProcedureContext } from "../../trpc";
import { cacheTags } from "../../cache-tags";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) =>
  await getAllCached({
    activeTeamId: ctx.session?.user.activeTeamId,
  });

const getAllCached = unstable_cache(
  async ({ activeTeamId }: { activeTeamId: string | undefined }) => {
    // const apps = await ctx.prisma.app.findMany({
    //   include: {
    //     Teams: true,
    //   },
    // });
    const apps = await db.query.apps.findMany({
      with: {
        AppsToTeams: {
          with: {
            Team: true,
          },
        },
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
          installed: !!app.AppsToTeams.find((x) => x.teamId === activeTeamId),
        };
      })
      .map(
        // remove some fields
        ({
          AppsToTeams: _,
          devPartnerId: __,
          subscriptionCost: ___,
          ...rest
        }) => rest,
      );

    return appsWithInstalled;
  },
  [cacheTags.INSTALLED_APPS],
  {
    tags: [cacheTags.INSTALLED_APPS],
  },
);
