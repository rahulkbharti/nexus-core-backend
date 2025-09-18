import type { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const CreateBookReservation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { bookCopyId, memberId, holdUntilDate } = req.body;

    const reservation = await prisma.bookReservation.create({
      data: {
        bookCopy: { connect: { id: bookCopyId } },
        member: { connect: { userId: memberId } },
        organization: { connect: { id: req.user.organizationId } },
        holdUntilDate: new Date(holdUntilDate),
      },
    });

    return res.status(201).json(reservation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create reservation", error });
  }
};

export const GetAllBookReservations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const [reservations, total] = await Promise.all([
      prisma.bookReservation.findMany({
        where: {
          organizationId: req.user.organizationId,
        },
        include: {
          bookCopy: true,
          member: true,
        },
        skip,
        take: pageSize,
      }),
      prisma.bookReservation.count({
        where: {
          organizationId: req.user.organizationId,
        },
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
      .json({ message: "Failed to fetch reservations", error });
  }
};

export const UpdateBookReservation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const { holdUntilDate } = req.body;

    const reservation = await prisma.bookReservation.updateMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
      data: {
        holdUntilDate,
      },
    });

    if (reservation.count === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const updatedReservation = await prisma.bookReservation.findUnique({
      where: { id: Number(id) },
      include: { bookCopy: true, member: true },
    });

    return res.status(200).json(updatedReservation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update reservation", error });
  }
};

export const DeleteBookReservation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;

    const reservation = await prisma.bookReservation.deleteMany({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });

    if (reservation.count === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    return res.status(200).send({ message: "Reservation deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete reservation", error });
  }
};
