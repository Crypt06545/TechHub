import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // e.g. "ZUHR <orders@send.zuhrbd.com>"
      to: sendTo,
      subject: subject,
      html: html,
    });
    if (error) {
      console.error("[Resend API Error]:", error);
      return { success: false, error };
    }

    console.log({ data });
    return { success: true, data };
  } catch (error) {
    console.error("[Resend] Unexpected error:", error);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
