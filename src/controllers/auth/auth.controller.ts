import prisma from "../../utils/prisma";
import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import redis from "../../services/redis";
import createTokens, {
  createAccessToken,
  verifyRefreshToken,
} from "../../utils/jwt";

// Only for Staff USER ID
const get_permissions = async (userId: number) => {
  const directPermissions = await prisma.staff.findUnique({
    where: { userId },
    include: {
      directPermissions: true,
      group: { select: { permissions: true } },
    },
  });
  const permissions = new Set<string>();
  if (directPermissions) {
    directPermissions.directPermissions.forEach((perm) =>
      permissions.add(perm.name)
    );
    directPermissions.group?.permissions.forEach((perm) =>
      permissions.add(perm.name)
    );
  }
  return permissions;
};

export const login = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { [role]: true },
    });

    if (!user || !user[role]) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const { password: _, ...safeUserData } = user;
    let permissions: string[] = [];
    const userId: number = (user[role] as { userId?: number })?.userId ?? 0;
    if (role === "staff") {
      const staffUser = user[role] as { userId?: number };
      if (staffUser && staffUser.userId) {
        permissions = Array.from(await get_permissions(staffUser.userId));
      }
    }
    let organizationId: number = 0;
    if (role === "staff" || role == "member") {
      organizationId =
        (user[role] as { organizationId?: number })?.organizationId || 0;
    } else if (role === "admin") {
      const _organizationId = await prisma.organization.findFirst({
        where: { adminUserId: userId },
        select: { id: true },
      });
      organizationId = _organizationId?.id || 0;
    }
    const tokens = createTokens({
      userId: userId,
      email: user.email,
      permissions,
      role: user.role,
      organizationId,
    });
    const tokenObj = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { ...safeUserData, permissions },
    };
    return res.status(200).json({ message: "Login Successful", tokenObj });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};

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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
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

export const updatePermissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { update_permissions, userId } = req.body;
    if (!req.user || req.user.role !== "ADMIN" || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Staff Are Not Allowed To Update Permissions" });
    }
    const update = await prisma.staff.update({
      where: { userId, organizationId: req.user.organizationId },
      data: {
        directPermissions: {
          set: update_permissions,
        },
      },
      include: { directPermissions: true },
    });
    res.status(200).json({ message: "Permissions Updated", update });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};
