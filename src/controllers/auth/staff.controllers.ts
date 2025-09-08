import type { Request, Response } from "express";
import prisma from "../../utils/prisma.ts";
import { Role } from "../../../generated/prisma/index.js";
import bcrypt from "bcryptjs";

export const registerStaff = async (req: Request, res: Response) => {
  try {
    const { email, password, name, groupId, organizationId } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const staff = await prisma.staff.create({
      data: {
        group: { connect: { id: groupId } },
        Organization: { connect: { id: organizationId } },
        user: {
          create: {
            email: email,
            password: hashedPassword,
            name: name,
            role: Role.STAFF,
          },
        },
      },
      include: { user: true },
    });
    const { password: _, ...safeUser } = staff.user;
    const safeStaff = { ...staff, user: safeUser };
    return res
      .status(201)
      .json({ message: "Staff Registered", staff: safeStaff });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server Inernal Error" });
  }
};
export const getStaffs = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [staffs, totol] = await Promise.all([
      prisma.staff.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: { user: { omit: { password: true } } },
        where: { organizationId: 1 },
      }),
      prisma.staff.count({ where: { organizationId: 1 } }),
    ]);
    console.timeEnd("Auth Middleware Execution Time");
    return res.status(200).json({
      data: staffs,
      page: pageNumber,
      limit: limitNumber,
      total: totol,
      pages: Math.ceil(totol / limitNumber),
    });
  } catch (e) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
