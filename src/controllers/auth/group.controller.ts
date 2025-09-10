import type { Request, Response } from "express";
import prisma from "../../utils/prisma";

// Create Group
export const groupCreate = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    const group = await prisma.staffGroup.create({
      data: {
        name,
        organizationId: req.user.organizationId,
      },
    });
    return res.status(201).json({ message: "Group Created", group });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
//Get All Groups
export const getGroups = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [groups, total] = await Promise.all([
      prisma.staffGroup.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        where: { organizationId: req.user.organizationId },
      }),
      prisma.staffGroup.count({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    return res.status(200).json({
      data: groups,
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
// Get Group by id
export const getGroupById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const group = await prisma.staffGroup.findFirst({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.status(200).json({ group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

// Update Group
export const updateGroup = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const { name } = req.body;
    const group = await prisma.staffGroup.updateMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
      data: { name },
    });
    if (group.count === 0) {
      return res
        .status(404)
        .json({ message: "Group not found or not updated" });
    }
    return res.status(200).json({ message: "Group updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

// Delete Group
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const group = await prisma.staffGroup.deleteMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });
    if (group.count === 0) {
      return res
        .status(404)
        .json({ message: "Group not found or not deleted" });
    }
    return res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
