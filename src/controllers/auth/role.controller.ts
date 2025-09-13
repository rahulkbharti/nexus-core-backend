import type { Request, Response } from "express";
import prisma from "../../utils/prisma";

// Create Role
export const createRole = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    console.log(req.user.organizationId, name);
    const role = await prisma.staffRole.create({
      data: {
        name,
        organizationId: req.user.organizationId,
      },
    });
    return res.status(201).json({ message: "role Created", role });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
//Get All Roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [roles, total] = await Promise.all([
      prisma.staffRole.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        where: { organizationId: req.user.organizationId },
      }),
      prisma.staffRole.count({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    return res.status(200).json({
      data: roles,
      page: pageNumber,
      limit: limitNumber,
      total: total,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
// Get Role by id
export const getRoleById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const role = await prisma.staffRole.findFirst({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });
    if (!role) {
      return res.status(404).json({ message: "role not found" });
    }
    return res.status(200).json({ role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

// Update Role
export const updateRole = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const { name } = req.body;
    const role = await prisma.staffRole.updateMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
      data: { name },
    });
    if (role.count === 0) {
      return res.status(404).json({ message: "Role not found or not updated" });
    }
    return res.status(200).json({ message: "Role updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

// Delete Role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const role = await prisma.staffRole.deleteMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });
    if (role.count === 0) {
      return res
        .status(404)
        .json({ message: "Role not found or not deleted" });
    }
    return res.status(200).json({ message: "Role deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
