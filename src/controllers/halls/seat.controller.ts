import type { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createSeat = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { hallId } = req.params;
  const { seatNumber, seatType, status } = req.body;
  const organizationId = req.user.OrganizationId;

  if (!hallId || !seatNumber || !seatType || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Optionally, verify hall belongs to organizationId
    const hall = await prisma.hall.findFirst({
      where: { id: Number(hallId), organizationId },
    });

    if (!hall) {
      return res
        .status(404)
        .json({ message: "Hall not found or not accessible" });
    }

    const seat = await prisma.seat.create({
      data: {
        hallId: Number(hallId),
        seatNumber,
        seatType,
        status,
      },
    });

    return res.status(201).json(seat);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getSeatsByHall = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { hallId } = req.params;
  const organizationId = req.user.OrganizationId;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.limit) || 10;

  if (!hallId) {
    return res.status(400).json({ message: "Missing hallId parameter" });
  }

  try {
    const hall = await prisma.hall.findFirst({
      where: { id: Number(hallId), organizationId },
    });

    if (!hall) {
      return res
        .status(404)
        .json({ message: "Hall not found or not accessible" });
    }

    const totalSeats = await prisma.seat.count({
      where: { hallId: Number(hallId) },
    });

    const seats = await prisma.seat.findMany({
      where: { hallId: Number(hallId) },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { seatNumber: "asc" },
    });

    return res.status(200).json({
      message: "Seats fetched successfully",
      seats,
      pagination: {
        total: totalSeats,
        page,
        pageSize,
        totalPages: Math.ceil(totalSeats / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateSeat = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { seatId } = req.params;
  const { seatNumber, seatType, status } = req.body;
  const organizationId = req.user.OrganizationId;

  if (!seatId) {
    return res.status(400).json({ message: "Missing seatId parameter" });
  }

  try {
    const seat = await prisma.seat.findUnique({
      where: { id: Number(seatId) },
    });

    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // Verify hall belongs to organization
    const hall = await prisma.hall.findFirst({
      where: { id: seat.hallId, organizationId },
    });

    if (!hall) {
      return res
        .status(403)
        .json({ message: "Forbidden: Hall not accessible" });
    }

    const updatedSeat = await prisma.seat.update({
      where: { id: Number(seatId) },
      data: {
        seatNumber,
        seatType,
        status,
      },
    });

    return res.status(200).json(updatedSeat);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteSeat = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { seatId } = req.params;
  const organizationId = req.user.OrganizationId;

  if (!seatId) {
    return res.status(400).json({ message: "Missing seatId parameter" });
  }

  try {
    const seat = await prisma.seat.findUnique({
      where: { id: Number(seatId) },
    });

    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // Verify hall belongs to organization
    const hall = await prisma.hall.findFirst({
      where: { id: seat.hallId, organizationId },
    });

    if (!hall) {
      return res
        .status(403)
        .json({ message: "Forbidden: Hall not accessible" });
    }

    await prisma.seat.delete({
      where: { id: Number(seatId) },
    });

    return res.status(200).json({ message: "Seat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
