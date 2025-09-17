import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { auth } from "@kdx/auth";
import { notificationRepository } from "@kdx/db/repositories";

import { redirect } from "~/i18n/routing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await auth();
  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return notFound();
  }

  const notif = await notificationRepository.getUserNotificationById({
    notificationId: id,
    userId: user.id,
  });
  if (!notif) return notFound();

  return new Response(notif.message, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
