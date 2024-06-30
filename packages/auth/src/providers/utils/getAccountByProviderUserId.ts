import { db } from "@kdx/db/client";

export default async function getAccountByProviderUserId({
  providerId,
  providerUserId,
}: {
  providerId: "google" | "discord";
  providerUserId: string;
}) {
  return db.query.accounts.findFirst({
    columns: {
      userId: true,
    },
    where: (accounts, { and, eq }) => {
      return and(
        eq(accounts.providerId, providerId),
        eq(accounts.providerUserId, providerUserId),
      );
    },
  });
}
