import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Role } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";

export const registerMember = async (req: Request, res: Response) => {
  try {
    const { email, name, password, organizationId } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const member = await prisma.member.create({
      data: {
        Organization: { connect: { id: organizationId } },
        user: {
          create: {
            email,
            name,
            password: hashedPassword,
            role: Role.MEMBER,
          },
        },
      },
      include: { user: true },
    });
    const { password: _, ...safeUser } = member.user;
    const safeMember = { ...member, user: safeUser };
    console.log(safeMember);

    return res
      .status(201)
      .json({ message: "Member Registered", member: safeMember });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server Inernal Error" });
  }
};

export const getMemmbers = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [members, totol] = await Promise.all([
      prisma.member.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: { user: { omit: { password: true } } },
        where: { organizationId: 1 },
      }),
      prisma.member.count({ where: { organizationId: 1 } }),
    ]);

    return res.status(200).json({
      data: members,
      page: pageNumber,
      limit: limitNumber,
      total: totol,
      pages: Math.ceil(totol / limitNumber),
    });
  } catch (e) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
