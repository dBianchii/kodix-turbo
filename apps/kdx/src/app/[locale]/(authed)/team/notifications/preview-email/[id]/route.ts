import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { auth } from "@kdx/auth";
import { notificationRepository } from "@kdx/db/repositories";
import { redirect } from "@kdx/locales/next-intl/navigation";

export async function GET(request: Request) {
  const { user } = await auth();
  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const notif = await notificationRepository.getUserNotificationById({
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
