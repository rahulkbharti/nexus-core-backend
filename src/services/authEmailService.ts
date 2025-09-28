// Corrected imports - removed unused ones
import sendEmail from "./emailService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

// Centralized constants for easy management
const OTP_EXPIRE = "10 minutes";
const RECOVERY_URL = "http://localhost:3000/auth/recover-password";
const LOGIN_URL = "http://localhost:3000/auth/login";
const STAFF_LOGIN_URL = "http://localhost:3000/auth/staff-login"; // Added for staff
const PLATFORM_NAME = "Library Management System";
const SUPPORT_EMAIL = "support@example.com"; // Using a more professional-looking email

console.log("node env", process.env.NODE_ENV);
// OTP SEND EMAIL
export const sendOTP = async ({
  name,
  orgName,
  email,
  otp,
}: {
  name: string;
  orgName: string;
  email: string;
  otp: string;
}) => {
  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0056b3; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">Your Verification Code</h1>
        </div>
        <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
          <p style="margin: 0 0 15px 0;">Hi <strong>${name}</strong>,</p>
          <p style="margin: 0 0 25px 0;">You requested a one-time password to reset your password. Please use the code below to proceed.</p>
          <div style="background-color: #eef4ff; border-left: 4px solid #007bff; padding: 20px 25px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">Your One-Time Password is:</p>
            <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #004085; letter-spacing: 4px;">${otp}</p>
          </div>
          <p style="font-size: 14px; color: #6c757d; text-align: center;">This code will expire in <strong>${OTP_EXPIRE}</strong>.</p>
          <p style="font-size: 14px; color: #c0392b; text-align: center; margin-top: 20px;"><strong>If you did not request this, please ignore this email.</strong> Do not share this code with anyone.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </div>`;
  if (process.env.NODE_ENV === "development") {
    console.log(`Sending OTP:- TO : ${email}, OTP :${otp}`);
    return;
  }
  await sendEmail({ to: email, subject: "Your Verification Code", html: body });
};

// SUCCUSSFULLY CHANGE PASSWORD
export const successfullyChangePassword = async ({
  name,
  orgName,
  orgAddress,
  email,
}: {
  name: string;
  orgName: string;
  orgAddress: string;
  email: string;
}) => {
  // CRITICAL FIX: Generate the current date and time dynamically.
  const changeTime = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #28a745; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">Password Updated Successfully</h1>
        </div>
        <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
          <p style="margin: 0 0 15px 0;">Hi <strong>${name}</strong>,</p>
          <p style="margin: 0 0 25px 0;">This is a confirmation that the password for your ${orgName} account has been successfully changed.</p>
          <p style="font-size: 14px; color: #555; margin: 0 0 25px 0;">This change was processed on: <strong>${changeTime}</strong>.</p>
          <div style="background-color: #fff3f3; border-left: 4px solid #c0392b; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #c0392b;">Important Security Notice</p>
            <p style="margin: 0 0 20px 0; font-size: 15px; color: #333;">If you did not authorize this change, your account may have been compromised. Please secure your account immediately by clicking the button below.</p>
            <div style="text-align: center;">
              <a href="${RECOVERY_URL}" target="_blank" style="display: inline-block; background-color: #c82333; color: #ffffff; padding: 12px 25px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 5px;">Secure Your Account Now</a>
            </div>
          </div>
          <p style="margin: 0;">If you did make this change, you can safely disregard this notice.</p>
          <p style="margin: 10px 0 0 0;">Thank you,<br>The ${orgName} Team</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">This security alert was sent to ${email}.</p>
            <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} ${orgName} | ${orgAddress}</p>
        </div>
      </div>
    </div>`;
  if (process.env.NODE_ENV === "development") {
    console.log(`Password Change for ${email}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: "Password Change Confirmation",
    html: body,
  });
};

// WELCOME EMAIL MEMBER
export const welcomeMember = async ({
  name,
  email,
  orgName,
  orgAddress,
  password,
}: {
  name: string;
  email: string;
  orgName: string;
  orgAddress: string;
  password: string;
}) => {
  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1d7c4d; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">Welcome to the Community!</h1>
        </div>
        <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
          <p style="margin: 0 0 15px 0;">Hi <strong>${name}</strong>,</p>
          <p style="margin: 0 0 25px 0;">We're thrilled to have you join the <strong>${orgName}</strong> family! Your new library account is your key to a world of knowledge, stories, and discovery.</p>
          <p style="margin: 0 0 15px 0;">With your account, you can:</p>
          <ul style="margin: 0 0 25px 0px; padding: 0; list-style: none;">
            <li style="margin-bottom: 10px;">✅ Browse and reserve books from our online catalog.</li>
            <li style="margin-bottom: 10px;">✅ Access our collection of digital e-books and audiobooks.</li>
            <li>✅ Manage your loans and view your borrowing history.</li>
          </ul>
          <div style="background-color: #f0f9f4; border-left: 4px solid #28a745; padding: 15px 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">Log in with these details:</p>
            <p style="margin: 0 0 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #1d7c4d; text-decoration: none;">${email}</a></p>
            <p style="margin: 0;"><strong>First-Time Password:</strong> <strong style="font-family: 'Courier New', Courier, monospace; font-size: 18px; color: #d63384;">${password}</strong></p>
          </div>
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${LOGIN_URL}" target="_blank" style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">Explore the Digital Library</a>
          </div>
          <p style="margin: 0;">Happy reading!</p>
          <p style="margin: 10px 0 0 0;">The ${orgName} Team</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
          <p style="margin: 0;">This email was sent to ${email}.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} ${orgName} | ${orgAddress}</p>
        </div>
      </div>
    </div>`;
  if (process.env.NODE_ENV === "development") {
    console.log(`Welcome Member :- Name :${name}, Email : ${email}`);
    return;
  }
  await sendEmail({ to: email, subject: `Welcome to ${orgName}!`, html: body });
};

// WELCOME EMAIL STAFF
export const welcomeStaff = async ({
  name,
  email,
  role,
  orgName,
  orgAddress,
  password,
}: {
  name: string;
  email: string;
  role: string;
  orgName: string;
  orgAddress: string;
  password: string;
}) => {
  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">Welcome to the ${orgName} Team</h1>
        </div>
        <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
          <p style="margin: 0 0 15px 0;">Hello <strong>${name}</strong>,</p>
          <p style="margin: 0 0 25px 0;">Welcome aboard! Your staff account for <strong>${orgName}</strong> with the role of <strong>${role}</strong> has been created. This account will provide you with the necessary access to manage library operations and assist our members.</p>
          <div style="background-color: #f2f3f5; border-left: 4px solid #34495e; padding: 15px 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">Please use the following credentials to access the Staff Portal:</p>
            <p style="margin: 0 0 5px 0;"><strong>Staff Email:</strong> <a href="mailto:${email}" style="color: #2c3e50; text-decoration: none;">${email}</a></p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <strong style="font-family: 'Courier New', Courier, monospace; font-size: 18px; color: #d63384;">${password}</strong></p>
          </div>
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${STAFF_LOGIN_URL}" target="_blank" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">Access the Staff Portal</a>
          </div>
          <p style="font-size: 14px; color: #c0392b; text-align: center; margin: 0 0 20px 0;"><strong>Important:</strong> For security reasons, you will be required to change this temporary password after your first login.</p>
          <p style="margin: 0;">We look forward to working with you.</p>
          <p style="margin: 10px 0 0 0;">Sincerely,<br>The ${orgName} Administration</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
          <p style="margin: 0;">This is an automated notification for staff of ${orgName}.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} ${orgName} | ${orgAddress}</p>
        </div>
      </div>
    </div>`;
  if (process.env.NODE_ENV === "development") {
    console.log(`Welcome Staff :- Name :${name}, Email : ${email}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: `Your Staff Account for ${orgName}`,
    html: body,
  });
};
// Admin Register OTP
export const sendAdminVerificationOTP = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0056b3; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">Verify Your Email Address</h1>
        </div>
        <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
          <p style="margin: 0 0 25px 0;">Welcome to ${PLATFORM_NAME}! To complete your admin account setup, please use the verification code below.</p>
          <div style="background-color: #eef4ff; border-left: 4px solid #007bff; padding: 20px 25px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">Your Verification Code is:</p>
            <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #004085; letter-spacing: 4px;">${otp}</p>
          </div>
          <p style="font-size: 14px; color: #6c757d; text-align: center;">This code will expire in <strong>${OTP_EXPIRE}</strong>.</p>
          <p style="font-size: 14px; color: #c0392b; text-align: center; margin-top: 20px;"><strong>If you did not request to create an account, please ignore this email.</strong> Do not share this code with anyone.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </div>`;
  if (process.env.NODE_ENV === "development") {
    console.log(`ADMIN account OTP send to Email : ${email} , OPT : ${otp}`);
    return;
  }
  await sendEmail({ to: email, subject: "Your Verification Code", html: body });
};
// WELCOME ADMIN
export const welcomeAdmin = async ({
  name,
  email,
  orgName,
}: {
  name: string;
  email: string;
  orgName: string; // CRITICAL FIX: Added missing parameter
}) => {
  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4a148c; padding: 25px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 600;">Welcome to ${PLATFORM_NAME}!</h1>
        </div>
        <div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333333;">
          <p style="margin: 0 0 15px 0;">Hi <strong>${name}</strong>,</p>
          <p style="margin: 0 0 25px 0;">A very warm welcome to the ${PLATFORM_NAME} family! We are thrilled to partner with <strong>${orgName}</strong> and are excited to help you build a modern, efficient library management experience.</p>
          <p style="font-size: 18px; font-weight: 500; color: #333; margin-bottom: 20px;">Your account is ready. Here are the first few steps to get your library up and running:</p>
          <div style="background-color: #f9f6ff; border-left: 4px solid #673ab7; padding: 15px 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0;">✅ <strong>Step 1: Configure Your Library</strong><br><span style="font-size: 14px; color: #555;">Create halls for seating and set your library's operating hours.</span></p>
            <p style="margin: 0 0 10px 0;">✅ <strong>Step 2: Add Your Staff</strong><br><span style="font-size: 14px; color: #555;">Start inviting your team members and assign them roles.</span></p>
            <p style="margin: 0;">✅ <strong>Step 3: Begin Adding Books</strong><br><span style="font-size: 14px; color: #555;">Upload your book collection to build your digital catalog.</span></p>
          </div>
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${LOGIN_URL}" target="_blank" style="display: inline-block; background-color: #5e35b1; color: #ffffff; padding: 14px 35px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">Go to Your Admin Dashboard</a>
          </div>
          <p style="margin: 0;">We wish you all the best and are here to support you on your journey.</p>
          <p style="margin: 10px 0 0 0;">Excited to have you with us,<br>The ${PLATFORM_NAME} Team</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999;">
          <p style="margin: 0;">Have questions? Contact our support team at <a href="mailto:${SUPPORT_EMAIL}" style="color: #5e35b1;">${SUPPORT_EMAIL}</a>.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.</p>
        </div>
      </div>
    </div>`;
  if (process.env.NODE_ENV === "development") {
    console.log(`Welcome Admin :- Name :${name}, Email : ${email}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: `Welcome to ${PLATFORM_NAME}!`,
    html: body,
  });
};
