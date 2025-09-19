import prisma from "../../utils/prisma";
import { type Request, type Response } from "express";
import { Role } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
// import { welcomeAdmin } from "../../services/authEmailService";
import redis from "../../services/redis";
import { v4 as uuidv4 } from "uuid";

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();
// const generateOtp = (): string => "123456";

// VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response) => {
  console.log("Verify Email Called");
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      return res.status(400).json({ message: "Email Already Registered" });
    }
    // Generate and store OTP in Redis with expiration
    const otpId = uuidv4();
    const otp = generateOtp();

    await redis.set(otpId, JSON.stringify({ email, otp }), "EX", 300); // OTP valid for 5 minutes
    // In real application, send OTP to user's email here
    console.log(`OTP for ${email}: ${otp}`); // For demonstration purposes only
    return res.status(200).json({ message: "OTP sent successfully", otpId });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
// VERIFY OTP
export const verifyOTP = async (req: Request, res: Response) => {
  const { otpId, otp } = req.body;
  try {
    const data = await redis.get(otpId);
    if (!data) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    const { email, otp: storedOtp } = JSON.parse(data);
    // In real application, verify the OTP here
    if (otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // Generate a reset token for password setup
    const accountCreateToken = uuidv4();
    await redis.set(accountCreateToken, JSON.stringify({ email }), "EX", 600); // Reset token valid for 10 minutes
    await redis.del(otpId); // Invalidate the OTP after successful verification
    console.log(`Account creation token for ${email}: ${accountCreateToken}`); // For demonstration purposes only
    return res.status(200).json({
      message: "OTP verified successfully",
      token: accountCreateToken,
      email: email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
// Create Admin
export const registerAdmin = async (req: Request, res: Response) => {
  const { token, email, password, name, orgName, orgAddress, superAdmin } =
    req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const tokenData = await redis.get(token);
    if (!tokenData) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const { email: tokenEmail } = JSON.parse(tokenData);
    console.log(tokenEmail, email);
    if (tokenEmail !== email) {
      return res.status(400).json({ message: "Email does not match token" });
    }
    await redis.del(token); // Invalidate the token after successful use

    // Generate a random serial number between 100000 and 999999
    const serialNumber = Math.floor(1000 + Math.random() * 9000);

    const admin = await prisma.admin.create({
      data: {
        user: {
          create: {
            email: email,
            password: hashedPassword,
            name: name,
            role: Role.ADMIN,
          },
        },
        organizations: {
          create: [
            {
              name: orgName || `Organization ${serialNumber}`,
              address: orgAddress || "Default Address",
            },
          ],
        },
        superAdmin: superAdmin || false,
      },
      include: {
        user: true,
      },
    });
    const { password: _, ...safeUser } = admin.user;
    const safeAdmin = { ...admin, user: safeUser };

    // Send welcome email
    // welcomeAdmin({ email, name, orgName }).catch((err) => {
    //   console.error("Failed to send welcome email:", err);
    // });

    return res.status(201).json(safeAdmin);
  } catch (error: unknown) {
    console.log(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      res.status(400).json({ messsage: "Email Already Registed" });
      return;
    }
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
// Get All Admin
export const getAdmins = async (req: Request, res: Response) => {
  try {
    console.time("Get Admin API");
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [admins, totol] = await Promise.all([
      prisma.admin.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: { user: { omit: { password: true } } },
      }),
      prisma.admin.count({}),
    ]);
    console.timeEnd("Get Admin API");
    return res.status(200).json({
      data: admins,
      page: pageNumber,
      limit: limitNumber,
      total: totol,
      pages: Math.ceil(totol / limitNumber),
    });
  } catch (error) {
    console.timeEnd("Get Admin API");
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
// Get Admin By Email
export const getAdminByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    const admin = await prisma.admin.findFirst({
      where: { user: { email } },
      include: { user: true },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const { password, ...safeUser } = admin.user;
    return res.status(200).json({ ...admin, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Get Admin By userId
export const getAdminByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const admin = await prisma.admin.findFirst({
      where: { userId: Number(userId) },
      include: { user: true },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const { password, ...safeUser } = admin.user;
    return res.status(200).json({ ...admin, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Update Admin
export const updateAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email, superAdmin } = req.body;
  try {
    const admin = await prisma.admin.update({
      where: { userId: Number(userId) },
      data: {
        user: {
          update: {
            name,
            email,
          },
        },
        superAdmin,
      },
      include: { user: true },
    });
    const { password, ...safeUser } = admin.user;
    return res.status(200).json({ ...admin, user: safeUser });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === "P2025"
    ) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Delete Admin
export const deleteAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await prisma.admin.delete({
      where: { userId: Number(userId) },
    });
    return res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === "P2025"
    ) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
