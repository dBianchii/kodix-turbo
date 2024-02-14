import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TRemoveUserSchema } from "@kdx/validators/trpc/team";

interface RemoveUserOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TRemoveUserSchema;
}

export const removeUserHandler = async ({ ctx, input }: RemoveUserOptions) => {
  const isUserTryingToRemoveSelfFromTeam = input.userId === ctx.session.user.id;

  const team = await ctx.prisma.team.findFirstOrThrow({
    where: {
      id: ctx.session.user.activeTeamId,
    },
    select: {
      ownerId: true,
      Users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (isUserTryingToRemoveSelfFromTeam) {
    if (team?.ownerId === ctx.session.user.id) {
      throw new TRPCError({
        message:
          "You are the owner of this team. You must transfer ownership first before leaving it",
        code: "BAD_REQUEST",
      });
    }
  }

  if (team?.Users.length <= 1)
    throw new TRPCError({
      message:
        "This user cannot leave since they are the only remaining owner of the team. Delete this team instead",
      code: "BAD_REQUEST",
    });

  //TODO: Implement role based access control
  const otherTeam = await ctx.prisma.team.findFirst({
    where: {
      id: {
        not: ctx.session.user.activeTeamId,
      },
      Users: {
        some: {
          id: input.userId,
        },
      },
    },
  });

  if (!otherTeam)
    throw new TRPCError({
      message:
        "The user needs to have at least one team. Please create another team before removing this user",
      code: "BAD_REQUEST",
    });

  //check if there are more people in the team before removal

  await ctx.prisma.user.update({
    where: {
      id: input.userId,
    },
    data: {
      Teams: {
        disconnect: {
          id: ctx.session.user.activeTeamId,
        },
      },
      activeTeamId: otherTeam.id,
    },
  });
};
