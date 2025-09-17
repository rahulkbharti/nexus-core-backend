import prisma from "../../utils/prisma";
import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import redis from "../../services/redis";
import { v4 as uuidv4 } from "uuid";

import createTokens, {
  createAccessToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import {
  sendOtpEmail,
  sendPasswordResetSuccessEmail,
} from "../../services/emailService";
import { admin } from "googleapis/build/src/apis/admin";
import { Organization } from "../../generated/prisma";
import verifyGoogleToken from "../../services/googleAuthService";

// Only for Staff USER ID
const get_permissions = async (userId: number) => {
  const directPermissions = await prisma.staff.findUnique({
    where: { userId },
    include: {
      permissions: true,
      role: { select: { permissions: true } },
    },
  });
  const permissions = new Set<string>();
  if (directPermissions) {
    directPermissions.permissions.forEach((perm) => permissions.add(perm.name));
    directPermissions.role?.permissions.forEach((perm) =>
      permissions.add(perm.name)
    );
  }
  return permissions;
};
// Login For Any User
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // #1: EFFICIENT DATA FETCHING
    // Fetch the user and all potentially related roles and their organizations in a single query.
    // This avoids extra database calls later.
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        admin: { include: { organizations: true } }, // Include org linked to admin
        staff: { include: { Organization: true } }, // Include org linked to staff
        member: { include: { Organization: true } }, // Include org linked to member
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // #2: SIMPLIFIED & TYPE-SAFE LOGIC
    // Use a switch statement for cleaner, more readable role-based logic.
    let permissions: string[] = [];
    let organization: Organization | null = null;

    switch (user.role) {
      case "ADMIN":
        // Access the nested organization object directly.
        organization = user.admin?.organizations[0] ?? null;
        break;

      case "STAFF":
        organization = user.staff?.Organization ?? null;
        // The original user object already has the id, no need for complex access.
        permissions = Array.from(await get_permissions(user.id));
        break;

      case "MEMBER":
        organization = user.member?.Organization ?? null;
        break;

      default:
        // Handle unexpected roles gracefully
        return res.status(403).json({ message: "User role is not configured" });
    }

    // #3: CREATE JWT PAYLOAD
    // The JWT payload should be lean. Only include essential identifiers.
    const tokens = createTokens({
      userId: user.id, // Direct and simple
      email: user.email,
      permissions,
      role: user.role,
      organizationId: organization?.id ?? 0,
      permissions_updated_at: Date.now(),
    });

    // #4: PREPARE THE RESPONSE OBJECT
    // Remove the password and other sensitive or redundant data before sending.
    const { password: _, admin, staff, member, ...safeUserData } = user;

    const tokenObj = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        ...safeUserData,
        permissions,
        organization, // Include the full organization object here
      },
    };

    return res.status(200).json({ message: "Login Successful", tokenObj });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
// Logout for any User
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken, accessToken } = req.body;
    if (!refreshToken || !accessToken) {
      return res
        .status(400)
        .json({ message: "Refresh Token and Access Token are required" });
    }
    const decodeRefresh = await verifyRefreshToken(refreshToken);
    if (
      decodeRefresh &&
      typeof decodeRefresh !== "string" &&
      typeof decodeRefresh.exp === "number"
    ) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decodeRefresh.exp - now;
      if (expiresIn > 0) {
        await redis.set(
          `refresh_token:${refreshToken}:revoked`,
          "true",
          "EX",
          expiresIn
        );
      }
    }

    // Store access token as revoked
    if (accessToken) {
      // You may need a verifyAccessToken function similar to verifyRefreshToken
      // For now, just store with a default expiry (e.g., 15 minutes)
      const accessTokenExpiry = 15 * 60; // 15 minutes in seconds
      await redis.set(
        `access_token:${accessToken}:revoked`,
        "true",
        "EX",
        accessTokenExpiry
      );
    }
    return res.status(200).json({ message: "Logout Successful" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Somthing Went Wrong" });
  } finally {
    await prisma.$disconnect();
  }
};
export const googleAuth = async (req: Request, res: Response) => {
  const { access_token } = req.body;
  try {
    const responce: any = await verifyGoogleToken(access_token);
    // console.log(responce);
    const user = await prisma.user.findUnique({
      where: { email: responce.email },
      include: {
        admin: { include: { organizations: true } }, // Include org linked to admin
        staff: { include: { Organization: true } }, // Include org linked to staff
        member: { include: { Organization: true } }, // Include org linked to member
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    let permissions: string[] = [];
    let organization: Organization | null = null;

    switch (user.role) {
      case "ADMIN":
        // Access the nested organization object directly.
        organization = user.admin?.organizations[0] ?? null;
        break;

      case "STAFF":
        organization = user.staff?.Organization ?? null;
        // The original user object already has the id, no need for complex access.
        permissions = Array.from(await get_permissions(user.id));
        break;

      case "MEMBER":
        organization = user.member?.Organization ?? null;
        break;

      default:
        // Handle unexpected roles gracefully
        return res.status(403).json({ message: "User role is not configured" });
    }

    // #3: CREATE JWT PAYLOAD
    // The JWT payload should be lean. Only include essential identifiers.
    const tokens = createTokens({
      userId: user.id, // Direct and simple
      email: user.email,
      permissions,
      role: user.role,
      organizationId: organization?.id ?? 0,
      permissions_updated_at: Date.now(),
    });

    // #4: PREPARE THE RESPONSE OBJECT
    // Remove the password and other sensitive or redundant data before sending.
    const { password: _, admin, staff, member, ...safeUserData } = user;

    const tokenObj = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        ...safeUserData,
        permissions,
        organization, // Include the full organization object here
      },
    };

    return res.status(200).json({ message: "Login Successful", tokenObj });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh Token is required" });
    }
    const isRevoked = await redis.get(`refresh_token:${refreshToken}:revoked`);
    if (isRevoked) {
      return res.status(401).json({ message: "Refresh Token Revoked" });
    }
    const decoded = await verifyRefreshToken(refreshToken);
    if (null === decoded) {
      return res.status(401).json({ message: "Invalid Refresh Token" });
    }
    if (decoded && typeof decoded !== "string") {
      const permissions = Array.from(await get_permissions(decoded.userId));
      const token = createAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions,
        organizationId: decoded.organizationId,
        permissions_updated_at: Date.now(),
      });
      return res
        .status(200)
        .json({ message: "Token Refreshed", refreshed_access_token: token });
    }
    return res.status(401).json({ message: "Invalid Refresh Token" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

//
export const GetPermissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const permissions = await prisma.permission.findMany({});
    return res.status(200).json({
      message: "Permissions fetched",
      permissions: Array.from(permissions),
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Update Permission
export const updateStaffPermissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("req.user.role:", req.user.role);
    const { update_permissions, userId } = req.body;
    if (!req.user || req.user.role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "Staff Are Not Allowed To Update Permissions" });
    }
    console.log("Updating permissions for userId:", update_permissions);
    const update = await prisma.staff.update({
      where: { userId, organizationId: req.user.organizationId },
      data: {
        permissions: {
          set: update_permissions,
        },
      },
      include: { permissions: true },
    });
    // I should I have to revoke all access tokens of this user
    await redis.set(
      `permissions_updated_at:${req.user.organizationId}`,
      Date.now().toString()
    );
    return res.status(200).json({ message: "Permissions Updated", update });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};
export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("req.user.role:", req.user.role);
    const { update_permissions, roleId } = req.body;
    if (!req.user || req.user.role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "Staff Are Not Allowed To Update Permissions" });
    }
    // console.log("Updating permissions for roleId:", update_permissions, roleId);
    const update = await prisma.staffRole.update({
      where: { id: roleId, organizationId: req.user.organizationId },
      data: {
        permissions: {
          set: update_permissions,
        },
      },
      include: { permissions: true },
    });
    // console.log("Updated role:", update);
    // I should I have to revoke all access tokens of this user
    await redis.set(
      `permissions_updated_at:${req.user.organizationId}`,
      Date.now().toString()
    );
    return res.status(200).json({ message: "Permissions Updated", update });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as any).code === "P2025"
    ) {
      return res.status(404).json({ message: "Role/Permission not found" });
    }
    console.log(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

/**
 * FORGET PASSWORD
 * RESET PASSWORD FLOW
 * */
const otpStore = new Map(); // In-memory store for OTPs
const resetTokens = new Map(); // In-memory store for reset tokens
const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const otp = generateOtp();
    const otpId = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP details
    otpStore.set(otpId, {
      email,
      otp,
      expiresAt,
      attempts: 0,
    });

    await sendOtpEmail(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otpId, // Send this to the client for the verification step
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};
// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otpId, otp } = req.body;

    if (!otpId || !otp) {
      return res.status(400).json({ error: "OTP ID and OTP are required" });
    }

    const storedOtp = otpStore.get(otpId);

    if (!storedOtp) {
      return res.status(400).json({ error: "Invalid OTP ID" });
    }

    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;

      if (storedOtp.attempts >= 3) {
        otpStore.delete(otpId);
        return res.status(400).json({ error: "OTP expired or invalid" });
      }

      return res.status(400).json({ error: "Invalid OTP" });
    }
    otpStore.delete(otpId);
    const update = await prisma.user.update({
      where: { email: storedOtp.email },
      data: { password: await bcrypt.hash(otp, 10) }, // For demo, using OTP as new password
    });
    await sendPasswordResetSuccessEmail(storedOtp.email);
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};
//  Change Password based on old passsword
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res
        .status(400)
        .json({ message: "Old and New Password are required" });
    }
    if (old_password === new_password) {
      return res
        .status(400)
        .json({ message: "Old and New Password cannot be same" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.roleId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword },
    });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
