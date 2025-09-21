import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Role } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
import generateStrongPassword from "../../utils/passwordGenerator";
import { welcomeStaff } from "../../services/authEmailService";
import { permission } from "node:process";
// import { sendRegistrationCredential } from "../../services/emailService";

// Create Staff
export const registerStaff = async (req: Request, res: Response) => {
  // console.log("registering Staff");
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { email, name, roleId = 0, permissions } = req.body;
    const password = generateStrongPassword(8);
    const hashedPassword = bcrypt.hashSync(password, 10);
    const permissionIds = permissions.map((p: any) =>
      typeof p === "number" ? p : p.id
    );

    const staff = await prisma.staff.create({
      data: {
        role: { connect: { id: roleId } },
        organization: { connect: { id: req.user.organizationId } },
        user: {
          create: {
            email: email,
            password: hashedPassword,
            name: name,
            role: Role.STAFF,
          },
        },
        permissions: {
          connect: permissionIds.map((id: number) => ({ id })),
        },
      },
      include: { user: true, permissions: true },
    });
    const { password: _, ...safeUser } = staff.user;
    const safeStaff = { ...staff, user: safeUser };
    // console.log({ name, email, password });
    // Sending Welcome Email to Staff
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
    });
    const orgName = org?.name || "Your Organization";
    const orgAddress = org?.address || "Organization Address";
    // console.log(safeMember);
    // console.log({ name, email, password });
    welcomeStaff({
      name,
      email,
      role: "STAFF",
      orgName,
      orgAddress,
      password,
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    return res
      .status(201)
      .json({ message: "Staff Registered", staff: safeStaff });
  } catch (error: unknown) {
    console.log(error);
    if (typeof error === "object" && error !== null && "code" in error) {
      if ((error as any).code === "P2002") {
        res.status(400).json({ messsage: "Email Already Registed" });
        return;
      }
      if ((error as any).code === "P2025") {
        res.status(404).json({
          message:
            "Related record not found { check roleId and organizationID }",
        });
        return;
      }
    }
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};

// Get All staffs
export const getStaffs = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { page = "1", limit = "10", role = "0" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const roleNumber = parseInt(role as string, 10);

    const [staffs, total] = await Promise.all([
      prisma.staff.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: {
          user: { omit: { password: true } },
          permissions: true,
          role: true,
        },
        where: {
          organizationId: req.user.organizationId,
          ...(roleNumber && roleNumber !== 0 ? { roleId: roleNumber } : {}),
        },
      }),
      prisma.staff.count({
        where: {
          organizationId: req.user.organizationId,
          ...(roleNumber && roleNumber !== 0 ? { roleId: roleNumber } : {}),
        },
      }),
    ]);
    // console.timeEnd("Auth Middleware Execution Time");
    return res.status(200).json({
      data: staffs,
      page: pageNumber,
      limit: limitNumber,
      total: total,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (e) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};

// Get Staff By Id
export const getStaffById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.params;
    const staff = await prisma.staff.findUnique({
      where: {
        userId: Number(userId),
        organizationId: req.user.organizationId,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    return res.status(200).json({ staff });
  } catch (e) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Get Staff By Name
export const getStaffByName = async (req: Request, res: Response) => {
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
    const staffs = await prisma.staff.findMany({
      where: {
        organizationId: req.user.organizationId,
        user: { name: { contains: name as string, mode: "insensitive" } },
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    return res.status(200).json({ staffs });
  } catch (e) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Update Staff
export const updateStaff = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.params;
    const { name, email, roleId, permissions } = req.body;
    const permissionIds = permissions.map((p: any) =>
      typeof p === "number" ? p : p.id
    );
    const staff = await prisma.staff.update({
      where: {
        userId: Number(userId),
        organizationId: req.user.organizationId,
      },
      data: {
        role: roleId ? { connect: { id: roleId } } : undefined,
        user: {
          update: {
            name: name,
            email: email,
          },
        },
        permissions: {
          set: permissionIds.map((id: number) => ({ id })),
        },
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    return res.status(200).json({ message: "Staff updated", staff });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Staff not found" });
    }
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Delete Staff
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.params;
    await prisma.staff.delete({
      where: {
        userId: Number(userId),
        organizationId: req.user.organizationId,
      },
    });
    return res.status(200).json({ message: "Staff deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Staff not found" });
    }
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
