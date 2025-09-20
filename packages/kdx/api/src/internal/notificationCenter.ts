import type { JSX } from "react";
import type { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kodix/shared/constants";
import { getSuccessesAndErrors } from "@kodix/shared/utils";
import { render } from "@react-email/render";
import Expo from "expo-server-sdk";

import type { notifications } from "@kdx/db/schema";
import { notificationRepository, userRepository } from "@kdx/db/repositories";

import { resend } from "../sdks/email";
import { expo } from "../utils/expo";

interface EmailChannel {
  type: "EMAIL";
  react: JSX.Element;
  subject: Parameters<typeof resend.emails.send>[0]["subject"];
}

interface PushNotificationsChannel {
  type: "PUSH_NOTIFICATIONS";
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
  const user = await userRepository.findUserById(userId);
  if (!user) throw new Error("Could not find user to send notification");

  //* 1. Prepare the messages to send in Promise arrays
  const toSendEmailPromises: Promise<{
    resendResult: Awaited<ReturnType<typeof resend.emails.send>>;
    toSendObj: {
      from: string;
      to: string;
      subject: string;
      react: JSX.Element;
    };
  }>[] = [];
  const toSendPushNotificationsPromises: Promise<ExpoPushTicket[]>[] = [];

  let sentMessages: (typeof notifications.$inferInsert & {
    expoToken?: string;
  })[] = [];

  for (const channel of channels) {
    if (channel.type === "EMAIL") {
      const sendEmailPromise = (async () => {
        const toSendObj = {
          from: KODIX_NOTIFICATION_FROM_EMAIL,
          to: user.email,
          subject: channel.subject,
          react: channel.react,
        };
        const resendResult = await resend.emails.send(toSendObj);

        return {
          resendResult,
          toSendObj,
        };
      })();
      toSendEmailPromises.push(sendEmailPromise);
    }

    if (channel.type === "PUSH_NOTIFICATIONS") {
      if (!user.ExpoTokens.length) continue;

      const toSendPushNotifications: ExpoPushMessage[] = [];
      for (const { token } of user.ExpoTokens) {
        if (!Expo.isExpoPushToken(token)) {
          console.error(
            `Push token ${token as string} is not a valid Expo push token`,
          );
          continue;
        }

        toSendPushNotifications.push({
          title: channel.title,
          to: token,
          sound: "default",
          body: channel.body,
        });
        sentMessages.push({
          expoToken: token,
          sentAt: new Date(),
          subject: channel.title,
          message: channel.body,
          sentToUserId: userId,
          teamId,
          channel: "PUSH_NOTIFICATIONS",
        });
      }

      const chunks = expo.chunkPushNotifications(toSendPushNotifications);
      for (const chunk of chunks) {
        toSendPushNotificationsPromises.push(
          expo.sendPushNotificationsAsync(chunk),
        );
      }
    }
  }

  //* 2. Prepare the messages to send with Promise.allSettled
  //* 2.1 Send emails
  const emailResults = await Promise.allSettled(toSendEmailPromises);
  //TODO: handle _emailErrors errors
  const { successes: emailSuccesses, errors: _emailErrors } =
    getSuccessesAndErrors(emailResults);
  for (const emailSuccess of emailSuccesses) {
    if (emailSuccess.value.resendResult.data?.id) {
      sentMessages.push({
        sentAt: new Date(),
        subject: emailSuccess.value.toSendObj.subject,
        message: render(emailSuccess.value.toSendObj.react),
        sentToUserId: userId,
        teamId,
        channel: "EMAIL",
      });
    }
  }

  //* 2.2 Send push notifications
  const pushNotificationsResults = await Promise.allSettled(
    toSendPushNotificationsPromises,
  );
  //TODO: handle _pushNotifsErrors errors
  const { successes: pushNotifsSuccesses, errors: _pushNotifsErrors } =
    getSuccessesAndErrors(pushNotificationsResults);

  const tickets: ExpoPushTicket[] = pushNotifsSuccesses.flatMap(
    (pushNotifSuccess) => pushNotifSuccess.value,
  );
  const receiptIds: string[] = [];
  const toDeleteExpoPushTokens: string[] = [];
  for (const ticket of tickets) {
    if (ticket.status === "error") {
      if (ticket.details?.expoPushToken) {
        sentMessages = sentMessages.filter(
          (x) => x.expoToken !== ticket.details?.expoPushToken,
        );
      }

      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      if (ticket.details?.error === "DeviceNotRegistered") {
        if (ticket.details.expoPushToken)
          toDeleteExpoPushTokens.push(ticket.details.expoPushToken);

        continue;
      }

      console.error(
        `There was an unhandled error sending a push notification: ${ticket.message}`,
      );
    }
    if (ticket.status === "ok") {
      receiptIds.push(ticket.id); //TODO: figure out what to do with receipts: https://github.com/expo/expo-server-sdk-node
    }
  }

  //* 3 Interact with our db depending on the results
  if (toDeleteExpoPushTokens.length)
    await notificationRepository.deleteManyExpoTokens(toDeleteExpoPushTokens);
  if (sentMessages.length)
    await notificationRepository.createManyNotifications(sentMessages);
}
