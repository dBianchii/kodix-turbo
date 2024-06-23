import { notFound, redirect } from "next/navigation";

import { auth, signOut } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { getI18n } from "@kdx/locales/server";
import { getBaseUrl } from "@kdx/shared";
import { Button } from "@kdx/ui/button";

import { api } from "~/trpc/server";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { id: invitationId } = params;

  const invitation = await db.query.invitations.findFirst({
    where: eq(schema.invitations.id, invitationId),
  });
  if (!invitation) return notFound();
  const session = await auth();

  if (!session) {
    const url = new URL(`/api/auth/signin`, getBaseUrl());

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, invitation.email),
    });
    url.searchParams.append(
      "callbackUrl",
      user ? `/team/invite/${invitationId}` : "/team", //? No need to redirect back here bc it's already handled in the createUser function
    );

    if (!user)
      //We can't set cookies here, so we need to create it later in nextauth route
      url.searchParams.append("invite", encodeURIComponent(invitationId));

    const isExpoRedirect = searchParams["expo-redirect"];
    if (isExpoRedirect && typeof isExpoRedirect === "string")
      url.searchParams.append("expo-redirect", isExpoRedirect);

    redirect(`${url.pathname}${url.search}`);
  }

  if (session.user.email !== invitation.email) {
    const t = await getI18n();
    return (
      <section className="flex min-h-screen flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-bold">{t("Not found")}</h1>
        <p className="text-center">
          {t(
            "The user is not authorized to join the team Did you log into the correct account",
          )}
        </p>
        <form>
          <Button
            formAction={async () => {
              "use server";
              await signOut();
            }}
          >
            {t("Use another account")}
          </Button>
        </form>
      </section>
    );
  }
  await api.team.invitation.accept({ invitationId });

  redirect("/team");
}
