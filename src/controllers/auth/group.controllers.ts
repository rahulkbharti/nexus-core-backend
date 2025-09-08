import type { Request, Response } from "express";
import prisma from "../../utils/prisma.ts";

export const groupCreate = async (req: Request, res: Response) => {
  try {
    const { name, organizationId } = req.body;
    const group = await prisma.staffGroup.create({
      data: {
        name,
        organizationId,
      },
    });
    return res.status(201).json({ message: "Group Created", group });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
export const getGroups = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [groups, totol] = await Promise.all([
      prisma.staffGroup.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      prisma.staffGroup.count({}),
    ]);

    return res.status(200).json({
      data: groups,
      page: pageNumber,
      limit: limitNumber,
      total: totol,
      pages: Math.ceil(totol / limitNumber),
    });
  } catch (error) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
