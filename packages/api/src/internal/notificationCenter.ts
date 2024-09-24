import { render } from "@react-email/render";

import { db } from "@kdx/db/client";
import { notifications } from "@kdx/db/schema";

import type { resend } from "../utils/email";

interface EmailChannel {
  type: "EMAIL";
  react: JSX.Element;
  to: Parameters<typeof resend.emails.send>[0]["to"];
  subject: Parameters<typeof resend.emails.send>[0]["subject"];
}

interface MobileNotificationsChannel {
  type: "NOTIFICATIONS";
  title: string;
  body: string;
}

type Channel = EmailChannel | MobileNotificationsChannel;

export async function sendNotifications({
  userId,
  teamId,
  channels,
}: {
  userId: string;
  teamId: string;
  channels: Channel[];
}) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: {
      email: true,
    },
  });
  if (!user) throw new Error("Could not find user to send notification");

  const sent: (typeof notifications.$inferInsert)[] = [];
  for (const channel of channels) {
    if (channel.type === "EMAIL") {
      const result = { data: true }; //TODO: send email lmao

      if (result.data) {
        sent.push({
          sentAt: new Date(),
          subject: channel.subject,
          message: render(channel.react),
          sentToUserId: userId,
          teamId,
          channel: channel.type,
        });
      }
    }
  }

  if (sent.length) await db.insert(notifications).values(sent);
}
