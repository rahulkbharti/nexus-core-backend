import prisma from "../../utils/prisma.ts";
import { type Request, type Response } from "express";
import { Role } from "../../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
// Create Admin
export const registerAdmin = async (req: Request, res: Response) => {
  const { email, password, name, superAdmin } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(email);
  try {
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
              name: "Default Organization d",
              address: "Default Organization",
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
