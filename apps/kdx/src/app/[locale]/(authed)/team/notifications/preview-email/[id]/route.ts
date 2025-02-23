import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { initializePublicRepositories } from "node_modules/@kdx/api/src/trpc/initializeRepositories";

import { auth } from "@kdx/auth";

import { redirect } from "~/i18n/routing";

export async function GET(request: Request) {
  const { user } = await auth();
  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const { publicNotificationsRepository } = initializePublicRepositories();

  const notif = await publicNotificationsRepository.getUserNotificationById({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    notificationId: request.url.split("/").pop()!,
    userId: user.id,
  });
  if (!notif) return notFound();

  return new Response(notif.message, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
