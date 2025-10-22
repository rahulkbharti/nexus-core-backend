import { Resend } from "resend";

const DEFAULT_EMAIL_OPTIONS = {
  from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
};

console.log("Default Email Options:", DEFAULT_EMAIL_OPTIONS);

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
    const resendClient = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resendClient.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { error };
    }
    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return { error };
  }
};

export default sendEmail;
