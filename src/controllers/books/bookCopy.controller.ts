import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
export const CreateBookCopy = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    console.log(req.params.id);
    if (id === undefined) {
      return res.status(400).json({ message: "Book ID is required" });
    }
    const { barcode, status, dateAcquired, location, condition } = req.body;

    if (!barcode || !status || !dateAcquired || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBookCopy = await prisma.bookCopy.create({
      data: {
        book: { connect: { id: Number(id) } },
        barcode,
        status,
        dateAcquired: new Date(dateAcquired),
        location,
        condition,
      },
    });

    res.status(201).json({
      message: "Book copy created successfully",
      bookCopy: newBookCopy,
    });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetAllBookCopies = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookCopies, total] = await Promise.all([
      prisma.bookCopy.findMany({
        skip,
        take: limit,
        where: { book: { organizationId: req.user.organizationId } },
      }),
      prisma.bookCopy.count(),
    ]);

    res.json({
      data: bookCopies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetBookCopy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookCopy = await prisma.bookCopy.findUnique({
      where: { id: Number(id) },
    });
    if (!bookCopy) {
      return res.status(404).json({ message: "Book copy not found" });
    }
    res.json(bookCopy);
  } catch (error: unknown) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UpdateBookCopy = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { copyId } = req.params;
    // console.log(req.params.copyId);
    if (copyId === undefined) {
      return res.status(400).json({ message: "Book Copy ID is required" });
    }
    const { barcode, status, dateAcquired, location, condition } = req.body;

    const updatedBookCopy = await prisma.bookCopy.update({
      where: { id: Number(copyId) },
      data: {
        barcode,
        status,
        dateAcquired: dateAcquired ? new Date(dateAcquired) : undefined,
        location,
        condition,
      },
    });

    res.json({
      message: "Book copy updated successfully",
      bookCopy: updatedBookCopy,
    });
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Book copy not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteBookCopy = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { copyId } = req.params;
    await prisma.bookCopy.delete({
      where: { id: Number(copyId) },
    });
    res.json({ message: "Book copy deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Book copy not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
