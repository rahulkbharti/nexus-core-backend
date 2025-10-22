// import dotenv from "dotenv";
import { Resend } from "resend";

// Load environment variables
// dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

// Email content defaults
const DEFAULT_EMAIL_OPTIONS = {
  from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
};

console.log("Default Email Options:", DEFAULT_EMAIL_OPTIONS);

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Nodemailer response
 */
const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}): Promise<object> => {
  try {
    // // 1. Create reusable transporter object
    // const transporter = nodemailer.createTransport(EMAIL_CONFIG as any);

    // // 2. Send mail with defined transport object
    // const info = await transporter.sendMail({
    //   ...DEFAULT_EMAIL_OPTIONS,
    //   to,
    //   subject,
    //   text,
    //   html,
    // });
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { error }; // Re-throw to allow caller to handle
    }
    console.log("Email sent successfully:", data);
    return data;
    // console.log("Message sent: %s", info.messageId);
    // return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return { error }; // Re-throw to allow caller to handle
  }
};

export default sendEmail;
