import { type Request, type Response } from "express";
import prisma from "../../utils/prisma.ts";

export const createOrg = async (req: Request, res: Response) => {
  try {
    const { name, address, adminUserId } = req.body;
    const org = await prisma.organization.create({
      data: {
        name: name,
        address: address,
        adminUserId: adminUserId,
      },
    });
    // Perform organization creation logic here
    res.status(201).json({ message: "Organization created successfully", org });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
export const getOrgs = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const [orgs, totol] = await Promise.all([
      prisma.organization.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      prisma.organization.count({}),
    ]);

    return res.status(200).json({
      data: orgs,
      page: pageNumber,
      limit: limitNumber,
      total: totol,
      pages: Math.ceil(totol / limitNumber),
    });
  } catch (error) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
