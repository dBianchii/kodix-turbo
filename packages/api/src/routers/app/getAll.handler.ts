import { unstable_cache } from "next/cache";
import { TRPCError } from "@trpc/server";

import { db } from "@kdx/db";
import { cacheTags, unstable_cache_keys } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../trpc";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const getAllCached = unstable_cache(
    async () => {
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
            installed: !!app.AppsToTeams.find(
              (x) => x.teamId === ctx.session?.user.activeTeamId,
            ),
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
    [unstable_cache_keys.app.getAll],
    {
      tags: [
        `${cacheTags.APPS}, ${cacheTags.INSTALLEDAPPS({ teamId: ctx.session?.user.activeTeamId ?? "" })}`,
      ],
    },
  );

  return await getAllCached();
};
