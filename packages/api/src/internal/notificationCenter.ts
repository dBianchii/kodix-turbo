import { render } from "@react-email/render";

import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

import type { resend } from "../utils/email";

interface EmailChannel {
  type: "EMAIL";
  react: JSX.Element;
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
    if (channel.type === "EMAIL") {
      const result = { data: true };

      if (result.data) {
        sent.push({
          id: nanoid(),
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

  if (sent.length) await db.insert(schema.notifications).values(sent);
}
