import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.developement" });

// console.log('Environment:', process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);
// Email configuration constants
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // Convert string to boolean
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

// Email content defaults
const DEFAULT_EMAIL_OPTIONS = {
  from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
};

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
    // 1. Create reusable transporter object
    const transporter = nodemailer.createTransport(EMAIL_CONFIG as any);

    // 2. Send mail with defined transport object
    const info = await transporter.sendMail({
      ...DEFAULT_EMAIL_OPTIONS,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return { error }; // Re-throw to allow caller to handle
  }
};

export default sendEmail;
