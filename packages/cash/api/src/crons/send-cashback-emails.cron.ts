import {
  caRepository,
  cashbackRepository,
  magicLinkRepository,
} from "@cash/db/repositories";
import CashWelcome from "@cash/react-email/cash-welcome";
import dayjs from "@kodix/dayjs";
import { getPostHogServer } from "@kodix/posthog";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kodix/shared/constants";
import { getBaseUrl, nanoid } from "@kodix/shared/utils";

import { resend } from "../sdks/resend";
import { verifiedQstashCron } from "./_utils";

export const sendCashbackEmailsCron = verifiedQstashCron(async () => {
  const posthog = getPostHogServer();

  try {
    const clientsWithCashbackAndNoAccount =
      await caRepository.getClientsWithCashbackWithoutAccount();

    if (!clientsWithCashbackAndNoAccount.length) {
      return new Response("No clients with cashback found. Skipping", {
        status: 202,
      });
    }

    // Prepare email data for all clients
    const emailDataResults = await Promise.all(
      clientsWithCashbackAndNoAccount.map(async (client) => {
        try {
          if (!client.email) {
            // biome-ignore lint/suspicious/noConsole: Logging for observability
            console.warn(`Client ${client.id} has no email, skipping`);
            return null;
          }

          const totalCashback =
            await cashbackRepository.getTotalCashbackByClientId(client.id);

          if (totalCashback <= 0) {
            return null;
          }

          const token = nanoid();
          const expiresAt = dayjs().add(7, "day").toISOString();

          await magicLinkRepository.createMagicLinkToken({
            clientId: client.id,
            expiresAt,
            token,
          });

          const magicLinkUrl = `${getBaseUrl()}/auth/magic-link?token=${token}`;
          const cashbackFormatted = totalCashback.toFixed(2).replace(".", ",");

          return {
            clientId: client.id,
            email: {
              from: KODIX_NOTIFICATION_FROM_EMAIL,
              react: CashWelcome({
                cashbackAmount: cashbackFormatted,
                registerUrl: magicLinkUrl,
                username: client.name,
              }),
              subject: `Você ganhou R$ ${cashbackFormatted} de cashback!`,
              to: client.email,
            },
          };
        } catch {
          posthog.captureException(error, undefined, {
            clientId: client.id,
            context: "prepareEmailData",
          });
          return null;
        }
      }),
    );

    const validEmailData = emailDataResults.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    if (!validEmailData.length) {
      return new Response("No emails to send. Skipping", {
        status: 202,
      });
    }

    const { error } = await resend.batch.send(
      validEmailData.map((item) => item.email),
    );

    if (error) {
      posthog.captureException(error, undefined, {
        context: "sendBatchEmails",
      });
      return new Response("Failed to send emails", {
        status: 500,
      });
    }

    await caRepository.updateClientsByIds(
      validEmailData.map((item) => item.clientId),
      {
        firstCashbackEmailSentAt: new Date().toISOString(),
      },
    );

    const emailsSent = validEmailData.length;

    // biome-ignore lint/suspicious/noConsole: Logging for observability
    console.log(`[Cashback Emails] Sent ${emailsSent} emails`);

    return new Response(`Sent ${emailsSent} cashback emails`);
  } catch (error) {
    posthog.captureException(error);
    throw error;
  } finally {
    await posthog.shutdown();
  }
});
