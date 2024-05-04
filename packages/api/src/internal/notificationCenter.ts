import { render } from "@react-email/render";

import { db } from "@kdx/db";
import { schema } from "@kdx/db/schema";
import { kodixNotificationFromEmail, nanoid } from "@kdx/shared";

import { resend } from "../utils/email";

interface EmailChannel {
  type: "email";
  react: JSX.Element;
  from: Parameters<typeof resend.emails.send>[0]["from"];
  to: Parameters<typeof resend.emails.send>[0]["to"];
  subject: Parameters<typeof resend.emails.send>[0]["subject"];
}

type Channel = EmailChannel;

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

  const sent: (typeof schema.notifications.$inferInsert)[] = [];
  for (const channel of channels) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (channel.type === "email") {
      const result = await resend.emails.send({
        from: kodixNotificationFromEmail,
        to: user.email,
        subject: channel.subject,
        react: channel.react,
      });

      if (result.data) {
        sent.push({
          id: nanoid(),
          sentAt: new Date(),
          message: render(channel.react),
          sentToUserId: userId,
          teamId,
        });
      }
    }
  }

  await db.insert(schema.notifications).values(sent);
}