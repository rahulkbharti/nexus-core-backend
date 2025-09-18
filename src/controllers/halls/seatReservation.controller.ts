import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { connect } from "http2";

// Create Seat Reservation Controller
export const createSeatReservation = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const {
      seatId,
      memberId,
      reservationStartTime,
      reservationEndTime,
      status,
    } = req.body;

    const seatReservation = await prisma.seatReservation.create({
      data: {
        seat: { connect: { id: seatId } },
        member: { connect: { userId: memberId } },
        organization: { connect: { id: req.user.organizationId } },
        reservationStartTime: new Date(reservationStartTime),
        reservationEndTime: new Date(reservationEndTime),
        status,
      },
    });

    return res.status(201).json(seatReservation);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to create seat reservation." });
  }
};

// Get Seat Reservations with Pagination
export const getSeatReservations = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * pageSize;

    const [reservations, total] = await Promise.all([
      prisma.seatReservation.findMany({
        where: { organizationId: req.user.organizationId },
        skip,
        take: pageSize,
        orderBy: { reservationStartTime: "desc" },
      }),
      prisma.seatReservation.count({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    return res.status(200).json({
      data: reservations,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch seat reservations." });
  }
};

// Update Seat Reservation
export const updateSeatReservation = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const {
      seatId,
      memberId,
      reservationStartTime,
      reservationEndTime,
      status,
    } = req.body;

    const updatedReservation = await prisma.seatReservation.updateMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
      data: {
        seatId,
        memberId,
        reservationStartTime: reservationStartTime
          ? new Date(reservationStartTime)
          : undefined,
        reservationEndTime: reservationEndTime
          ? new Date(reservationEndTime)
          : undefined,
        status,
      },
    });

    if (updatedReservation.count === 0) {
      return res.status(404).json({ message: "Seat reservation not found." });
    }

    const reservation = await prisma.seatReservation.findUnique({
      where: { id: Number(id) },
    });

    return res.status(200).json(reservation);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update seat reservation." });
  }
};

// Delete Seat Reservation
export const deleteSeatReservation = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;

    const deleted = await prisma.seatReservation.deleteMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Seat reservation not found." });
    }

    return res
      .status(200)
      .json({ message: "Seat reservation deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete seat reservation." });
  }
};
