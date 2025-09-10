import { type Request, type Response } from "express";
import prisma from "../../utils/prisma";

// Create Organization
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
// Get All Oranization
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

// Get Organization by id
export const getOrgById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const org = await prisma.organization.findUnique({
      where: { id: Number(id) },
    });
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }
    return res.status(200).json(org);
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Update Organization
export const updateOrg = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, adminUserId } = req.body;
    const org = await prisma.organization.update({
      where: { id: Number(id) },
      data: { name, address, adminUserId },
    });
    return res
      .status(200)
      .json({ message: "Organization updated successfully", org });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Not Found") {
      return res.status(404).json({ message: "Organization not found" });
    }
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

// Delete Organization
export const deleteOrg = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.organization.delete({
      where: { id: Number(id) },
    });
    return res
      .status(200)
      .json({ message: "Organization deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Not Found") {
      return res.status(404).json({ message: "Organization not found" });
    }
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
