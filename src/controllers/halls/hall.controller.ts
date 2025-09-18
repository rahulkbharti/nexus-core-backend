import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
// Create a new hall
export const createHall = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { name, description, totalCapacity } = req.body;
    const organizationId = req.user.organizationId;
    const hall = await prisma.hall.create({
      data: {
        name,
        description,
        totalCapacity,
        organizationId,
      },
    });
    res.status(201).json({ message: "Hall created successfully", hall });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create hall" });
  }
};

// Get all halls
export const getHalls = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const organizationId = req.user.organizationId;
    const halls = await prisma.hall.findMany({
      where: { organizationId },
      include: { seats: true },
    });
    res.json({ message: "Halls fetched successfully", halls });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch halls" });
  }
};

// Get a hall by ID
export const getHallById = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const hall = await prisma.hall.findFirst({
      where: { id: Number(id), organizationId },
    });
    if (!hall) {
      return res.status(404).json({ error: "Hall not found" });
    }
    res.json(hall);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hall" });
  }
};

// Update a hall
export const updateHall = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const { name, description, totalCapacity } = req.body;
    const organizationId = req.user.organizationId;
    // Ensure hall belongs to user's organization
    const hall = await prisma.hall.findFirst({
      where: { id: Number(id), organizationId },
    });
    if (!hall) {
      return res.status(404).json({ error: "Hall not found" });
    }
    const updatedHall = await prisma.hall.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        totalCapacity,
        organizationId,
      },
    });
    res.json(updatedHall);
  } catch (error) {
    res.status(500).json({ error: "Failed to update hall" });
  }
};

// Delete a hall
export const deleteHall = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    // Ensure hall belongs to user's organization
    const hall = await prisma.hall.findFirst({
      where: { id: Number(id), organizationId },
    });
    if (!hall) {
      return res.status(404).json({ error: "Hall not found" });
    }
    await prisma.hall.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete hall" });
  }
};
