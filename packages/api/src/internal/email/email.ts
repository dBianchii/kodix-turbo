import { renderAsync } from "@react-email/components";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// if (!process.env.AWS_SMTP_USER || !process.env.AWS_SMTP_PASSWORD)
//   throw new Error("Missing AWS credentials");

// const ses = new aws.SES({
//   apiVersion: "2010-12-01",
//   region: "sa-east-1", // Your region will need to be updated
//   credentials: {
//     accessKeyId: process.env.AWS_SMTP_USER,
//     secretAccessKey: process.env.AWS_SMTP_PASSWORD,
//   },
//   serviceId: "ses",
// });

// const transporter = nodemailer.createTransport({ //? For sending emails with AWS SMTP
//   SES: { ses, aws },
// });

// const transporter = nodemailer.createTransport({ //? For sending emails with resend SMTP
//   host: "smtp.resend.com",
//   port: 465,
//   auth: {
//     user: "resend",
//     pass: process.env.RESEND_API_KEY,
//   },
// });

//get the type of parameters from emails.send
type CreateEmailOptions = Parameters<typeof resend.emails.send>[0];

export async function sendEmail(
  mailOptions: CreateEmailOptions & { react: JSX.Element },
) {
  // const result = await transporter.sendMail({ ...options, html });
  const html = await renderAsync(mailOptions.react); //TODO: remove this rendering to html process once this is resolved https://github.com/resendlabs/resend-node/issues/256
  return await resend.emails.send({ ...mailOptions, html });
}
