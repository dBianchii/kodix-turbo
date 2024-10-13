import Expo from "expo-server-sdk";
import { render } from "@react-email/render";

import { db } from "@kdx/db/client";
import { notifications } from "@kdx/db/schema";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kdx/shared";

import { resend } from "../sdks/email";
import { expo } from "../utils/expo";

interface EmailChannel {
  type: "EMAIL";
  react: JSX.Element;
  subject: Parameters<typeof resend.emails.send>[0]["subject"];
}

interface PushNotificationsChannel {
  type: "PUSHNOTIFICATIONS";
  title: string;
  body: string;
}

type Channel = EmailChannel | PushNotificationsChannel;

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
    with: {
      ExpoTokens: true,
    },
  });
  if (!user) throw new Error("Could not find user to send notification");

  const sent: (typeof notifications.$inferInsert)[] = [];

  for (const channel of channels) {
    if (channel.type === "EMAIL") {
      const result = await resend.emails.send({
        from: KODIX_NOTIFICATION_FROM_EMAIL,
        to: user.email,
        subject: channel.subject,
        react: channel.react,
      });

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

    if (channel.type === "PUSHNOTIFICATIONS") {
      if (!user.ExpoTokens.length) continue; //TODO: Should we error?

      const toSendPushNotifications: {
        to: string;
        sound: "default";
        body: string;
        data: Record<string, string>;
      }[] = [];
      for (const { token } of user.ExpoTokens) {
        if (!Expo.isExpoPushToken(token)) {
          console.error(
            `Push token ${token as string} is not a valid Expo push token`,
          );
          continue;
        }
        toSendPushNotifications.push({
          to: token,
          sound: "default",
          body: channel.body,
          data: {
            title: channel.title,
          },
        });
      }
      const chunks = expo.chunkPushNotifications(toSendPushNotifications);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation:
          // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        } catch (error) {
          console.error(error);
        }
      }

      const receiptIds: string[] = [];
      for (const ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.status === "ok") {
          receiptIds.push(ticket.id);
        }
      }
    }
  }

  if (sent.length) await db.insert(notifications).values(sent);
}
