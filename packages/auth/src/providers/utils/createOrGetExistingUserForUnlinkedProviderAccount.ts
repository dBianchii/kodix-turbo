import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

export default async function createOrGetExistingUserForUnlinkedProviderAccount({
  name,
  email,
  image,
  providerUserId,
  providerId,
}: {
  name: string;
  email: string;
  image?: string;
  providerUserId: string;
  providerId: "google" | "discord";
}) {
  let userId = nanoid();
  await db.transaction(async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      columns: {
        id: true,
        image: true,
      },
      where: (users, { and, eq }) => {
        return and(eq(users.email, email));
      },
    });

    if (!existingUser) {
      const teamId = nanoid();

      await tx.insert(schema.users).values({
        id: userId,
        name: name,
        activeTeamId: teamId,
        email: email,
        image: image,
      });
      await tx.insert(schema.teams).values({
        id: teamId,
        ownerId: userId,
        name: `Personal Team`,
      });
      await tx.insert(schema.usersToTeams).values({
        userId: teamId,
        teamId: teamId,
      });
    } else {
      userId = existingUser.id;
    }

    await tx.insert(schema.accounts).values({
      providerId: providerId,
      providerUserId: providerUserId,
      userId,
    });
  });
  return userId;
}
