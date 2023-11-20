import type { SendVerificationRequestParams } from "next-auth/providers";
import { Resend } from "resend";

import VerificationRequestEmail from "./templates/verification-request";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams,
) => {
  try {
    await resend.emails.send({
      from: "notification@kodix.com.br",
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
