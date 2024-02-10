import { Resend } from "resend";

import { kodixNotificationFromEmail } from "@kdx/react-email/constants";
import VerificationRequestEmail from "@kdx/react-email/verification-request";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationRequest = async (params: {
  identifier: string;
  url: string;
}) => {
  try {
    await resend.emails.send({
      from: kodixNotificationFromEmail,
      to: params.identifier,
      subject: "Kodix login verification",
      react: VerificationRequestEmail({
        magicLink: params.url,
      }),
    });
  } catch (error) {
    console.log({ error });
  }
};
