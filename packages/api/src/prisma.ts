import type { Session } from "@kdx/auth";
import { auth } from "@kdx/auth";
import { getSafeTeamPrisma, prisma } from "@kdx/db";

export const getPrisma = async (session?: Session | null) => {
  if (session === null) return prisma; //? If we have a session obj and user is not logged in, return prisma

  if (!session) session = await auth();
  if (!session) return prisma; //? If we dont have a session obj, auth(), then if is not logged in, return prisma

  //? If user is logged in, return SafeTeamPrisma
  return getSafeTeamPrisma({
    userId: session.user.id,
    activeTeamId: session.user.activeTeamId,
  });
};
