import sendEmail from "./emailService";
// import dotenv from "dotenv";

// dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

const sendFeedbackEmail = async ({ feedbackData }: { feedbackData: any }) => {
  // console.log(feedbackData, process.env.ENV_FILE);
  const message = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    
    <div style="background-color: #34495e; padding: 20px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">New Feedback Received</h1>
    </div>

    <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
      <p style="margin: 0 0 20px 0;">Hello System Administrator,</p>
      
      <p style="margin: 0 0 25px 0;">
        A user has just submitted feedback for the ERP platform.
      </p>

      <div style="background-color: #f2f3f5; border-left: 4px solid #34495e; padding: 15px 20px; margin-bottom: 25px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;"><strong>Submitted By:</strong></p>
        <p style="margin: 0 0 5px 0;"><strong>Name:</strong> ${
          feedbackData.name
        }</p>
        <p style="margin: 0 0 5px 0;"><strong>Email:</strong> <a href="mailto:${
          feedbackData.email
        }" style="color: #2c3e50; text-decoration: none;">${
    feedbackData.email
  }</a></p>
        <p style="margin: 0;"><strong>Role:</strong> ${feedbackData.role}</p>
      </div>

      <div style="background-color: #f2f3f5; border-left: 4px solid #34495e; padding: 15px 20px; margin-bottom: 25px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;"><strong>Ratings Provided (out of 5):</strong></p>
        <p style="margin: 0 0 5px 0;"><strong>Ease of Use:</strong> ${
          feedbackData?.easeOfUseRating
        }</p>
        <p style="margin: 0 0 5px 0;"><strong>Features:</strong> ${
          feedbackData?.featuresRating
        }</p>
        <p style="margin: 0 0 5px 0;"><strong>Performance:</strong> ${
          feedbackData?.performanceRating
        }</p>
        <p style="margin: 0;"><strong>Support:</strong> ${
          feedbackData?.supportRating
        }</p>
      </div>

      <p style="margin: 0 0 10px 0; font-weight: bold;">Suggestions:</p>
      <p style="margin: 0 0 25px 0; padding: 10px; background-color: #fdfdfd; border: 1px dashed #ccc; border-radius: 4px; font-style: italic; color: #555;">
        ${
          feedbackData?.suggestions
            ? feedbackData.suggestions
            : "No suggestions provided."
        }
      </p>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <a href="[Your Feedback Dashboard URL]" target="_blank" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
          View All Feedback
        </a>
      </div>
      
      <p style="margin: 10px 0 0 0;">Sincerely,<br>The System Administrator</p>
    </div>

    <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
        <p style="margin: 0;">This is an automated notification from your ERP System.</p>
        <p style="margin: 5px 0 0 0;">Please do not reply directly to this email.</p>
    </div>

  </div>
</div>
  `;
  if (process.env.ENV_FILE === ".env.development") {
    console.log("message send ");
    return;
  }
  if (process.env.FEEDBACK_EMAIL) {
    await sendEmail({
      to: process.env.FEEDBACK_EMAIL,
      subject: "New Feedback Received",
      html: message,
    });
  }
};
export default sendFeedbackEmail;
