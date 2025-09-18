import prisma from "../../utils/prisma";
import { type Request, type Response } from "express";
import { Role } from "../../generated/prisma";
import bcrypt from "bcryptjs";
import { welcomeAdmin } from "../../services/authEmailService";
// Create Admin
export const registerAdmin = async (req: Request, res: Response) => {
  const { email, password, name, orgName, orgAddress, superAdmin } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
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
