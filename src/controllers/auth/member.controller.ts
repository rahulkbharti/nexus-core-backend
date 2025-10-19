import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Role } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
import generateStrongPassword from "../../utils/passwordGenerator";
import { welcomeMember } from "../../services/authEmailService";
// import { welcomeMember } from "../../services/authEmailService";
// import { welcomeMember, welcomeStaff } from "../../services/authEmailService";

// Create member
export const registerMember = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { email, name } = req.body;
    const password = generateStrongPassword(8);
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { member, fees } = await prisma.$transaction(async (tx) => {
      // Any additional operations can be added here
      //Step 1 : create member account and then
      const member = await tx.member.create({
        data: {
          organization: { connect: { id: req.user.organizationId } },
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
      // Step 2: create a membership fees
      const fees = await tx.fee.create({
        data: {
          member: { connect: { userId: member.userId } },
          organization: { connect: { id: req.user.organizationId } },
          amount: 400,
          balance: 0,
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // one month from now
          description: "Monthly Membership Fee",
          type: "MEMBERSHIP",
        },
      });
      return { member, fees };
    });
    const { password: _, ...safeUser } = member.user;
    const safeMember = { ...member, user: safeUser };
    // Fetch organization details
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
    });
    const orgName = org?.name || "Your Organization";
    const orgAddress = org?.address || "Organization Address";
    // console.log(safeMember);
    // console.log({ name, email, password });
    await welcomeMember({ name, email, orgName, orgAddress, password }).catch(
      (err) => {
        console.error("Failed to send welcome email:", err);
      }
    );
    return res
      .status(201)
      .json({ message: "Member Registered", member: safeMember });
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
// Get all member
export const getMemmbers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { userId: "desc" },
        include: { user: { omit: { password: true } } },
        where: { organizationId: req.user.organizationId },
      }),
      prisma.member.count({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    return res.status(200).json({
      data: members,
      page: pageNumber,
      limit: limitNumber,
      total: total,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (e) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};

// Get Member By ID
export const getMemberById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.params;
    const member = await prisma.member.findUnique({
      where: {
        userId: Number(userId),
        organizationId: req.user.organizationId,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    return res.status(200).json({ member });
  } catch (e) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Get Member By Name
export const getMemberByName = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.query;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }
    const members = await prisma.member.findMany({
      where: {
        organizationId: req.user.organizationId,
        user: { name: { contains: name as string, mode: "insensitive" } },
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    return res.status(200).json({ members });
  } catch (e) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Update member
export const updateMember = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.params;
    const { email, name } = req.body;
    const member = await prisma.member.findUnique({
      where: {
        userId: Number(userId),
        organizationId: req.user.organizationId,
      },
      include: { user: true },
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const updatedMember = await prisma.member.update({
      where: { userId: Number(userId) },
      data: {
        user: {
          update: {
            email: email ?? member.user.email,
            name: name ?? member.user.name,
          },
        },
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    return res
      .status(200)
      .json({ message: "Member updated", member: updatedMember });
  } catch (e) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Delete member
export const deleteMember = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.params;
    const member = await prisma.member.findUnique({
      where: {
        userId: Number(userId),
        organizationId: req.user.organizationId,
      },
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    await prisma.member.delete({
      where: { userId: Number(userId) },
    });
    return res.status(200).json({ message: "Member deleted" });
  } catch (e) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
